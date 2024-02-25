import { UserDomain } from '@/domains/user'
import type { Context } from '@/global'
import { googleAuth } from '@hono/oauth-providers/google'
import type { Next } from 'hono'
import { env } from 'hono/adapter'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'

export const authMiddlewares = {
  /**
   * cookieから認証状態を確認し、コンテキストにユーザー情報をセットする
   */
  async authorize(c: Context, next: Next) {
    const profileIds = await getProfileIds(c)

    if (!Object.keys(profileIds).length) {
      return next()
    }

    const userDomain = new UserDomain(c)
    const user = await userDomain.getUserByProfileId(profileIds)

    if (!user) {
      return next()
    }
    c.set('currentUser', user)
    return next()
  },
  /**
   * authorizeと同じ処理だが、
   * ログインしていない場合にエラーを投げる
   */
  async authorizeWithError(c: Context, next: Next) {
    const profileIds = await getProfileIds(c)

    if (!Object.keys(profileIds).length) {
      throw new HTTPException(401, { message: 'Unauthorized' })
    }

    const userDomain = new UserDomain(c)
    const user = await userDomain.getUserByProfileId(profileIds)

    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' })
    }
    c.set('currentUser', user)
    await next()
  },
  /**
   *
   * 認証情報を削除する
   */
  signOut(c: Context, next: Next) {
    deleteCookie(c, 'googleAuthToken')
    next()
  },

  /**
   * Google認証を行い、成功したらアクセストークンをコンテキストにセットする
   * https://github.com/honojs/middleware/blob/main/packages/oauth-providers/src/providers/google/googleAuth.ts
   */
  async signInWithGoogle(c: Context, next: Next) {
    const handler = googleAuth({
      client_id: env(c).GOOGLE_AUTH_CLIENT_ID,
      client_secret: env(c).GOOGLE_AUTH_CLIENT_SECRET,
      scope: ['openid', 'email', 'profile'],
    })
    return await handler(c, next)
  },
  /**
   * Google認証後に呼び出す処理
   * コンテキストから取得したアクセストークンをcookieにセットする
   * また、新規ユーザーの場合はユーザー情報をDB登録する
   */
  async afterSignInWithGoogle(c: Context, next: Next) {
    const token = c.get('token')
    const googleUser = c.get('user-google')

    if (!token) {
      throw new HTTPException(401, { message: 'Unauthorized' })
    }
    // cookieにアクセストークンをセットする
    setCookie(c, 'googleAuthToken', token.token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: true,
      path: '/',
    })
    // ユーザー情報をDB登録する。登録済みの場合はスキップ。
    const userDomain = new UserDomain(c)

    await userDomain.createUser({
      googleProfileId: googleUser?.id,
      accountId: `${googleUser?.email?.split('@')[0].replace(/\./g, '')}`,
      displayName: googleUser?.name ?? 'anonymous',
    })

    return await next()
  },
}

/**
 * 認証プロバイダーのプロファイルIDを取得する
 */
async function getProfileIds(c: Context) {
  const googleProfileId = (await getGoogleProfile(c))?.sub

  return { googleProfileId }
}

/**
 * cookieのアクセストークンからGoogle認証情報を取得する
 */
async function getGoogleProfile(c: Context) {
  const token = getCookie(c, 'googleAuthToken')
  if (!token) {
    return null
  }

  return await getTokenInfo(token).catch((e) => {
    deleteCookie(c, 'googleAuthToken')
    return null
  })
}

/**
 * Googleの認証情報を取得する
 * https://cloud.google.com/docs/authentication/token-types?hl=ja#access-contents
 * @param {string} accessToken cookieに保存しているGoogleのアクセストークン
 */
async function getTokenInfo(accessToken: string | undefined): Promise<{
  aud: string
  user_id?: string
  scopes: string[]
  expiry_date: number
  sub?: string
  azp?: string
  access_type?: string
  email?: string
  email_verified?: boolean
}> {
  return await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`,
  ).then((res) => res.json())
}

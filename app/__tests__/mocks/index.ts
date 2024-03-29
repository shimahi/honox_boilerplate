import { jest } from 'bun:test'
import type { Context } from '@/global'

/**
 * @description
 * テストで用いるモックデータのうち、共通で用いるものを定義
 * 各種クラスオブジェクトのモックと、コンストラクタ引数のContextを定義する
 */

// Honoサーバーでreq/resを扱うためのコンテキストオブジェクトのモック
export const contextMock: Context = {
  env: {
    DB: undefined as unknown,
    NAME: undefined as unknown,
  } as Context['env'],
  get: jest.fn(),
  set: jest.fn(),
  req: {
    param: jest.fn(),
  },
} as unknown as Context
// Honoサーバーで返すコールバック第二引数nextのモック
export const nextMock = jest.fn()
// jest.fnの戻り値型、contextMockのメソッドをキャストするのに使用する
export type MockFn = ReturnType<typeof jest.fn>

/**
 * リポジトリ層のモック
 */
export const userRepositoryMock = {
  createUser: jest.fn(),
  getUsers: jest.fn(),
  getUser: jest.fn(),
  getUserByGoogleProfileId: jest.fn(),
}
export const postRepositoryMock = {
  createPost: jest.fn(),
  paginatePosts: jest.fn(),
  paginatePostsByUserId: jest.fn(),
  getPost: jest.fn(),
  deletePost: jest.fn(),
}

/**
 * ドメイン層のモック
 */
export const userDomainMock = {
  repository: userRepositoryMock,
  createUser: jest.fn(),
  getUserByProfileIds: jest.fn(),
}
export const postDomainMock = {
  repository: postRepositoryMock,
  createPost: jest.fn(),
  paginatePosts: jest.fn(),
  paginatePostsByUserId: jest.fn(),
  getPost: jest.fn(),
}

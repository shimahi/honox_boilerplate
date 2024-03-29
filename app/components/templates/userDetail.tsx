import Header from '@/components/header'
import OwnPostBox from '@/islands/ownPostBox'
import type { Post, User } from '@/schemas'
import { css } from 'hono/css'
import PostBox from '../features/postBox'

type Props = {
  currentUser: User | null
  user: User
  posts: Post[]
}

export default function UserDetail({ user, posts, currentUser }: Props) {
  return (
    <>
      <Header currentUser={currentUser} />
      <div
        class={css`
          max-width: 960px;
          display: flex;
          flex-direction: column;
          margin: auto;
          padding-top: 1rem;
          padding-bottom: 2rem;
          padding-left: 1rem;
          padding-right: 1rem;
          @media (min-width: 640px) {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        `}
      >
        <p>{user.accountId}</p>
        <h3>{user.displayName}</h3>
        <div
          class={css`
            margin-top: 36px;
          `}
        >
          {posts?.map((post) =>
            post.userId === currentUser?.id ? (
              <OwnPostBox post={post} />
            ) : (
              <PostBox post={post} />
            ),
          )}
        </div>
      </div>
    </>
  )
}

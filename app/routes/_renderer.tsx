import { Style, css } from 'hono/css'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Script } from 'honox/server'

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang='en'>
      <head>
        <meta charset='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        {title ? <title>{title}</title> : ''}
        {import.meta.env.PROD ? (
          <link href='/static/style.css' rel='stylesheet' />
        ) : (
          <link href='/app/style.css' rel='stylesheet' />
        )}
        <Style />
        <Script src='/app/client.ts' />
      </head>
      <body>
        <div
          class={css`
            max-width: 760px;
            display: flex;
            flex-direction: column;
            margin: 0 auto;
            padding-top: 3rem;
            padding-bottom: 5rem;
            padding-left: 1rem;
            padding-right: 1rem;
            @media (min-width: 640px) {
              padding-left: 2rem;
              padding-right: 2rem;
            }
          `}
        >
          {children}
        </div>
      </body>
    </html>
  )
})

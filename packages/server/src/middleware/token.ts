import type { Context, Next } from 'hono'

async function tokenMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.text('Invalid token', 401)
  }

  const token = authHeader.split(' ')[1]

  if (token !== c.env.BEARER_TOKEN) {
    return c.text('Invalid token', 401)
  }

  await next()
}

export default tokenMiddleware

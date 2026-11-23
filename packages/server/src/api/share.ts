import { Hono } from 'hono'
import { validator } from 'hono/validator'
import type { HonoTypeUserInformation } from '~/constants/binding'
import { getPageById } from '~/model/page'
import { getSharedPageIdByToken } from '~/model/store'
import result from '~/utils/result'

const app = new Hono<HonoTypeUserInformation>()

app.get(
  '/detail',
  validator('query', (value, c) => {
    if (!value.token || typeof value.token !== 'string') {
      return c.json(result.error(400, 'Token is required'))
    }
    return {
      token: value.token,
    }
  }),
  async (c) => {
    const { token } = c.req.valid('query')
    const pageId = await getSharedPageIdByToken(c.env.DB, token)
    if (pageId === null) {
      return c.json(result.success(null))
    }

    const page = await getPageById(c.env.DB, {
      id: pageId,
      isDeleted: false,
    })
    return c.json(result.success(page ?? null))
  },
)

app.get('/content', async (c) => {
  const token = c.req.query('token')
  if (!token) {
    return c.redirect('/error')
  }

  const pageId = await getSharedPageIdByToken(c.env.DB, token)
  if (pageId === null) {
    return c.redirect('/error')
  }

  const page = await getPageById(c.env.DB, {
    id: pageId,
    isDeleted: false,
  })
  if (!page) {
    return c.redirect('/error')
  }

  const content = await c.env.BUCKET.get(page.contentUrl)
  if (!content) {
    return c.redirect('/error')
  }

  return c.html(await content.text())
})

export default app

import { Hono } from 'hono'
import type { Bindings, HonoTypeUserInformation } from './constants/binding'
import type { Page } from './sql/types'
import pages from '~/api/pages'
import auth from '~/api/auth'
import folders from '~/api/folders'
import tokenMiddleware from '~/middleware/token'

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', tokenMiddleware)
app.use('/shelf', tokenMiddleware)

app.get('/', async (c) => {
  return c.html(
`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="module" src="/static/index.js"></script>
  <link rel="stylesheet" href="/static/index.css">
  <link rel="icon" href="/static/logo.svg" />
  <title>Web Archive</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
  )
})

const api = new Hono<HonoTypeUserInformation>()
api.route('/pages', pages)
api.route('/auth', auth)
api.route('/folders', folders)

// get page content
api.get('/shelf', async (c) => {
  const pageId = c.req.query('pageId')
  console.log(pageId)
  // redirect to 404
  if (!pageId) {
    return c.redirect('/error')
  }

  // todo refactor
  const pageListResult = await c.env.DB.prepare('SELECT * FROM pages WHERE id = ?')
    .bind(pageId)
    .all()
  if (!pageListResult.success) {
    return c.redirect('/error')
  }

  const page = pageListResult.results?.[0] as Page
  if (!page) {
    return c.redirect('/error')
  }

  const content = await c.env.BUCKET.get(page.contentUrl)
  if (!content) {
    return c.redirect('/error')
  }

  return c.html(
    await content?.text(),
  )
})

app.route('/api', api)

export default app

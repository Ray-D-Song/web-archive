import { Hono } from 'hono'
import { validator } from 'hono/validator'
import type { D1Database } from '@cloudflare/workers-types/experimental'
import { queryPage } from '~/model/page'
import type { HonoTypeUserInformation } from '~/constants/binding'
import result from '~/utils/result'

interface Folder {
  id: number
  name: string
}

interface Page {
  id: number
  title: string
  contentUrl: string
  pageUrl: string
  folderId: number
  pageDesc: string
}

async function selectAllFolders(DB: D1Database) {
  const sql = `
    SELECT 
      id,
      name
    FROM folders
    WHERE isDeleted == 0
  `
  const sqlResult = await DB.prepare(sql).all<Folder>()
  if (sqlResult.error) {
    throw sqlResult.error
  }
  return sqlResult.results
}

async function selectAllPages(DB: D1Database) {
  const sql = `
    SELECT
      id,
      title,
      contentUrl AS contentUrl,
      pageUrl AS pageUrl,
      folderId AS folderId,
      pageDesc AS pageDesc
    FROM pages
    WHERE isDeleted == 0
  `
  const sqlResult = await DB.prepare(sql).all<Page>()
  if (sqlResult.error) {
    throw sqlResult.error
  }
  return sqlResult.results
}

async function checkFolderExists(DB: D1Database, name: string): Promise<boolean> {
  const sql = `
    SELECT 
      id
    FROM folders
    WHERE name = ? AND isDeleted == 0
  `
  const sqlResult = await DB.prepare(sql).bind(name).first()
  if (!sqlResult)
    return false
  return true
}

const app = new Hono<HonoTypeUserInformation>()

app.get('/all', async (c) => {
  const folders = await selectAllFolders(c.env.DB)

  return c.json(result.success(folders))
})

app.post(
  '/create',
  validator('json', (value, c) => {
    if (!value.name || typeof value.name !== 'string') {
      return c.json(result.error(400, 'Name is required'))
    }

    return {
      name: value.name as string,
    }
  }),
  async (c) => {
    const json = c.req.valid('json')

    const { name } = json

    const sql = `
      INSERT INTO folders (name)
      VALUES (?)
    `
    const sqlResult = await c.env.DB.prepare(sql).bind(name).run()
    if (sqlResult.error) {
      throw sqlResult.error
    }

    return c.json(result.success(true))
  },
)

app.delete(
  '/delete',
  validator('query', (value, c) => {
    if (!value.id || Number.isNaN(Number(value.id))) {
      return c.json(result.error(400, 'ID is required'))
    }
    return {
      id: Number(value.id),
    }
  }),
  async (c) => {
    const query = c.req.valid('query')

    const { id } = query

    const allPages = await queryPage(c.env.DB, { folderId: id })

    const [folderResult, pageResult] = await c.env.DB.batch([
      c.env.DB.prepare(`
        UPDATE folders
        SET isDeleted = 1
        WHERE id = ?
      `).bind(id),
      c.env.DB.prepare(`
        UPDATE pages
        SET isDeleted = 1
        WHERE folderId = ?
      `).bind(id),
    ])

    if (folderResult.error || pageResult.error) {
      throw folderResult.error || pageResult.error
    }

    if (folderResult.meta.changes === 0 && pageResult.meta.changes === 0) {
      return c.json(result.error(400, 'No changes made'))
    }

    if (folderResult.meta.changes !== 1 || pageResult.meta.changes !== allPages.length) {
      return c.json(result.error(400, 'Some folders or pages are not deleted'))
    }

    return c.json(result.success(true))
  },
)

app.put(
  '/update',
  validator('json', (value, c) => {
    if (!value.id || Number.isNaN(Number(value.id))) {
      return c.json(result.error(400, 'ID is required'))
    }

    if (value.name && typeof value.name !== 'string') {
      return c.json(result.error(400, 'Name must be a string'))
    }

    return {
      id: Number(value.id),
      name: value.name as string | undefined,
    }
  }),
  async (c) => {
    const json = c.req.valid('json')

    const { id, name } = json

    const prepared = c.env.DB.prepare(`
      UPDATE folders
      SET name = ?
      WHERE id = ?
    `).bind(name, id)
    const sqlResult = await prepared.run()
    if (sqlResult.error) {
      throw sqlResult.error
    }

    if (sqlResult.meta.changes === 0) {
      if (!(await checkFolderExists(c.env.DB, name))) {
        return c.json(result.error(400, 'Folder does not exists'))
      }

      // unknown error
      return c.json(result.error(400, 'No changes made'))
    }

    return c.json(result.success(true))
  },
)

export default app

import { Hono } from 'hono'
import { validator } from 'hono/validator'
import type { D1Database } from '@cloudflare/workers-types/experimental'
import { isNotNil, isNumberString } from '@web-archive/shared/utils'
import type { HonoTypeUserInformation } from '~/constants/binding'
import result from '~/utils/result'
import type { Page } from '~/sql/types'
import { deletePageById, queryDeletedPage, queryPage, selectDeletedPageTotalCount, selectPageTotalCount } from '~/model/page'

const app = new Hono<HonoTypeUserInformation>()

interface InsertPageOptions {
  title: string
  pageDesc: string
  pageUrl: string
  contentUrl: string
  folderId: number
}

async function insertPage(DB: D1Database, pageOptions: InsertPageOptions) {
  const { title, pageDesc, pageUrl, contentUrl, folderId } = pageOptions
  const insertResult = await DB
    .prepare(
      'INSERT INTO pages (title, pageDesc, pageUrl, contentUrl, folderId) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(title, pageDesc, pageUrl, contentUrl, folderId)
    .run()
  return insertResult.error
}

async function getPage(DB: D1Database, id: number) {
  const sql = `
    SELECT
      *
    FROM pages
    WHERE id = ?
    AND isDeleted = 0
  `
  return await DB.prepare(sql).bind(id).first<Page>()
}

app.post(
  '/upload_new_page',
  validator('form', (value) => {
    if (!value.title || typeof value.title !== 'string') {
      return 'Title is required'
    }
    if (typeof value.pageDesc !== 'string') {
      return 'Description is required'
    }
    if (!value.pageUrl || typeof value.pageUrl !== 'string') {
      return 'URL is required'
    }
    if (!value.pageFile) {
      return 'File is required'
    }
    if (!value.folderId || Number.isNaN(Number(value.folderId))) {
      return 'Folder id should be a number'
    }

    return {
      title: value.title,
      pageDesc: value.pageDesc,
      pageUrl: value.pageUrl,
      pageFile: value.pageFile,
      folderId: Number(value.folderId),
    }
  }),
  async (c) => {
    const formData = c.req.valid('form')
    if (typeof formData === 'string') {
      return c.json({ status: 'error', message: formData })
    }
    const { title, pageDesc, pageUrl, pageFile, folderId } = formData
    const contentUrl = crypto.randomUUID()

    let fileArraybuffer: ArrayBuffer
    if (typeof pageFile === 'string') {
      const encoder = new TextEncoder()
      fileArraybuffer = encoder.encode(pageFile).buffer
    }
    else {
      fileArraybuffer = await pageFile.arrayBuffer()
    }
    const uploadFileResult = await c.env.BUCKET.put(contentUrl, fileArraybuffer)
    if (uploadFileResult === null) {
      return c.json({ status: 'error', message: 'Failed to upload file' })
    }
    const insertPageResult = await insertPage(c.env.DB, {
      title,
      pageDesc,
      pageUrl,
      contentUrl,
      folderId,
    })
    if (!insertPageResult) {
      return c.json(result.success(null))
    }
    return c.json(result.error(500, 'Failed to insert page'))
  },
)

app.post(
  '/query',
  validator('json', (value, c) => {
    if (!value.folderId || Number.isNaN(Number(value.folderId))) {
      return c.json(result.error(400, 'Folder ID is required'))
    }

    if (value.pageNumber && !isNumberString(value.pageNumber)) {
      return c.json(result.error(400, 'Page number should be a number'))
    }

    if (value.pageSize && !isNumberString(value.pageSize)) {
      return c.json(result.error(400, 'Page size should be a number'))
    }

    return {
      folderId: Number(value.folderId),
      pageNumber: isNotNil(value.pageNumber) ? Number(value.pageNumber) : undefined,
      pageSize: isNotNil(value.pageSize) ? Number(value.pageSize) : undefined,
      keyword: value.keyword,
    }
  }),
  async (c) => {
    const { folderId, pageNumber, pageSize, keyword } = c.req.valid('json')

    const pages = await queryPage(
      c.env.DB,
      { folderId: Number(folderId), pageNumber, pageSize, keyword },
    )
    const total = await selectPageTotalCount(c.env.DB, { folderId: Number(folderId) })
    return c.json(result.success({ list: pages, total }))
  },
)

app.get(
  '/get_page',
  validator('query', (value, c) => {
    if (!value.id || Number.isNaN(Number(value.id))) {
      return c.json(result.error(400, 'ID is required'))
    }
    return {
      id: Number(value.id),
    }
  }),
  async (c) => {
    const { id } = c.req.valid('query')

    const page = await getPage(c.env.DB, id)
    if (page) {
      return c.json(result.success(page))
    }

    return c.json(result.success(null))
  },
)

app.delete(
  '/delete_page',
  validator('query', (value, c) => {
    if (!value.id || Number.isNaN(Number(value.id))) {
      return c.json(result.error(400, 'ID is required'))
    }
    return {
      id: Number(value.id),
    }
  }),
  async (c) => {
    const { id } = c.req.valid('query')

    if (await deletePageById(c.env.DB, id)) {
      return c.json(result.success({ id }))
    }

    return c.json(result.error(500, 'Failed to delete page'))
  },
)

app.put(
  '/update_page',
  validator('json', (value, c) => {
    if (!value.id || Number.isNaN(Number(value.id))) {
      return c.json(result.error(400, 'ID is required'))
    }

    if (!isNumberString(value.folderId)) {
      return c.json(result.error(400, 'Folder ID should be a number'))
    }

    return {
      id: Number(value.id),
      folderId: isNotNil(value.folderId) ? Number(value.folderId) : undefined,
    }
  }),
  async (c) => {
    const { id, folderId } = c.req.valid('json')
    if (isNotNil(folderId)) {
      const updateResult = await c.env.DB.prepare(
        'UPDATE pages SET folderId = ? WHERE id = ?',
      )
        .bind(folderId, id)
        .run()
      if (!updateResult.error) {
        return c.json(result.success(null))
      }
      return c.json(result.error(500, 'Failed to update page'))
    }
    return c.json(result.success(null))
  },
)

app.post(
  '/query_deleted',
  validator('json', (value, c) => {
    if (value.pageNumber && !isNumberString(value.pageNumber)) {
      return c.json(result.error(400, 'Page number should be a number'))
    }

    if (value.pageSize && !isNumberString(value.pageSize)) {
      return c.json(result.error(400, 'Page size should be a number'))
    }

    return {
      pageNumber: isNotNil(value.pageNumber) ? Number(value.pageNumber) : undefined,
      pageSize: isNotNil(value.pageSize) ? Number(value.pageSize) : undefined,
    }
  }),
  async (c) => {
    const { pageNumber = 1, pageSize = 30 } = c.req.valid('json')
    const pages = await queryDeletedPage(c.env.DB, { pageNumber, pageSize })
    const total = await selectDeletedPageTotalCount(c.env.DB)
    return c.json(result.success({ list: pages, total }))
  },
)

export default app

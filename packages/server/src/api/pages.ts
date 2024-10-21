import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { isNil, isNotNil, isNumberString } from '@web-archive/shared/utils'
import type { HonoTypeUserInformation } from '~/constants/binding'
import result from '~/utils/result'
import { clearDeletedPage, deletePageById, getPageById, insertPage, queryDeletedPage, queryPage, restorePage, selectPageTotalCount } from '~/model/page'
import { getFolderById, restoreFolder } from '~/model/folder'
import { getBase64FileFromBucket, saveFileToBucket } from '~/utils/file'

const app = new Hono<HonoTypeUserInformation>()

app.post(
  '/upload_new_page',
  validator('form', (value, c) => {
    if (!value.title || typeof value.title !== 'string') {
      return c.json(result.error(400, 'Title is required'))
    }
    if (value.pageDesc && typeof value.pageDesc !== 'string') {
      return c.json(result.error(400, 'Description should be a string'))
    }
    if (!value.pageUrl || typeof value.pageUrl !== 'string') {
      return c.json(result.error(400, 'URL is required'))
    }
    if (!value.pageFile) {
      return c.json(result.error(400, 'File is required'))
    }
    if (!value.folderId || !isNumberString(value.folderId)) {
      return c.json(result.error(400, 'FolderId id should be a number'))
    }

    return {
      title: value.title,
      pageDesc: value.pageDesc as string,
      pageUrl: value.pageUrl,
      pageFile: value.pageFile,
      folderId: Number(value.folderId),
      screenshot: value.screenshot,
    }
  }),
  async (c) => {
    const { title, pageDesc = '', pageUrl, pageFile, folderId, screenshot } = c.req.valid('form')

    const [contentUrl, screenshotId] = await Promise.all([
      saveFileToBucket(c.env.BUCKET, pageFile),
      saveFileToBucket(c.env.BUCKET, screenshot),
    ])

    if (isNil(contentUrl)) {
      return c.json({ status: 'error', message: 'Failed to upload file' })
    }
    const insertPageResult = await insertPage(c.env.DB, {
      title,
      pageDesc,
      pageUrl,
      contentUrl,
      folderId,
      screenshotId,
    })
    if (insertPageResult) {
      return c.json(result.success(null))
    }
    return c.json(result.error(500, 'Failed to insert page'))
  },
)

app.post(
  '/query',
  validator('json', (value, c) => {
    if (isNil(value.folderId) || !isNumberString(value.folderId)) {
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
    const pageWidthScreenshot = await Promise.all(pages.map(async (page) => {
      const screenshot = await getBase64FileFromBucket(c.env.BUCKET, page.screenshotId, 'image/png')
      return {
        ...page,
        screenshot,
      }
    }))
    const total = await selectPageTotalCount(c.env.DB, { folderId: Number(folderId), keyword })
    return c.json(result.success({ list: pageWidthScreenshot, total }))
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

    const page = await getPageById(c.env.DB, {
      id,
      isDeleted: false,
    })
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
  async (c) => {
    const pages = await queryDeletedPage(c.env.DB)
    return c.json(result.success(pages))
  },
)

app.post(
  '/restore_page',
  validator('json', (value, c) => {
    if (isNil(value.id) || !isNumberString(value.id)) {
      return c.json(result.error(400, 'ID is required and should be a number'))
    }

    if (isNotNil(value.folderId) && !isNumberString(value.folderId)) {
      return c.json(result.error(400, 'Folder ID should be a number'))
    }

    return {
      id: Number(value.id),
      folderId: isNotNil(value.folderId) ? Number(value.folderId) : undefined,
    }
  }),
  async (c) => {
    const { id, folderId } = c.req.valid('json')
    let pageFolderId = folderId
    if (isNil(pageFolderId)) {
      const page = await getPageById(c.env.DB, { id })
      if (isNil(page)) {
        return c.json(result.error(500, 'Page not found'))
      }

      pageFolderId = page.folderId
    }
    const folder = await getFolderById(c.env.DB, { id: pageFolderId })
    if (isNil(folder)) {
      return c.json(result.error(500, 'Folder not found'))
    }
    if (folder.isDeleted) {
      const restoreFolderResult = await restoreFolder(c.env.DB, pageFolderId)
      if (!restoreFolderResult) {
        return c.json(result.error(500, 'Failed to restore folder'))
      }
    }

    if (await restorePage(c.env.DB, id)) {
      return c.json(result.success(null))
    }

    return c.json(result.error(500, 'Failed to restore page'))
  },
)

app.delete(
  '/clear_deleted',
  async (c) => {
    if (await clearDeletedPage(c.env.DB)) {
      return c.json(result.success(null))
    }
  },
)

export default app

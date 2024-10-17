import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { isNil, isNotNil, isNumberString } from '@web-archive/shared/utils'
import { queryPage } from '~/model/page'
import type { HonoTypeUserInformation } from '~/constants/binding'
import result from '~/utils/result'
import { checkFolderExists, deleteFolderById, insertFolder, queryDeletedFolders, restoreFolder, selectAllFolders, selectDeletedFolderTotalCount, updateFolder } from '~/model/folder'

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
    const { name } = c.req.valid('json')

    if (await insertFolder(c.env.DB, name)) {
      return c.json(result.success(true))
    }

    return c.json(result.error(500, 'Failed to create folder'))
  },
)

app.delete(
  '/delete',
  validator('query', (value, c) => {
    if (isNil(value.id) || !isNumberString(value.id)) {
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

    const { folderResult, pageResult } = await deleteFolderById(c.env.DB, id)

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
    if (isNil(value.id) || !isNumberString(value.id)) {
      return c.json(result.error(400, 'ID is required'))
    }

    if (isNil(value.name) || typeof value.name !== 'string') {
      return c.json(result.error(400, 'Name must be a string'))
    }

    return {
      id: Number(value.id),
      name: value.name as string | undefined,
    }
  }),
  async (c) => {
    const { id, name } = c.req.valid('json')

    const sqlResult = await updateFolder(c.env.DB, { id, name })
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

app.post(
  '/query_deleted',
  validator('json', (value, c) => {
    if (isNotNil(value.pageNumber) && !isNumberString(value.pageNumber)) {
      return c.json(result.error(400, 'Page number must be a number'))
    }

    if (isNotNil(value.pageNumber) && !isNumberString(value.pageNumber)) {
      return c.json(result.error(400, 'Page number must be a number'))
    }

    return {
      pageNumber: isNotNil(value.pageNumber) ? Number(value.pageNumber) : undefined,
      pageSize: isNotNil(value.pageSize) ? Number(value.pageSize) : undefined,
    }
  }),
  async (c) => {
    const { pageNumber = 1, pageSize = 14 } = c.req.valid('json')

    const folders = await queryDeletedFolders(c.env.DB, { pageNumber, pageSize })
    const total = await selectDeletedFolderTotalCount(c.env.DB)
    return c.json(result.success({
      list: folders,
      total,
    }))
  },
)

app.post(
  '/restore_folder',
  validator('json', (value, c) => {
    if (isNil(value.id) || !isNumberString(value.id)) {
      return c.json(result.error(400, 'ID is required'))
    }

    return {
      id: Number(value.id),
    }
  }),
  async (c) => {
    const { id } = c.req.valid('json')
    if (await restoreFolder(c.env.DB, id)) {
      return c.json(result.success(true))
    }

    return c.json(result.error(500, 'Failed to restore folder'))
  },
)

export default app

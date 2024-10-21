import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { isNil, isNumberString } from '@web-archive/shared/utils'
import { queryPage } from '~/model/page'
import type { HonoTypeUserInformation } from '~/constants/binding'
import result from '~/utils/result'
import { checkFolderExists, deleteFolderById, insertFolder, queryDeletedFolders, selectAllFolders, updateFolder } from '~/model/folder'

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
  async (c) => {
    const folders = await queryDeletedFolders(c.env.DB)
    return c.json(result.success(folders))
  },
)

export default app

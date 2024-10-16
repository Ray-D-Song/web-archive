import { isNotNil } from '@web-archive/shared/utils'
import type { Page } from '~/sql/types'

async function selectPageTotalCount(DB: D1Database, options: { folderId: number }) {
  const { folderId } = options
  const sql = `
    SELECT COUNT(*) FROM pages
    WHERE folderId = ? AND isDeleted = 0
  `
  const bindParams: (number | string)[] = [folderId]
  const result = await DB.prepare(sql).bind(bindParams).first()
  return result.count
}

async function queryPage(DB: D1Database, options: { folderId: number, pageNumber?: number, pageSize?: number, keyword?: string }) {
  const { folderId, pageNumber, pageSize, keyword } = options
  let sql = `
    SELECT
      id,
      title,
      contentUrl,
      pageUrl,
      folderId,
      pageDesc,
      createdAt,
      updatedAt
    FROM pages
    WHERE folderId = ? AND isDeleted = 0
  `
  const bindParams: (number | string)[] = [folderId]

  if (keyword) {
    sql += ` AND title LIKE ?`
    bindParams.push(`%${keyword}%`)
  }

  sql += ` ORDER BY createdAt DESC`

  if (isNotNil(pageNumber) && isNotNil(pageSize)) {
    sql += ` LIMIT ? OFFSET ?`
    bindParams.push(pageSize)
    bindParams.push((pageNumber - 1) * pageSize)
  }

  const sqlResult = await DB.prepare(sql).bind(...bindParams).all<Page>()
  if (sqlResult.error) {
    throw sqlResult.error
  }
  return sqlResult.results
}

export {
  selectPageTotalCount,
  queryPage,
}

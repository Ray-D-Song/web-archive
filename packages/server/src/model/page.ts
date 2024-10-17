import { isNotNil } from '@web-archive/shared/utils'
import type { D1Database } from '@cloudflare/workers-types/experimental'
import type { Page } from '~/sql/types'

async function selectPageTotalCount(DB: D1Database, options: { folderId: number }) {
  const { folderId } = options
  const sql = `
    SELECT COUNT(*) as count FROM pages
    WHERE folderId = ? AND isDeleted = 0
  `
  const bindParams: (number | string)[] = [folderId]
  const result = await DB.prepare(sql).bind(...bindParams).first()
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

async function selectDeletedPageTotalCount(DB: D1Database) {
  const sql = `
    SELECT COUNT(*) as count FROM pages
    WHERE isDeleted = 1
  `
  const result = await DB.prepare(sql).first()
  return result.count
}

async function queryDeletedPage(DB: D1Database, options: { pageNumber: number, pageSize: number }) {
  const { pageNumber, pageSize } = options
  const sql = `
    SELECT
      id,
      title,
      contentUrl,
      pageUrl,
      folderId,
      pageDesc,
      createdAt,
      updatedAt,
      deletedAt
    FROM pages
    WHERE isDeleted = 1
    ORDER BY updatedAt DESC
    LIMIT ? OFFSET ?
  `
  const bindParams: (number | string)[] = [pageSize, (pageNumber - 1) * pageSize]
  const result = await DB.prepare(sql).bind(...bindParams).all<Page>()
  return result.results
}

async function deletePageById(DB: D1Database, pageId: number) {
  const sql = `
    UPDATE pages
    SET 
      isDeleted = 1,
      deletedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `
  const result = await DB.prepare(sql).bind(pageId).run()
  return result.success
}

async function restorePage(DB: D1Database, options: { id: number, folderId: number }) {
  const { id, folderId } = options
  const sql = `
    UPDATE pages
    SET 
      isDeleted = 0,
      folderId = ?
    WHERE id = ?
  `
  const result = await DB.prepare(sql).bind(folderId, id).run()
  return result.success && result.meta.changes > 0
}

async function getPageById(DB: D1Database, options: { id: number, isDeleted?: boolean }) {
  const { id, isDeleted } = options
  const sql = `
    SELECT 
      *
    FROM pages
    WHERE id = ?
  `
  const page = await DB.prepare(sql).bind(id).first<Page>()
  // todo fix type error
  /* console.log(page)
  if (isNotNil(isDeleted) && page?.isDeleted !== Number(isDeleted)) {
    return null
  } */
  return page
}

export {
  selectPageTotalCount,
  queryPage,
  selectDeletedPageTotalCount,
  queryDeletedPage,
  deletePageById,
  restorePage,
  getPageById,
}

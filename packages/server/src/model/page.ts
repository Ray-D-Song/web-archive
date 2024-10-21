import { isNotNil } from '@web-archive/shared/utils'
import type { Page } from '~/sql/types'

async function selectPageTotalCount(DB: D1Database, options: { folderId: number, keyword?: string }) {
  const { folderId, keyword } = options
  let sql = `
    SELECT COUNT(*) as count FROM pages
    WHERE folderId = ? AND isDeleted = 0
  `
  const bindParams: (number | string)[] = [folderId]
  if (keyword) {
    sql += ` AND title LIKE ?`
    bindParams.push(`${keyword}%`)
  }
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
      screenshotId,
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

async function queryDeletedPage(DB: D1Database) {
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
  `
  const result = await DB.prepare(sql).all<Page>()
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

async function restorePage(DB: D1Database, id: number) {
  const sql = `
    UPDATE pages
    SET 
      isDeleted = 0,
      deletedAt = NULL
    WHERE id = ?
  `
  const result = await DB.prepare(sql).bind(id).run()
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
  if (isNotNil(isDeleted) && page?.isDeleted !== Number(isDeleted)) {
    return null
  }
  return page
}

interface InsertPageOptions {
  title: string
  pageDesc: string
  pageUrl: string
  contentUrl: string
  folderId: number
  screenshotId?: string
}

async function insertPage(DB: D1Database, pageOptions: InsertPageOptions) {
  const { title, pageDesc, pageUrl, contentUrl, folderId, screenshotId = null } = pageOptions
  const insertResult = await DB
    .prepare(
      'INSERT INTO pages (title, pageDesc, pageUrl, contentUrl, folderId, screenshotId) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(title, pageDesc, pageUrl, contentUrl, folderId, screenshotId)
    .run()
  return insertResult.success
}

async function clearDeletedPage(DB: D1Database) {
  const sql = `
    DELETE FROM pages WHERE isDeleted = 1
  `
  const result = await DB.prepare(sql).run()
  return result.success
}

export {
  selectPageTotalCount,
  queryPage,
  selectDeletedPageTotalCount,
  queryDeletedPage,
  deletePageById,
  restorePage,
  getPageById,
  insertPage,
  clearDeletedPage,
}

import type { D1Database } from '@cloudflare/workers-types/experimental'
import { isNotNil } from '@web-archive/shared/utils'
import type { Folder } from '~/sql/types'

async function checkFolderExists(DB: D1Database, name: string) {
  const sql = `
    SELECT 
      id
    FROM folders
    WHERE name = ? AND isDeleted == 0
  `
  const sqlResult = await DB.prepare(sql).bind(name).first<string>()
  return isNotNil(sqlResult)
}

async function insertFolder(DB: D1Database, name: string) {
  const sql = `
    INSERT INTO folders (name)
    VALUES (?)
  `
  const sqlResult = await DB.prepare(sql).bind(name).run()
  return sqlResult.success
}

async function updateFolder(DB: D1Database, options: { id: number, name: string }) {
  const sql = `
    UPDATE folders
    SET name = ?
    WHERE id = ?
  `
  const sqlResult = await DB.prepare(sql).bind(options.name, options.id).run()
  return sqlResult
}

async function selectAllFolders(DB: D1Database) {
  const sql = `
    SELECT 
      *
    FROM folders
    WHERE isDeleted == 0
  `
  const sqlResult = await DB.prepare(sql).all<Folder>()
  if (sqlResult.error) {
    throw sqlResult.error
  }
  return sqlResult.results
}

async function deleteFolderById(DB: D1Database, id: number) {
  const [folderResult, pageResult] = await DB.batch([
    DB.prepare(`
      UPDATE folders
      SET 
        isDeleted = 1,
        deletedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(id),
    DB.prepare(`
      UPDATE pages
      SET 
        isDeleted = 1,
        deletedAt = CURRENT_TIMESTAMP
      WHERE folderId = ?
    `).bind(id),
  ])

  return {
    folderResult,
    pageResult,
  }
}

async function getFolderById(DB: D1Database, options: { id: number, isDeleted?: boolean }) {
  const { id, isDeleted } = options
  const sql = `
    SELECT 
      *
    FROM folders
    WHERE id = ?
  `
  const folder = await DB.prepare(sql).bind(id).first<Folder>()
  if (isNotNil(isDeleted) && folder.isDeleted !== Number(isDeleted)) {
    return null
  }
  return folder
}

async function queryDeletedFolders(DB: D1Database) {
  const sql = `
    SELECT 
      *
    FROM folders
    WHERE isDeleted == 1
    ORDER BY deletedAt DESC
  `
  const sqlResult = await DB.prepare(sql).all<Folder>()
  return sqlResult.results
}

async function selectDeletedFolderTotalCount(DB: D1Database) {
  const sql = `
    SELECT 
      COUNT(id) as count
    FROM folders
    WHERE isDeleted == 1
  `
  const sqlResult = await DB.prepare(sql).first<{ count: number }>()
  return sqlResult.count
}

async function restoreFolder(DB: D1Database, id: number) {
  const sql = `
    UPDATE folders
    SET 
      isDeleted = 0,
      deletedAt = NULL
    WHERE id = ?
  `
  const sqlResult = await DB.prepare(sql).bind(id).run()
  return sqlResult.success
}

export {
  deleteFolderById,
  checkFolderExists,
  insertFolder,
  updateFolder,
  selectAllFolders,
  getFolderById,
  queryDeletedFolders,
  selectDeletedFolderTotalCount,
  restoreFolder,
}

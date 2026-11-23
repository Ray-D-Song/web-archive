import { createHash } from 'node:crypto'
import { type AITagConfig, ConfigKey } from '@web-archive/shared/types'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

async function checkAdminExist(DB: D1Database): Promise<boolean> {
  const result: { count: number } = await DB.prepare(`SELECT COUNT(*) as count FROM stores WHERE key = 'ADMIN_TOKEN'`).first()
  return result.count > 0
}

async function verifyAdminToken(DB: D1Database, token: string): Promise<'new' | 'fail' | 'reject' | 'accept'> {
  if (typeof token !== 'string' || token.length < 8)
    return 'reject'
  token = hashToken(token)
  const result: { count: number } = await DB.prepare(`SELECT COUNT(*) as count FROM stores WHERE key = 'ADMIN_TOKEN' AND value = ?`).bind(token).first()
  if (result.count > 0) {
    return 'accept'
  }
  const exist = await checkAdminExist(DB)
  if (!exist) {
    const success = await setAdminToken(DB, token)
    return success ? 'new' : 'fail'
  }
  return 'reject'
}

async function setAdminToken(DB: D1Database, token: string): Promise<boolean> {
  const exist = await checkAdminExist(DB)
  if (exist) {
    throw new Error('Admin token already exists')
  }
  const result = await DB.prepare(`INSERT INTO stores (key, value) VALUES ('ADMIN_TOKEN', ?)`).bind(token).run()
  return result.success
}

async function getShouldShowRecent(DB: D1Database): Promise<boolean> {
  const result = await DB.prepare(`SELECT value FROM stores WHERE key = '${ConfigKey.shouldShowRecent}'`).all<{ value: string }>()
  if (!result.success) {
    throw result.error
  }
  if (result.results.length === 0) {
    return true
  }
  return result.results[0].value === 'true'
}

async function setShouldShowRecent(DB: D1Database, value: boolean): Promise<boolean> {
  const bindValue = value ? 'true' : 'false'
  const insertSql = `INSERT INTO stores (key, value) VALUES ('${ConfigKey.shouldShowRecent}', ?) ON CONFLICT(key) DO UPDATE SET value = ?`
  const result = await DB.prepare(insertSql).bind(bindValue, bindValue).run()
  if (!result.success) {
    throw result.error
  }
  return result.success
}

async function getAITagConfig(DB: D1Database): Promise<AITagConfig> {
  const result = await DB.prepare(`SELECT value FROM stores WHERE key = '${ConfigKey.aiTag}'`).all<{ value: string }>()
  if (!result.success) {
    throw result.error
  }
  if (result.results.length === 0) {
    return {
      tagLanguage: 'en',
      type: 'cloudflare',
      model: '',
      preferredTags: [],
    }
  }
  return JSON.parse(result.results[0].value) as AITagConfig
}

async function setAITagConfig(DB: D1Database, config: AITagConfig): Promise<boolean> {
  const insertSql = `INSERT INTO stores (key, value) VALUES ('${ConfigKey.aiTag}', ?) ON CONFLICT(key) DO UPDATE SET value = ?`
  const bindValue = JSON.stringify(config)
  const result = await DB.prepare(insertSql).bind(bindValue, bindValue).run()
  if (!result.success) {
    throw result.error
  }
  return result.success
}

function getSharePageKey(pageId: number) {
  return `share/page/${pageId}`
}

function getShareTokenKey(token: string) {
  return `share/token/${token}`
}

async function getPageShareToken(DB: D1Database, pageId: number): Promise<string | null> {
  const result = await DB.prepare(`SELECT value FROM stores WHERE key = ?`).bind(getSharePageKey(pageId)).first<{ value: string }>()
  return result?.value ?? null
}

async function createOrGetPageShareToken(DB: D1Database, pageId: number): Promise<string> {
  const existingToken = await getPageShareToken(DB, pageId)
  if (existingToken) {
    return existingToken
  }
  const token = crypto.randomUUID().replace(/-/g, '')
  const upsertSql = `INSERT INTO stores (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  const results = await DB.batch([
    DB.prepare(upsertSql).bind(getSharePageKey(pageId), token),
    DB.prepare(upsertSql).bind(getShareTokenKey(token), String(pageId)),
  ])
  if (results.some(r => !r.success)) {
    throw new Error('Failed to create share token')
  }
  return token
}

async function revokePageShareToken(DB: D1Database, pageId: number): Promise<boolean> {
  const existingToken = await getPageShareToken(DB, pageId)
  if (!existingToken) {
    return true
  }
  const deleteSql = `DELETE FROM stores WHERE key = ?`
  const results = await DB.batch([
    DB.prepare(deleteSql).bind(getSharePageKey(pageId)),
    DB.prepare(deleteSql).bind(getShareTokenKey(existingToken)),
  ])
  return results.every(r => r.success)
}

async function getSharedPageIdByToken(DB: D1Database, token: string): Promise<number | null> {
  const result = await DB.prepare(`SELECT value FROM stores WHERE key = ?`).bind(getShareTokenKey(token)).first<{ value: string }>()
  if (!result?.value) {
    return null
  }
  const id = Number(result.value)
  return Number.isNaN(id) ? null : id
}

export {
  checkAdminExist,
  verifyAdminToken,
  setAdminToken,
  getShouldShowRecent,
  setShouldShowRecent,
  getAITagConfig,
  setAITagConfig,
  getPageShareToken,
  createOrGetPageShareToken,
  revokePageShareToken,
  getSharedPageIdByToken,
}

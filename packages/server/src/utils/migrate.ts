import { access, readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { Database } from 'better-sqlite3'

interface Migration {
  index: number
  name: string
  up: string
  down: string
}

async function readMigrations(options: {
  path: string
}): Promise<Migration[]> {
  const { path } = options
  const files = await readdir(path)

  const migrations: Map<number, Migration> = new Map()

  for (const filename of files) {
    const match = filename.match(/^(\d+)_([^_]+)_up\.sql$/)

    if (!match) {
      continue
    }

    const [, indexStr, name] = match
    const index = Number.parseInt(indexStr)

    const upPath = join(path, `${indexStr}_${name}_up.sql`)
    const downPath = join(path, `${indexStr}_${name}_down.sql`)

    if (!await fileExists(upPath)) {
      throw new Error(`Migration file ${upPath} is missing`)
    }

    if (!await fileExists(downPath)) {
      throw new Error(`Migration file ${downPath} is missing`)
    }

    if (!migrations.has(index)) {
      migrations.set(index, {
        index,
        name,
        up: upPath,
        down: downPath,
      })
    }
  }

  return Array.from(migrations.values()).sort((a, b) => a.index - b.index)
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

function initMigrationTable(db: Database, migrateTable: string) {
  const stmt = db.prepare(`
    CREATE TABLE IF NOT EXISTS ${migrateTable} (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  stmt.run()
}

async function doMigration(db: Database, migrateTable: string, migrationList: Migration[]) {
  const lastMigration = db.prepare<unknown[], { id: number }>(`
    SELECT id FROM ${migrateTable} ORDER BY id DESC LIMIT 1
  `).get()

  const lastMigrationIndex = lastMigration?.id ?? 0

  for (const migration of migrationList) {
    if (migration.index <= lastMigrationIndex) {
      continue
    }
    const sqlContent = await readFile(migration.up, 'utf-8')
    db.exec(sqlContent)
    db.prepare(`
      INSERT INTO ${migrateTable} (id, name) VALUES (?, ?)
    `).run(migration.index, migration.name)
  }
}

export async function migrateDatabase(options: {
  path: string
  migrateTable: string
  db: Database
}) {
  const { path, migrateTable, db } = options

  const migrations = await readMigrations({ path })

  initMigrationTable(db, migrateTable)
  await doMigration(db, migrateTable, migrations)
}

-- Migration number: 0002 	 2024-10-22T14:31:46.361Z
DROP TABLE IF EXISTS stores;
CREATE TABLE IF NOT EXISTS stores (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stores_key ON stores(key);
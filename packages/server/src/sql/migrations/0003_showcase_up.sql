-- Migration number: 0003 	 2024-10-23T03:18:17.818Z
ALTER TABLE pages ADD COLUMN isShowcased INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_pages_isShowcased ON pages (isShowcased);

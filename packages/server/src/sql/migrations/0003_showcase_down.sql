-- Migration number: 0003 	 2024-10-23T03:18:17.818Z
DROP INDEX IF EXISTS idx_pages_isShowcased;
ALTER TABLE pages DROP COLUMN isShowcased;
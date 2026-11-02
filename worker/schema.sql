CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  type TEXT NOT NULL,
  page TEXT,
  email TEXT NOT NULL,
  payload TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  flagged INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS leads_ip_time ON leads (ip_hash, created_at);
CREATE INDEX IF NOT EXISTS leads_time ON leads (created_at);

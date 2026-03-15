-- Soft delete for users: deleted_at set when user deletes their own account.
-- Deleted users cannot log in and are excluded from active user search/invites.
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

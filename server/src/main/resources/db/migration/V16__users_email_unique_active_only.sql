-- Allow re-registration with the same email after account soft-delete.
-- Replace global unique on email with a partial unique index (active users only).
ALTER TABLE users DROP CONSTRAINT IF EXISTS uq_users_email;

CREATE UNIQUE INDEX users_email_unique_active
ON users(email)
WHERE deleted_at IS NULL;

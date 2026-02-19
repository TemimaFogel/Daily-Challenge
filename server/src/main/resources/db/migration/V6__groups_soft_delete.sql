-- Soft-delete for groups: deleted_at and deleted_by

ALTER TABLE groups ADD COLUMN deleted_at TIMESTAMPTZ NULL;
ALTER TABLE groups ADD COLUMN deleted_by UUID NULL;
ALTER TABLE groups ADD CONSTRAINT fk_groups_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Prevent duplicate PENDING invites for the same (group_id, invited_user_id).
-- PostgreSQL partial unique index: only one row with status='PENDING' per (group_id, invited_user_id).
CREATE UNIQUE INDEX uq_group_invites_pending
ON group_invites (group_id, invited_user_id)
WHERE status = 'PENDING';

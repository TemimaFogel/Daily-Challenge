-- External group invites: persisted when owner invites an unregistered email.
-- Converted to normal group_invites when that email registers.
CREATE TABLE IF NOT EXISTS external_group_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  invited_email VARCHAR(255) NOT NULL,
  invited_by_user_id UUID NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_at TIMESTAMPTZ NULL,
  converted_to_user_id UUID NULL,
  CONSTRAINT fk_external_group_invites_group          FOREIGN KEY (group_id)          REFERENCES groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_external_group_invites_invited_by    FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_external_group_invites_converted_to  FOREIGN KEY (converted_to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_external_group_invites_group_id ON external_group_invites(group_id);
CREATE INDEX IF NOT EXISTS idx_external_group_invites_invited_email ON external_group_invites(LOWER(invited_email));
CREATE INDEX IF NOT EXISTS idx_external_group_invites_status ON external_group_invites(status);

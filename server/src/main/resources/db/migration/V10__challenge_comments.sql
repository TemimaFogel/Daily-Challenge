-- Challenge comments: public comments on a challenge (any authenticated user can add; all can view).
CREATE TABLE IF NOT EXISTS challenge_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_challenge_comments_challenge FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  CONSTRAINT fk_challenge_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_challenge_comments_challenge_id ON challenge_comments(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_comments_created_at ON challenge_comments(created_at DESC);

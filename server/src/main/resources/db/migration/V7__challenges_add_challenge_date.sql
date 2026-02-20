-- Add challenge_date (DATE) for daily lifecycle (Option B by date).
-- Backfill existing rows, then enforce NOT NULL. Add indexes for filtering by date and (visibility, date).

-- Add column as nullable so existing rows are valid
ALTER TABLE challenges ADD COLUMN challenge_date DATE;

-- Backfill existing rows with current date (no data loss)
UPDATE challenges SET challenge_date = CURRENT_DATE WHERE challenge_date IS NULL;

-- Enforce NOT NULL
ALTER TABLE challenges ALTER COLUMN challenge_date SET NOT NULL;

-- Index for filtering/ordering by date (e.g. "challenges for a given day")
CREATE INDEX IF NOT EXISTS idx_challenges_challenge_date ON challenges(challenge_date);

-- Composite index for "visible challenges for a given date" (e.g. list public/daily challenges)
CREATE INDEX IF NOT EXISTS idx_challenges_visibility_date ON challenges(visibility, challenge_date);

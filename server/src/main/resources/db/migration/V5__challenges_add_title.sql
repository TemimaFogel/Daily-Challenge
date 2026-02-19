-- Add title to challenges; ensure description supports up to 500 chars

-- Add title column (existing rows get a default, then enforce NOT NULL)
ALTER TABLE challenges ADD COLUMN title VARCHAR(120);
UPDATE challenges SET title = COALESCE(LEFT(description, 120), 'Challenge') WHERE title IS NULL;
ALTER TABLE challenges ALTER COLUMN title SET NOT NULL;

-- Ensure description supports up to 500 (truncate if needed, then resize)
UPDATE challenges SET description = LEFT(description, 500) WHERE LENGTH(description) > 500;
ALTER TABLE challenges ALTER COLUMN description TYPE VARCHAR(500);

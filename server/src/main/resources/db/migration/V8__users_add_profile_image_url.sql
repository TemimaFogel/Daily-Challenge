-- Add optional profile image URL to users (e.g. CDN or external URL). No backfill.

ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(512) NULL;

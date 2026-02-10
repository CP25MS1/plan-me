ALTER TABLE "trip"
    ADD COLUMN invitation_code TEXT;

CREATE
EXTENSION IF NOT EXISTS pgcrypto;

UPDATE "trip"
SET invitation_code = gen_random_uuid()::text
WHERE invitation_code IS NULL;

ALTER TABLE "trip"
    ALTER COLUMN invitation_code SET NOT NULL;
ALTER TABLE "trip"
    ADD CONSTRAINT uq_trip_invitation_code UNIQUE (invitation_code);

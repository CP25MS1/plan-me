ALTER TABLE "trip"
ADD COLUMN "is_public" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "copied_from_trip_id" INT;

ALTER TABLE "trip"
ADD CONSTRAINT fk_trip_copied_from
FOREIGN KEY ("copied_from_trip_id") REFERENCES "trip" ("trip_id") ON DELETE SET NULL;

CREATE INDEX idx_trip_is_public ON "trip" ("is_public") WHERE "is_public" = TRUE;

CREATE INDEX idx_trip_copied_from ON "trip" ("copied_from_trip_id");

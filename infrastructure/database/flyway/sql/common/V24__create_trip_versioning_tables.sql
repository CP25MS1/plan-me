CREATE TABLE trip_version
(
    trip_version_id     SERIAL PRIMARY KEY,
    trip_id             INT         NOT NULL,
    version_name        VARCHAR(30) NOT NULL,
    snapshot_trip_name  VARCHAR(50) NOT NULL,
    snapshot_start_date DATE,
    snapshot_end_date   DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  INT,
    applied_at          TIMESTAMPTZ,
    applied_by_user_id  INT,
    is_current          BOOLEAN     NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_trip_version_trip
        FOREIGN KEY (trip_id)
            REFERENCES trip (trip_id)
            ON DELETE CASCADE,

    CONSTRAINT fk_trip_version_created_by_user
        FOREIGN KEY (created_by_user_id)
            REFERENCES "user" (user_id)
            ON DELETE SET NULL,

    CONSTRAINT fk_trip_version_applied_by_user
        FOREIGN KEY (applied_by_user_id)
            REFERENCES "user" (user_id)
            ON DELETE SET NULL,

    CONSTRAINT uq_trip_version_trip_id_version_name UNIQUE (trip_id, version_name)
);

CREATE UNIQUE INDEX uq_trip_version_trip_id_current
    ON trip_version (trip_id) WHERE is_current;

CREATE INDEX idx_trip_version_trip_id_created_at
    ON trip_version (trip_id, created_at DESC, trip_version_id DESC);

CREATE TABLE trip_version_snapshot
(
    trip_version_id         INT PRIMARY KEY,
    snapshot_schema_version SMALLINT NOT NULL DEFAULT 1,
    snapshot                JSONB    NOT NULL,

    CONSTRAINT fk_trip_version_snapshot_trip_version
        FOREIGN KEY (trip_version_id)
            REFERENCES trip_version (trip_version_id)
            ON DELETE CASCADE,

    CONSTRAINT chk_trip_version_snapshot_is_object
        CHECK (jsonb_typeof(snapshot) = 'object')
);

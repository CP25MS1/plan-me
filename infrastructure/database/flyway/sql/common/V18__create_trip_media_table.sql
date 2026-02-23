CREATE TABLE trip_album (
    album_id            SERIAL PRIMARY KEY,
    trip_id             INT          NOT NULL,
    name                VARCHAR(50) NOT NULL,
    created_by_user_id  INT          NOT NULL,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT uq_trip_album_trip UNIQUE (trip_id),

    CONSTRAINT fk_trip_album_trip
        FOREIGN KEY (trip_id)
            REFERENCES trip (trip_id)
            ON DELETE CASCADE,

    CONSTRAINT fk_trip_album_creator
        FOREIGN KEY (created_by_user_id)
            REFERENCES "user" (user_id)
            ON DELETE CASCADE
);

CREATE INDEX idx_trip_album_created_at
    ON trip_album (created_at DESC, album_id DESC);

CREATE TABLE trip_memory (
    memory_id          SERIAL PRIMARY KEY,
    album_id           INT          NOT NULL,
    uploader_user_id   INT          NOT NULL,
    object_key         TEXT         NOT NULL,
    original_filename  TEXT         NOT NULL,
    file_extension     VARCHAR(10)  NOT NULL,
    content_type       VARCHAR(100) NOT NULL,
    memory_type        VARCHAR(10)  NOT NULL,
    size_bytes         BIGINT       NOT NULL,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_trip_memory_album
        FOREIGN KEY (album_id)
            REFERENCES trip_album (album_id)
            ON DELETE CASCADE,

    CONSTRAINT fk_trip_memory_uploader
        FOREIGN KEY (uploader_user_id)
            REFERENCES "user" (user_id)
            ON DELETE CASCADE,

    CONSTRAINT uq_trip_memory_object_key UNIQUE (object_key),
    CONSTRAINT chk_trip_memory_size_positive CHECK (size_bytes > 0),
    CONSTRAINT chk_trip_memory_type CHECK (memory_type IN ('IMAGE', 'VIDEO'))
);

CREATE INDEX idx_trip_memory_album_created_at
    ON trip_memory (album_id, created_at DESC, memory_id DESC);

CREATE INDEX idx_trip_memory_album_ext_created_at
    ON trip_memory (album_id, file_extension, created_at DESC, memory_id DESC);

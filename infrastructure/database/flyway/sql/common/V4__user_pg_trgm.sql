CREATE EXTENSION pg_trgm;

CREATE INDEX idx_user_username_trgm
    ON "user"
        USING GIN (username gin_trgm_ops);

CREATE INDEX idx_user_email_trgm
    ON "user"
        USING GIN (email gin_trgm_ops);

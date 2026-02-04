CREATE TABLE "tripmate" (
    user_id       INT    NOT NULL,
    trip_id       INT    NOT NULL,

    CONSTRAINT pk_tripmate PRIMARY KEY (user_id, trip_id),
    CONSTRAINT fk_tripmate_user FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_tripmate_trip FOREIGN KEY (trip_id) REFERENCES "trip" (trip_id) ON DELETE CASCADE
);

CREATE TABLE "pending_tripmate_invitation" (
    invitation_id SERIAL PRIMARY KEY,
    user_id       INT    NOT NULL,
    trip_id       INT    NOT NULL,

    CONSTRAINT fk_pending_user FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_pending_trip FOREIGN KEY (trip_id) REFERENCES "trip" (trip_id) ON DELETE CASCADE,
    CONSTRAINT uq_pending_tripmate_invitation UNIQUE (user_id, trip_id)
);
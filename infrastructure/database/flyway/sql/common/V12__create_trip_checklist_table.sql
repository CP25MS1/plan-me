CREATE TABLE trip_checklist
(
    checklist_item_id SERIAL PRIMARY KEY,

    trip_id           INTEGER     NOT NULL,
    created_by        INTEGER     NOT NULL,
    assigned_by       INTEGER,
    assignee_id       INTEGER,

    name              VARCHAR(30) NOT NULL,
    completed         BOOLEAN     NOT NULL DEFAULT FALSE,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_trip_checklist_trip
        FOREIGN KEY (trip_id)
            REFERENCES trip (trip_id)
            ON DELETE CASCADE,

    CONSTRAINT fk_trip_checklist_created_by
        FOREIGN KEY (created_by)
            REFERENCES "user" (user_id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_trip_checklist_assigned_by
        FOREIGN KEY (assigned_by)
            REFERENCES "user" (user_id)
            ON DELETE SET NULL,

    CONSTRAINT fk_trip_checklist_assignee
        FOREIGN KEY (assignee_id)
            REFERENCES "user" (user_id)
            ON DELETE SET NULL
);

CREATE INDEX idx_trip_checklist_trip_id
    ON trip_checklist (trip_id);

CREATE INDEX idx_trip_checklist_assignee_id
    ON trip_checklist (assignee_id);

CREATE INDEX idx_trip_checklist_completed
    ON trip_checklist (completed);

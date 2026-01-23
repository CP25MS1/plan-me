CREATE TABLE daily_plan (
    plan_id   SERIAL PRIMARY KEY,
    trip_id   INT     NOT NULL,
    date      DATE    NOT NULL,
    pin_color CHAR(7) NOT NULL,

    CONSTRAINT fk_daily_plan_trip FOREIGN KEY (trip_id) REFERENCES trip (trip_id) ON DELETE CASCADE,
    CONSTRAINT uq_daily_plan_trip_date UNIQUE (trip_id, date)
);

CREATE INDEX idx_daily_plan_trip_id ON daily_plan (trip_id);

CREATE TABLE scheduled_place (
    place_id   SERIAL PRIMARY KEY,
    plan_id    INT      NOT NULL,
    ggmp_id    TEXT,
    notes      TEXT,
    "order"    SMALLINT NOT NULL,

    CONSTRAINT fk_scheduled_place_plan FOREIGN KEY (plan_id) REFERENCES daily_plan (plan_id) ON DELETE CASCADE,
    CONSTRAINT fk_scheduled_place_ggmp FOREIGN KEY (ggmp_id) REFERENCES google_map_place (ggmp_id) ON DELETE SET NULL
);

CREATE INDEX idx_scheduled_place_plan_id ON scheduled_place (plan_id);
CREATE INDEX idx_scheduled_place_plan_order ON scheduled_place (plan_id, "order");
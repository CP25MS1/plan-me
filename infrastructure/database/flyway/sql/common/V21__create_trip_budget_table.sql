CREATE TABLE trip_budget (
    trip_id      INT PRIMARY KEY,
    total_budget NUMERIC(12, 2) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_trip_budget_trip FOREIGN KEY (trip_id) REFERENCES trip (trip_id) ON DELETE CASCADE,
    CONSTRAINT chk_trip_budget_non_negative CHECK (total_budget >= 0)
);

CREATE INDEX idx_trip_budget_updated_at ON trip_budget (updated_at DESC, trip_id DESC);
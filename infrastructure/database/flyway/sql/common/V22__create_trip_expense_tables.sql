CREATE TABLE trip_expense (
    expense_id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL,
    expense_name TEXT NOT NULL,
    expense_type TEXT NOT NULL,
    payer_user_id INT NOT NULL,
    spent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id INT NOT NULL,
    CONSTRAINT fk_trip_expense_trip FOREIGN KEY (trip_id) REFERENCES trip (trip_id) ON DELETE CASCADE,
    CONSTRAINT fk_trip_expense_payer FOREIGN KEY (payer_user_id) REFERENCES "user" (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_trip_expense_creator FOREIGN KEY (created_by_user_id) REFERENCES "user" (user_id) ON DELETE CASCADE
);

CREATE TABLE trip_expense_split (
    expense_id INT NOT NULL,
    participant_user_id INT NOT NULL,
    split_amount NUMERIC(12, 2) NOT NULL,
    CONSTRAINT pk_trip_expense_split PRIMARY KEY (expense_id, participant_user_id),
    CONSTRAINT fk_trip_expense_split_expense FOREIGN KEY (expense_id) REFERENCES trip_expense (expense_id) ON DELETE CASCADE,
    CONSTRAINT fk_trip_expense_split_user FOREIGN KEY (participant_user_id) REFERENCES "user" (user_id) ON DELETE CASCADE
);
CREATE TABLE trip_debt_balance (
    trip_id INT NOT NULL,
    debtor_user_id INT NOT NULL,
    creditor_user_id INT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_trip_debt_balance PRIMARY KEY (trip_id, debtor_user_id, creditor_user_id),
    CONSTRAINT fk_trip_debt_balance_trip FOREIGN KEY (trip_id) REFERENCES trip (trip_id) ON DELETE CASCADE,
    CONSTRAINT fk_trip_debt_balance_debtor FOREIGN KEY (debtor_user_id) REFERENCES "user" (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_trip_debt_balance_creditor FOREIGN KEY (creditor_user_id) REFERENCES "user" (user_id) ON DELETE CASCADE,
    CONSTRAINT chk_trip_debt_balance_non_negative CHECK (amount >= 0),
    CONSTRAINT chk_trip_debt_balance_not_same_user CHECK (debtor_user_id <> creditor_user_id)
);

CREATE INDEX idx_trip_debt_balance_debtor ON trip_debt_balance (trip_id, debtor_user_id);
CREATE INDEX idx_trip_debt_balance_creditor ON trip_debt_balance (trip_id, creditor_user_id);
CREATE INDEX idx_trip_debt_balance_updated_at ON trip_debt_balance (
    updated_at DESC,
    trip_id,
    debtor_user_id,
    creditor_user_id
);
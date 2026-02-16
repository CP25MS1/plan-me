ALTER TABLE train_reservation
    ALTER COLUMN seat_no DROP NOT NULL,
    ALTER COLUMN passenger_name DROP NOT NULL;

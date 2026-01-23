CREATE TABLE "reservation" (
    "reservation_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "trip_id" INT NOT NULL,
    "ggmp_id" TEXT,
    "type" TEXT NOT NULL,
    "booking_ref" TEXT,
    "contact_tel" TEXT,
    "contact_email" TEXT,
    "cost" NUMERIC(10, 2),

    CONSTRAINT "fk_reservation_trip" FOREIGN KEY ("trip_id") REFERENCES "trip"("trip_id") ON DELETE CASCADE,
    CONSTRAINT "fk_reservation_ggmp" FOREIGN KEY ("ggmp_id") REFERENCES "google_map_place"("ggmp_id") ON DELETE SET NULL
);

CREATE TABLE "lodging_reservation" (
    "reservation_id" INT PRIMARY KEY,
    "lodging_name" TEXT NOT NULL,
    "lodging_address" TEXT NOT NULL,
    "under_name" TEXT NOT NULL,
    "checkin_date" TIMESTAMP NOT NULL,
    "checkout_date" TIMESTAMP NOT NULL,

    CONSTRAINT "fk_lodging_reservation" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("reservation_id") ON DELETE CASCADE
);

CREATE TABLE "restaurant_reservation" (
    "reservation_id" INT PRIMARY KEY,
    "restaurant_name" TEXT NOT NULL,
    "restaurant_address" TEXT NOT NULL,
    "under_name" TEXT NOT NULL,
    "reservation_date" DATE NOT NULL,
    "reservation_time" TIME,
    "table_no" TEXT,
    "queue_no" TEXT,
    "party_size" SMALLINT,

    CONSTRAINT "fk_restaurant_reservation" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("reservation_id") ON DELETE CASCADE
);

CREATE TABLE "flight_reservation" (
    "reservation_id" INT PRIMARY KEY,
    "airline" TEXT NOT NULL,
    "flight_no" TEXT NOT NULL,
    "boarding_time" TIMESTAMP,
    "gate_no" TEXT,
    "departure_airport" TEXT NOT NULL,
    "departure_time" TIMESTAMP NOT NULL,
    "arrival_airport" TEXT NOT NULL,
    "arrival_time" TIMESTAMP NOT NULL,
    "flight_class" TEXT,

    CONSTRAINT "fk_flight_reservation" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("reservation_id") ON DELETE CASCADE
);

CREATE TABLE "flight_passenger_reservation" (
    "reservation_id" INT NOT NULL,
    "passenger_name" TEXT NOT NULL,
    "seat_no" TEXT NOT NULL,

    CONSTRAINT "pk_flight_passenger" PRIMARY KEY ("reservation_id", "seat_no"),
    CONSTRAINT "fk_flight_passenger_reservation" FOREIGN KEY ("reservation_id") REFERENCES "flight_reservation"("reservation_id") ON DELETE CASCADE
);

CREATE TABLE "train_reservation" (
    "reservation_id" INT PRIMARY KEY,
    "train_no" TEXT NOT NULL,
    "train_class" TEXT NOT NULL,
    "seat_class" TEXT NOT NULL,
    "seat_no" TEXT NOT NULL,
    "passenger_name" TEXT NOT NULL,
    "departure_station" TEXT NOT NULL,
    "departure_time" TIMESTAMP NOT NULL,
    "arrival_station" TEXT NOT NULL,
    "arrival_time" TIMESTAMP NOT NULL,

    CONSTRAINT "fk_train_reservation" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("reservation_id") ON DELETE CASCADE
);

CREATE TABLE "bus_reservation" (
    "reservation_id" INT PRIMARY KEY,
    "transport_company" TEXT NOT NULL,
    "departure_station" TEXT NOT NULL,
    "departure_time" TIMESTAMP NOT NULL,
    "arrival_station" TEXT NOT NULL,
    "bus_class" TEXT,
    "passenger_name" TEXT NOT NULL,
    "seat_no" TEXT NOT NULL,

    CONSTRAINT "fk_bus_reservation" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("reservation_id") ON DELETE CASCADE
);

CREATE TABLE "ferry_reservation" (
    "reservation_id" INT PRIMARY KEY,
    "transport_company" TEXT NOT NULL,
    "passenger_name" TEXT NOT NULL,
    "departure_port" TEXT NOT NULL,
    "departure_time" TIMESTAMP NOT NULL,
    "arrival_port" TEXT NOT NULL,
    "arrival_time" TIMESTAMP NOT NULL,
    "ticket_type" TEXT NOT NULL,

    CONSTRAINT "fk_ferry_reservation" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("reservation_id") ON DELETE CASCADE
);

CREATE TABLE "car_rental_reservation" (
    "reservation_id" INT PRIMARY KEY,
    "rental_company" TEXT NOT NULL,
    "car_model" TEXT NOT NULL,
    "vrn" TEXT NOT NULL,
    "renter_name" TEXT NOT NULL,
    "pickup_location" TEXT NOT NULL,
    "pickup_time" TIMESTAMP NOT NULL,
    "dropoff_location" TEXT NOT NULL,
    "dropoff_time" TIMESTAMP NOT NULL,

    CONSTRAINT "fk_car_rental_reservation" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("reservation_id") ON DELETE CASCADE
);
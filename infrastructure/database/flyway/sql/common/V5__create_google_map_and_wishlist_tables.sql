CREATE TABLE google_map_place (
    "ggmp_id"         TEXT PRIMARY KEY,
    "rating"          SMALLINT NOT NULL,
    "th_name"         TEXT NOT NULL,
    "th_description"  TEXT NOT NULL,
    "th_address"      TEXT NOT NULL,
    "en_name"         TEXT NOT NULL,
    "en_description"  TEXT NOT NULL,
    "en_address"      TEXT NOT NULL,
    "opening_hours"   TEXT,
    "default_pic_url" TEXT
);

CREATE TABLE wishlist_place (
    "place_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "trip_id"  INT NOT NULL,
    "ggmp_id"  TEXT NOT NULL,
    "notes"    TEXT,

    CONSTRAINT fk_wishlist_trip FOREIGN KEY ("trip_id") REFERENCES trip("trip_id") ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_ggmp FOREIGN KEY ("ggmp_id") REFERENCES google_map_place("ggmp_id") ON DELETE CASCADE
);

ALTER TABLE wishlist_place
ADD CONSTRAINT unique_trip_place UNIQUE ("trip_id", "ggmp_id");

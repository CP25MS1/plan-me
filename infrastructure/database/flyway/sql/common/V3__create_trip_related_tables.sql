CREATE TABLE "trip" (
    "trip_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "owner_id" INT NOT NULL,
    CONSTRAINT fk_trip_owner FOREIGN KEY ("owner_id") REFERENCES "user" ("user_id") ON DELETE CASCADE
);

CREATE TABLE "basic_objective" (
    "bo_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "th_name" VARCHAR(25) NOT NULL,
    "en_name" VARCHAR(25) NOT NULL
);

CREATE TABLE "objective" (
    "objective_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "trip_id" INT NOT NULL,
    "name" VARCHAR(25) NOT NULL,
    "bo_id" INT,
    CONSTRAINT fk_objective_trip FOREIGN KEY ("trip_id") REFERENCES "trip" ("trip_id") ON DELETE CASCADE,
    CONSTRAINT fk_objective_bo FOREIGN KEY ("bo_id") REFERENCES "basic_objective" ("bo_id") ON DELETE SET NULL,
    CONSTRAINT unique_objective_name_per_trip UNIQUE ("trip_id", "name")
);

CREATE INDEX idx_trip_owner_id ON "trip" ("owner_id");
CREATE INDEX idx_objective_trip_id ON "objective" ("trip_id");
CREATE INDEX idx_objective_bo_id ON "objective" ("bo_id");

INSERT INTO "basic_objective" ("th_name", "en_name") VALUES
('ฟื้นฟูร่างกายและจิตใจ', 'Rejuvenation'),
('ครอบครัว', 'Family'),
('ทำงาน', 'Work'),
('เปลี่ยนบรรยากาศ', 'Change of Scenery'),
('โอกาศพิเศษ', 'Special Occasion'),
('พักผ่อน', 'Relaxation');
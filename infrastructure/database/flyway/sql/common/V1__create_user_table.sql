CREATE TABLE "user" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "profile_pic_url" VARCHAR(255),
    "idp" VARCHAR(10) NOT NULL DEFAULT 'GOOGLE' CHECK ("idp" IN ('GOOGLE')),
    "idp_id" VARCHAR(15) NOT NULL,
    "preferred_language" VARCHAR(3) NOT NULL DEFAULT 'TH' CHECK ("preferred_language" IN ('TH', 'EN'))
);
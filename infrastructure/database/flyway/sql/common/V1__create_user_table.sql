CREATE TABLE "user" (
    "user_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "username" VARCHAR(80) NOT NULL,
    "email" VARCHAR(80) NOT NULL,
    "profile_pic_url" TEXT,
    "idp" CHAR(2) NOT NULL,
    "idp_id" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("idp", "idp_id")
);
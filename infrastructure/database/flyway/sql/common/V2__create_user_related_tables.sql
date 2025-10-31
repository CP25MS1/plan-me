CREATE TABLE "preference" (
    "user_id" INT PRIMARY KEY,
    "language" CHAR(2),
    CONSTRAINT fk_preference_user FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") ON DELETE CASCADE
);

CREATE TABLE "follower" (
    "user_id" INT NOT NULL,
    "follower_id" INT NOT NULL,
    PRIMARY KEY ("user_id", "follower_id"),
    CONSTRAINT fk_follower_user FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") ON DELETE CASCADE,
    CONSTRAINT fk_follower_follower FOREIGN KEY ("follower_id") REFERENCES "user" ("user_id") ON DELETE CASCADE
);

CREATE TABLE "following" (
    "user_id" INT NOT NULL,
    "following_id" INT NOT NULL,
    PRIMARY KEY ("user_id", "following_id"),
    CONSTRAINT fk_following_user FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") ON DELETE CASCADE,
    CONSTRAINT fk_following_following FOREIGN KEY ("following_id") REFERENCES "user" ("user_id") ON DELETE CASCADE
);
CREATE TABLE notification (
    notification_id      SERIAL PRIMARY KEY,
    noti_code            TEXT NOT NULL,
    receiver_user_id     INT NOT NULL,
    actor_user_id        INT NOT NULL,
    trip_id              INT,
    is_read              BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_receiver_user FOREIGN KEY (receiver_user_id) REFERENCES "user" (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_actor_user FOREIGN KEY (actor_user_id) REFERENCES "user" (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_trip FOREIGN KEY (trip_id) REFERENCES "trip" (trip_id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_receiver_user_id ON notification (receiver_user_id, created_at DESC);
CREATE INDEX idx_notifications_receiver_unread ON notification (receiver_user_id) WHERE is_read = FALSE;
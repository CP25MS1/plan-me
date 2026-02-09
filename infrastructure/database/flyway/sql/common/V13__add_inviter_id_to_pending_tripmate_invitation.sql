ALTER TABLE pending_tripmate_invitation
    ADD COLUMN inviter_id INT NOT NULL;

ALTER TABLE pending_tripmate_invitation
    ADD CONSTRAINT fk_pending_inviter FOREIGN KEY (inviter_id) REFERENCES "user" (user_id) ON DELETE CASCADE;

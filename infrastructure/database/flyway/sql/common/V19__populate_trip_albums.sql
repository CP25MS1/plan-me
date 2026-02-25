-- Populate trip_album with existing trips
-- Each trip will have an album with the same name, created by the trip owner
INSERT INTO trip_album (trip_id, name, created_by_user_id, created_at)
SELECT t.trip_id,
    t.name,
    t.owner_id,
    now()
FROM trip t
WHERE NOT EXISTS (
        SELECT 1
        FROM trip_album ta
        WHERE ta.trip_id = t.trip_id
    );
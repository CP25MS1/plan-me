ALTER TABLE google_map_place
    ADD COLUMN search_vector tsvector;

CREATE
OR REPLACE FUNCTION google_map_place_search_vector_update()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector
:=
        to_tsvector('simple',
            coalesce(NEW.th_name,'') || ' ' ||
            coalesce(NEW.th_address,'') || ' ' ||
            coalesce(NEW.th_description,'') || ' ' ||
            coalesce(NEW.en_name,'') || ' ' ||
            coalesce(NEW.en_address,'') || ' ' ||
            coalesce(NEW.en_description,'')
        );
RETURN NEW;
END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_google_map_place_search_vector
ON google_map_place;

CREATE TRIGGER trg_google_map_place_search_vector
    BEFORE INSERT OR
UPDATE
    ON google_map_place
    FOR EACH ROW
    EXECUTE FUNCTION google_map_place_search_vector_update();

UPDATE public.google_map_place
SET th_name = th_name;

CREATE INDEX IF NOT EXISTS idx_google_map_place_search
    ON google_map_place
    USING GIN (search_vector);

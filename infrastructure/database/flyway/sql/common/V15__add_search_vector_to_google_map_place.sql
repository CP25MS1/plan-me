ALTER TABLE google_map_place
    ADD COLUMN search_vector tsvector;

UPDATE google_map_place
SET search_vector =
        to_tsvector('simple',
                    coalesce(th_name, '') || ' ' ||
                    coalesce(th_address, '') || ' ' ||
                    coalesce(th_description, '') || ' ' ||
                    coalesce(en_name, '') || ' ' ||
                    coalesce(en_address, '') || ' ' ||
                    coalesce(en_description, '')
        );

CREATE INDEX idx_google_map_place_search
    ON google_map_place
    USING GIN (search_vector);
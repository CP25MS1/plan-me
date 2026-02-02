CREATE TABLE travel_segment (
    segment_id       SERIAL PRIMARY KEY,
    start_id         TEXT    NOT NULL,
    end_id           TEXT    NOT NULL,
    mode             VARCHAR(12) NOT NULL,
    distance         INT     NOT NULL,
    regular_duration INT     NOT NULL,

    CONSTRAINT fk_travel_segment_start FOREIGN KEY (start_id) REFERENCES google_map_place (ggmp_id) ON DELETE CASCADE,
    CONSTRAINT fk_travel_segment_end FOREIGN KEY (end_id) REFERENCES google_map_place (ggmp_id) ON DELETE CASCADE,
    CONSTRAINT uq_travel_segment_start_end_mode UNIQUE (start_id, end_id, mode)
);
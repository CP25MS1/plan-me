ALTER TABLE travel_segment
ADD CONSTRAINT uq_travel_segment_start_end_mode UNIQUE (start_id, end_id, mode);
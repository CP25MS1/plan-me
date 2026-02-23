package capstone.ms.api.modules.itinerary.repositories;

import java.time.Instant;

public interface TripAlbumSummaryProjection {
    Integer getAlbumId();

    Integer getTripId();

    String getTripName();

    String getAlbumName();

    Long getMemoryCount();

    Long getTotalSizeBytes();

    Instant getCreatedAt();
}

package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.entities.TripVersionSnapshot;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

@Component
@RequiredArgsConstructor
public class TripVersionSnapshotCodec {
    private final ObjectMapper objectMapper;

    public Map<String, Object> encodeOverview(TripOverviewDto overview) {
        try {
            return objectMapper.convertValue(overview, new TypeReference<>() {
            });
        } catch (Exception ex) {
            throw new ServerErrorException("500");
        }
    }

    public TripOverviewDto decodeOrThrow(TripVersionSnapshot snapshotEntity) {
        Map<String, Object> snapshotMap = copySnapshotMap(snapshotEntity);
        if (isIncompleteSnapshot(snapshotMap)) {
            throw new ServerErrorException("500");
        }
        return convertOrThrow(snapshotMap);
    }

    public TripOverviewDto decodeOrFallback(TripVersionSnapshot snapshotEntity, Supplier<TripOverviewDto> fallbackSupplier) {
        Map<String, Object> snapshotMap = copySnapshotMap(snapshotEntity);
        if (isIncompleteSnapshot(snapshotMap)) {
            return fallbackSupplier.get();
        }
        return convertOrThrow(snapshotMap);
    }

    public boolean isIncompleteSnapshot(Map<String, Object> snapshotMap) {
        if (snapshotMap == null || snapshotMap.isEmpty()) {
            return true;
        }

        return !(snapshotMap.containsKey("id")
                && snapshotMap.containsKey("name")
                && snapshotMap.containsKey("owner")
                && snapshotMap.containsKey("objectives")
                && snapshotMap.containsKey("tripmates")
                && snapshotMap.containsKey("reservations")
                && snapshotMap.containsKey("wishlistPlaces")
                && snapshotMap.containsKey("dailyPlans")
                && snapshotMap.containsKey("checklist")
                && snapshotMap.containsKey("visibility"));
    }

    private Map<String, Object> copySnapshotMap(TripVersionSnapshot snapshotEntity) {
        if (snapshotEntity == null || snapshotEntity.getSnapshot() == null) {
            return new HashMap<>();
        }
        return new HashMap<>(snapshotEntity.getSnapshot());
    }

    private TripOverviewDto convertOrThrow(Map<String, Object> snapshotMap) {
        try {
            return objectMapper.convertValue(snapshotMap, TripOverviewDto.class);
        } catch (Exception ex) {
            throw new ServerErrorException("500");
        }
    }
}


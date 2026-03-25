package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.dto.trip_version.TripVersionDto;
import capstone.ms.api.modules.itinerary.entities.TripVersion;
import capstone.ms.api.modules.user.mappers.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TripVersionDtoFactory {
    private final UserMapper userMapper;

    public TripVersionDto from(TripVersion version) {
        return from(version, null, null);
    }

    public TripVersionDto from(TripVersion version, Short snapshotSchemaVersion, TripOverviewDto snapshot) {
        if (version == null) {
            return null;
        }

        Integer tripId = version.getTrip() != null ? version.getTrip().getId() : null;

        return TripVersionDto.builder()
                .id(version.getId())
                .tripId(tripId)
                .versionName(version.getVersionName())
                .createdAt(version.getCreatedAt())
                .createdBy(version.getCreatedBy() != null ? userMapper.userToPublicUserInfo(version.getCreatedBy()) : null)
                .appliedAt(version.getAppliedAt())
                .appliedBy(version.getAppliedBy() != null ? userMapper.userToPublicUserInfo(version.getAppliedBy()) : null)
                .isCurrent(version.getIsCurrent())
                .snapshotSchemaVersion(snapshotSchemaVersion)
                .snapshot(snapshot)
                .build();
    }
}


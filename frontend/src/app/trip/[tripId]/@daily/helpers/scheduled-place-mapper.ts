import { ScheduledPlaceDto } from '@/api/daily-plan';
import { ScheduledPlace } from '@/api/trips';

const mapResponseToState = (res: ScheduledPlaceDto): ScheduledPlace => {
  return {
    id: res.placeId,
    notes: res.notes ?? '',
    order: res.order,
    ggmp: res.placeDetail,
  };
};

const ScheduledPlaceMapper = {
  mapResponseToState,
};

export default ScheduledPlaceMapper;

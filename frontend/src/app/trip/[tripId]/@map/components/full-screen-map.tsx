import { ReactNode, useState } from 'react';
import { Map } from 'lucide-react';

import { Box, Fab, Portal } from '@mui/material';
import { DailyPlan, ScheduledPlace } from '@/api/trips';
import { useMapCenter, useSheetHeight, useVisiblePlans } from '../hooks';
import MapHeader from './map-header';
import MapCanvas from './map-canvas';
import PlaceBottomSheet from './place-bottom-sheet';

type FullScreenMapProps = {
  header: {
    title: string;
    onBack?: () => void;
    cta?: ReactNode;
  };
  dailyPlans: DailyPlan[];
  selectedDay: 'ALL' | number;
};

const FullScreenMap = ({ header, dailyPlans, selectedDay }: FullScreenMapProps) => {
  const plans = useVisiblePlans(dailyPlans, selectedDay);
  const center = useMapCenter(dailyPlans, selectedDay);
  const sheetHeight = useSheetHeight(0.5);

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<ScheduledPlace | null>(null);

  const tempLink =
    'https://www.google.com/maps/dir/?api=1\n' +
    '&origin=Market+Place+Thonglor+Bangkok\n' +
    '&origin_place_id=ChIJ36Uwvref4jAREPAHpp78-0k\n' +
    '&destination=Ginza+Thonglor+Bangkok\n' +
    '&destination_place_id=ChIJH7npy02f4jAR9zL2Fh2uDLo\n' +
    '&waypoints=\n' +
    'Era-izaan+Thonglor::place_id:ChIJN5K6EOaf4jARtBYfXEolwv0\n' +
    '|\n' +
    'Fatboy+Ekamai::place_id:ChIJY-4yKQCf4jARGpdFc75ypaY\n' +
    '&travelmode=driving';

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <MapHeader {...header} />

      <Box flex={1}>
        <MapCanvas
          plans={plans}
          center={center}
          sheetHeight={sheetHeight}
          selectedPlaceId={selectedPlace?.id ?? null}
          onSelectPlaceAction={({ planId, place }) => {
            setSelectedPlanId(planId);
            setSelectedPlace(place);
          }}
        />
      </Box>

      <PlaceBottomSheet
        planId={selectedPlanId}
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />

      <Portal>
        <a href={tempLink} target="_blank">
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 25,
              right: 20,
              width: '3rem',
              height: '3rem',
              minHeight: 0,
              zIndex: (theme) => theme.zIndex.modal + 1,
            }}
          >
            <Map />
          </Fab>
        </a>
      </Portal>
    </Box>
  );
};

export default FullScreenMap;

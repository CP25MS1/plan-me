import { ReactNode, useEffect, useState } from 'react';
import { Map } from 'lucide-react';

import { Box, Fab, Portal } from '@mui/material';
import { DailyPlan, ScheduledPlace } from '@/api/trips';
import { useMapCenter, useSheetHeight, useVisiblePlans } from '../hooks';
import MapHeader from './map-header';
import MapCanvas from './map-canvas';
import PlaceBottomSheet from './place-bottom-sheet';
import { buildGoogleMapsDirectionsLinkFromPlan, usePlaceGeometry } from '@/lib/google-maps';

type FullScreenMapProps = {
  header: {
    title: string;
    onBack?: () => void;
    cta?: ReactNode;
  };
  dailyPlans: DailyPlan[];
  selectedDay: 'ALL' | number;
  focusedPlaceId?: number;
};

const FullScreenMap = ({ header, dailyPlans, selectedDay, focusedPlaceId }: FullScreenMapProps) => {
  const plans = useVisiblePlans(dailyPlans, selectedDay);

  const computedCenter = useMapCenter(dailyPlans, selectedDay);
  const [center, setCenter] = useState(computedCenter);

  const sheetHeight = useSheetHeight(0.5);

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<ScheduledPlace | null>(null);
  const { data: selectedLocation } = usePlaceGeometry(selectedPlace?.ggmp.ggmpId ?? null);

  useEffect(() => {
    const allScheduledPlaces = plans.flatMap((plan) => plan?.scheduledPlaces ?? []);
    const focusedPlace = allScheduledPlaces.find((place) => place.id === focusedPlaceId);
    setSelectedPlace(focusedPlace ?? null);
  }, [focusedPlaceId, plans]);

  useEffect(() => {
    setCenter(computedCenter);
  }, [computedCenter]);

  useEffect(() => {
    if (selectedLocation) {
      setCenter(selectedLocation);
    }
  }, [selectedLocation]);

  const routeLink = buildGoogleMapsDirectionsLinkFromPlan(plans[0]);

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

      {selectedDay !== 'ALL' && (
        <Portal>
          <a href={routeLink} target="_blank">
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
      )}
    </Box>
  );
};

export default FullScreenMap;

'use client';

import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { DailyPlan } from '@/api/trips';

import PlaceMarker from '@/app/trip/[tripId]/@map/components/place-marker';
import { useMapCenter } from '@/lib/google-maps';
import { sortByDateAsc } from '@/lib/date';
import { useDailyPlansSelector } from '@/store/selectors';

type MapComponentProps = {
  selectedDay?: 'ALL' | number;
  viewOnly?: boolean;
  dailyPlans?: DailyPlan[];
};

const MiniMap = ({ selectedDay = 'ALL', viewOnly = false, dailyPlans }: MapComponentProps) => {
  const storeDailyPlans = useDailyPlansSelector();
  const resolvedDailyPlans = dailyPlans ?? storeDailyPlans;
  const mapCenter = useMapCenter(resolvedDailyPlans, selectedDay);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

  const visiblePlans = useMemo(() => {
    if (selectedDay === 'ALL') return resolvedDailyPlans;
    const plan = resolvedDailyPlans[selectedDay];
    return plan ? sortByDateAsc([plan]) : [];
  }, [resolvedDailyPlans, selectedDay]);

  return (
    <Box sx={{ width: '100%', height: 350 }}>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        libraries={['places']}
      >
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={mapCenter}
          zoom={12}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {visiblePlans.map((day) =>
            day.scheduledPlaces.map((sp) => (
              <PlaceMarker
                key={sp.id}
                placeId={sp.ggmp.ggmpId}
                order={sp.order}
                color={day.pinColor}
                selected={selectedPlaceId === sp.id}
                onSelect={() => {
                  if (viewOnly) return;
                  setSelectedPlaceId(sp.id);
                }}
              />
            ))
          )}
        </GoogleMap>
      </LoadScript>
    </Box>
  );
};

export default MiniMap;

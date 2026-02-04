import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { DailyPlan } from '@/api/trips';
import { BANGKOK_LOCATION } from '@/constants/location';

const fetchPlaceGeometry = async (placeId: string) => {
  return new Promise<google.maps.LatLngLiteral>((resolve, reject) => {
    const service = new globalThis.google.maps.places.PlacesService(document.createElement('div'));

    service.getDetails({ placeId, fields: ['geometry'] }, (place, status) => {
      if (
        status === globalThis.google.maps.places.PlacesServiceStatus.OK &&
        place?.geometry?.location
      ) {
        resolve({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      } else {
        reject(status);
      }
    });
  });
};

export const usePlaceGeometry = (placeId: string | null) =>
  useQuery({
    queryKey: ['place-geo', placeId],
    queryFn: () => fetchPlaceGeometry(placeId!),

    enabled: !!placeId && globalThis.window !== undefined && !!globalThis.google?.maps?.places,

    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 30,

    retry: false,
  });

export const useMapCenter = (dailyPlans: DailyPlan[], selectedDay: 'ALL' | number) => {
  const centerPlaceId = useMemo(() => {
    const plans = selectedDay === 'ALL' ? dailyPlans : [dailyPlans[selectedDay]];

    const firstDayWithPlace = plans.find((d) => d.scheduledPlaces.length > 0);

    return firstDayWithPlace?.scheduledPlaces[0]?.ggmp.ggmpId ?? null;
  }, [dailyPlans, selectedDay]);

  const { data } = usePlaceGeometry(centerPlaceId);

  return data ?? BANGKOK_LOCATION;
};
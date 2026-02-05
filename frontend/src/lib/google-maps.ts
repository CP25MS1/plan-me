import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { DailyPlan, ScheduledPlace } from '@/api/trips';
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

const encode = (v: string) => encodeURIComponent(v);

const placeLabel = (p: ScheduledPlace) => p.ggmp.enName || p.ggmp.thName || 'Place';

export const buildGoogleMapsDirectionsLinkFromPlan = (
  plan: DailyPlan,
  travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
) => {
  const places = [...plan.scheduledPlaces].sort((a, b) => a.order - b.order);
  if (places.length === 0) return '';

  const origin = places[0];
  const destination = places.at(-1);

  if (places.length === 1 || !destination) {
    const p = places[0];
    return (
      'https://www.google.com/maps/search/?api=1' +
      `&query=${encode(placeLabel(p))}` +
      `&query_place_id=${p.ggmp.ggmpId}`
    );
  }

  const waypoints = places.slice(1, -1).map((p) => {
    return `${encode(placeLabel(p))}::place_id:${p.ggmp.ggmpId}`;
  });

  let url =
    'https://www.google.com/maps/dir/?api=1' +
    `&origin=${encode(placeLabel(origin))}` +
    `&origin_place_id=${origin.ggmp.ggmpId}` +
    `&destination=${encode(placeLabel(destination))}` +
    `&destination_place_id=${destination.ggmp.ggmpId}`;

  if (waypoints.length > 0) {
    url += `&waypoints=${waypoints.join('|')}`;
  }

  url += `&travelmode=${travelMode}`;

  return url;
};

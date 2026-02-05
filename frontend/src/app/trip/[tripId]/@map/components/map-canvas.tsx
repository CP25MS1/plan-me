'use client';

import { useRef } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import PlaceMarker from './place-marker';
import { offsetLatLng } from '../helpers/offset-lat-lng';
import { DailyPlan, ScheduledPlace } from '@/api/trips';

type MapCanvasProps = {
  plans: DailyPlan[];
  center: google.maps.LatLngLiteral;
  sheetHeight: number;
  selectedPlaceId: number | null;
  onSelectPlaceAction: ({ planId, place }: { planId: number; place: ScheduledPlace }) => void;
};

const MapCanvas = ({
  plans,
  center,
  sheetHeight,
  selectedPlaceId,
  onSelectPlaceAction,
}: MapCanvasProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={['places']}
    >
      <GoogleMap
        center={center}
        zoom={12}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
        }}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        {plans.flatMap((day) =>
          day.scheduledPlaces.map((sp) => (
            <PlaceMarker
              key={sp.id}
              placeId={sp.ggmp.ggmpId}
              order={sp.order}
              color={day.pinColor}
              selected={selectedPlaceId === sp.id}
              onSelect={(latLng) => {
                onSelectPlaceAction({ planId: day.id, place: sp });

                requestAnimationFrame(() => {
                  if (!mapRef.current) return;
                  mapRef.current.panTo(offsetLatLng(mapRef.current, latLng, sheetHeight / 2));
                });
              }}
            />
          ))
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapCanvas;

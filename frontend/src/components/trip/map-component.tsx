'use client';

import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { useState } from 'react';

type CustomMapProps = {};

export default function CustomMap({}: CustomMapProps) {
  // ตั้งค่าเริ่มต้นที่ Bangkok
  const [mapCenter, setMapCenter] = useState({ lat: 13.7563, lng: 100.5018 });

  const containerStyle = {
    width: '100%',
    height: '350px',
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            // ปรับ zoom ให้เห็นทั้งประเทศไทย
            zoom={6}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          />
        </LoadScript>
      </div>
    </div>
  );
}

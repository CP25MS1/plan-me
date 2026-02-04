import { ReactNode, useMemo, useRef, useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { Box, IconButton, SwipeableDrawer } from '@mui/material';
import { ChevronLeft } from 'lucide-react';

import { TruncatedTooltip } from '@/components/atoms';
import { DailyPlan } from '@/api/trips';
import PlaceMarker from './place-marker';
import { usePlaceGeometry } from '@/lib/google-maps';
import { BANGKOK_LOCATION } from '@/constants/location';

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
  const handleOnBack = () => {
    if (header.onBack) return header.onBack();
    if (globalThis.history.length > 1) return globalThis.history.back();
  };

  const visiblePlans = useMemo(() => {
    if (selectedDay === 'ALL') return dailyPlans;
    return [dailyPlans[selectedDay]];
  }, [dailyPlans, selectedDay]);

  const centerPlaceId = useMemo(() => {
    const plans = selectedDay === 'ALL' ? dailyPlans : [dailyPlans[selectedDay]];

    const firstDay = plans.find((d) => d.scheduledPlaces.length > 0);
    return firstDay?.scheduledPlaces[0]?.ggmp.ggmpId ?? null;
  }, [dailyPlans, selectedDay]);

  const { data: centerLocation } = usePlaceGeometry(centerPlaceId);
  const mapCenter = centerLocation ?? BANGKOK_LOCATION;

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const SHEET_HEIGHT = window.innerHeight * 0.5; // ครึ่งจอ

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          paddingX: 1,
          paddingY: 1.25,
        }}
      >
        {/* Left */}
        <Box>
          <IconButton onClick={handleOnBack}>
            <ChevronLeft />
          </IconButton>
        </Box>

        {/* Center (title) */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '70%',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <TruncatedTooltip text={header.title} className="text-2xl" />
        </Box>

        {/* Right (CTA) */}
        {header.cta}
      </Box>

      {/* Map */}
      <Box flex={1}>
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
          libraries={['places']}
        >
          <GoogleMap
            onLoad={(map) => {
              mapRef.current = map;
            }}
            mapContainerStyle={{
              width: '100%',
              height: '100%',
            }}
            center={mapCenter}
            zoom={12}
            options={{
              fullscreenControl: false,
              mapTypeControl: false,
              streetViewControl: false,
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
                    setSelectedPlaceId(sp.id);
                    requestAnimationFrame(() => {
                      mapRef.current?.panBy(0, -SHEET_HEIGHT / 2);
                    });
                  }}
                />
              ))
            )}
          </GoogleMap>
        </LoadScript>
      </Box>

      <SwipeableDrawer
        anchor="bottom"
        open={!!selectedPlaceId}
        onClose={() => setSelectedPlaceId(null)}
        onOpen={() => {}}
        swipeAreaWidth={24}
        disableSwipeToOpen={false}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              height: '50vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              p: 2,
            },
          },
        }}
      >
        {/* Content */}
        {selectedPlaceId && (
          <Box>
            <Box
              sx={{
                width: 40,
                height: 4,
                bgcolor: 'grey.400',
                borderRadius: 2,
                mx: 'auto',
                mb: 2,
              }}
            />
            <div>Place ID: {selectedPlaceId}</div>
            {/* ใส่รายละเอียดสถานที่ต่อได้ */}
          </Box>
        )}
      </SwipeableDrawer>
    </Box>
  );
};

export default FullScreenMap;

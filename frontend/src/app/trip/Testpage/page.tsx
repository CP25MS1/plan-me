'use client';

import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Car, Bike, PersonStanding } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import AddItemButton from '@/components/trip/overview/add-item-button';

import { useCreateTravelSegment } from '@/app/trip/[tripId]/@daily/hooks/travel-segments';

const MOCK_PLACES = [
  {
    id: 'ChIJCxd7WFKe4jARBpavYzUGhlo',
    name: 'Market Place Thonglor',
  },
  { id: 'ChIJY-4yKQCf4jARGpdFc75ypaY', name: 'Ginza Thonglor' },
];

type TravelMode = 'CAR' | 'MOTORCYCLE' | 'WALK';

const MODE_META: Record<TravelMode, { label: string; icon: React.ReactNode }> = {
  CAR: {
    label: 'รถยนต์',
    icon: <Car size={20} color="#25CF7A" />,
  },
  MOTORCYCLE: {
    label: 'จักรยานยนต์',
    icon: <Bike size={20} color="#25CF7A" />,
  },
  WALK: {
    label: 'เดิน',
    icon: <PersonStanding size={20} color="#25CF7A" />,
  },
};

export default function Testpage() {
  const [startId, setStartId] = useState(MOCK_PLACES[0].id);
  const [endId, setEndId] = useState(MOCK_PLACES[1].id);

  const [mode, setMode] = useState<TravelMode>('CAR');

  const { mutate, data, isPending, error } = useCreateTravelSegment();

  const handleSubmit = () => {
    mutate({
      startPlaceId: startId,
      endPlaceId: endId,
      mode,
    });
  };

  return (
    <Box
      sx={{
        mt: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      {/* Start */}
      <select value={startId} onChange={(e) => setStartId(e.target.value)}>
        {MOCK_PLACES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* End */}
      <select value={endId} onChange={(e) => setEndId(e.target.value)}>
        {MOCK_PLACES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Mode */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <AddItemButton label={`วิธีเดินทาง: ${MODE_META[mode].label}`} />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center">
          {(Object.keys(MODE_META) as TravelMode[]).map((m) => (
            <DropdownMenuItem
              key={m}
              onClick={() => setMode(m)}
              className="flex items-center gap-2"
            >
              {MODE_META[m].icon}
              {MODE_META[m].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Button */}
      <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
        {isPending ? 'Calculating...' : 'POST /travel-segments'}
      </Button>

      {/* Result */}
      {error && <Typography color="error">Error occurred</Typography>}

      {data && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: '1px solid #ddd',
            borderRadius: 2,
            minWidth: 260,
            textAlign: 'center',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            {MODE_META[mode].icon}
            <Typography>{MODE_META[mode].label}</Typography>
          </Box>

          <Typography sx={{ mt: 1 }}>ระยะทาง: {(data.distance / 1000).toFixed(2)} km</Typography>

          <Typography>เวลา: {(data.regularDuration / 60).toFixed(0)} นาที</Typography>
        </Box>
      )}
    </Box>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Car, Bike, PersonStanding } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import { useCreateTravelSegment } from '@/app/trip/[tripId]/@daily/hooks/travel-segments';
import { useSelectRoute } from '@/store/selectors';

type TravelMode = 'CAR' | 'MOTORCYCLE' | 'WALK';

const Mode_Segment: Record<TravelMode, { label: string; icon: React.ReactNode }> = {
  CAR: {
    label: 'รถยนต์',
    icon: <Car size={18} color="#25CF7A" />,
  },
  MOTORCYCLE: {
    label: 'จักรยานยนต์',
    icon: <Bike size={18} color="#25CF7A" />,
  },
  WALK: {
    label: 'เดิน',
    icon: <PersonStanding size={18} color="#25CF7A" />,
  },
};

const formatDuration = (seconds: number) => {
  const totalMinutes = Math.round(seconds / 60);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} ชม ${minutes} นาที`;
  }

  return `${totalMinutes} นาที`;
};

interface Props {
  start: string;
  end: string;
}

export default function TravelSegmentSelect({ start, end }: Props) {
  const [mode, setMode] = useState<TravelMode>('CAR');
  const [hasError, setHasError] = useState(true);
  const { mutate } = useCreateTravelSegment();

  const travelSegment = useSelectRoute(start, end, mode);

  const lastRequestRef = useRef<{
    start: string;
    end: string;
    mode: TravelMode;
  } | null>(null);

  useEffect(() => {
    if (!start || !end) return;

    const last = lastRequestRef.current;

    const isSame = last?.start === start && last?.end === end && last?.mode === mode;

    if (isSame) return;

    lastRequestRef.current = { start, end, mode };

    mutate(
      {
        startPlaceId: start,
        endPlaceId: end,
        mode,
      },
      {
        onError: () => {
          setHasError(true);
        },
        onSuccess: () => {
          setHasError(false);
        },
      }
    );
  }, [start, end, mode, mutate]);

  return (
    <Box
      sx={{
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.25,
      }}
    >
      {/* MODE BUTTON */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="small"
            variant="outlined"
            startIcon={Mode_Segment[mode].icon}
            sx={{
              minWidth: 'auto',
              px: 1,
              py: 0.25,
              textTransform: 'none',
              fontSize: 13,
              borderRadius: 2,

              borderColor: '#25CF7A',
              color: '#25CF7A',

              '&:hover': {
                backgroundColor: 'rgba(37, 207, 122, 0.08)',
                borderColor: '#25CF7A',
              },
            }}
          >
            {Mode_Segment[mode].label}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          {(Object.keys(Mode_Segment) as TravelMode[]).map((m) => (
            <DropdownMenuItem
              key={m}
              onClick={() => setMode(m)}
              className="flex items-center gap-2"
            >
              {Mode_Segment[m].icon}
              {Mode_Segment[m].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* RESULT TEXT */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {travelSegment ? (
          <>
            <Typography>ระยะทาง : {(travelSegment.distance / 1000).toFixed(2)} km</Typography>

            <Typography>เวลา : {formatDuration(travelSegment.regularDuration)}</Typography>
          </>
        ) : hasError ? (
          <Typography variant="body2" color="error">
            ไม่สามารถคำนวณการเดินทางด้วย {Mode_Segment[mode].label} ได้
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              ระยะทาง: —
            </Typography>

            <Typography variant="body2" color="text.secondary">
              • เวลา: —
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

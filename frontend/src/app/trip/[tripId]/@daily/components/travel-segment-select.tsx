'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import { Bike, Car, Footprints } from 'lucide-react';
import { tokens } from '@/providers/theme/design-tokens';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useCreateTravelSegment } from '@/app/trip/[tripId]/@daily/hooks/travel-segments';
import { useSelectRoute } from '@/store/selectors';
import { TravelMode } from '@/api/trips/type';

const ModeSegment: Record<TravelMode, { label: string; icon: React.ReactNode }> = {
  CAR: {
    label: 'รถยนต์',
    icon: <Car size={18} color={tokens.color.primary} />,
  },
  MOTORCYCLE: {
    label: 'จักรยานยนต์',
    icon: <Bike size={18} color={tokens.color.primary} />,
  },
  WALK: {
    label: 'เดิน',
    icon: <Footprints size={18} color={tokens.color.primary} />,
  },
};

const formatDuration = (seconds: number) => {
  const totalMinutes = Math.round(seconds / 60);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return minutes === 0 ? `${hours} ชม` : `${hours} ชม ${minutes} นาที`;
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
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useCreateTravelSegment();

  const travelSegment = useSelectRoute(start, end, mode);

  const lastRequestRef = useRef<{
    start: string;
    end: string;
    mode: TravelMode;
  } | null>(null);

  useEffect(() => {
    if (!start || !end) return;

    lastRequestRef.current = { start, end, mode };

    setIsLoading(true);
    setHasError(false);

    mutate(
      {
        startPlaceId: start,
        endPlaceId: end,
        mode,
      },
      {
        onError: () => {
          setHasError(true);
          setIsLoading(false);
        },
        onSuccess: () => {
          setHasError(false);
          setIsLoading(false);
        },
      }
    );
  }, [start, end, mode, mutate]);

  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        marginLeft: '1rem',
        gap: 1.25,
      }}
    >
      {/* MODE BUTTON */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="small"
            variant="outlined"
            startIcon={ModeSegment[mode].icon}
            sx={{
              minWidth: 'auto',
              px: 1,
              py: 0.25,
              textTransform: 'none',
              fontSize: 13,
              borderRadius: 2,

              borderColor: tokens.color.primary,
              color: tokens.color.primary,

              '&:hover': {
                backgroundColor: tokens.color.primaryDark,
                borderColor: tokens.color.primary,
              },
            }}
          >
            {ModeSegment[mode].label}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          {(Object.keys(ModeSegment) as TravelMode[]).map((m) => (
            <DropdownMenuItem
              key={m}
              onClick={() => setMode(m)}
              className="flex items-center gap-2"
            >
              {ModeSegment[m].icon}
              {ModeSegment[m].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* RESULT TEXT */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {travelSegment ? (
          <>
            <Typography sx={{ fontSize: 12, color: tokens.color.textSecondary }}>
              {(travelSegment.distance / 1000).toFixed(2)} กม.
            </Typography>

            <Typography sx={{ fontSize: 12, color: tokens.color.textSecondary }}>
              {formatDuration(travelSegment.regularDuration)}
            </Typography>
          </>
        ) : isLoading ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="text" width={95} height={22} />
            <Skeleton variant="text" width={85} height={22} />
          </Box>
        ) : hasError ? (
          <Typography sx={{ fontSize: 12, color: tokens.color.error }} variant="body2">
            ไม่สามารถเดินทางด้วย {ModeSegment[mode].label} ได้
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

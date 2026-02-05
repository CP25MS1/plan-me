'use client';

import React from 'react';
import { Box, Card, Typography, Skeleton, Stack, Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Objective } from '@/api/trips';
import { TruncatedTooltip } from '@/components/atoms';

export interface TripItem {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  objectives?: Objective[];
}

interface TripListProps {
  trips?: TripItem[];
  title?: string;
  loading?: boolean;
  error?: boolean;
  onTripClick?: (tripId: number) => void;
  t?: (key: string) => string;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
  });
};

export const TripList: React.FC<TripListProps> = ({
  trips,
  title,
  loading,
  error,
  onTripClick,
  t,
}) => {
  if (loading)
    return (
      <Box sx={{ p: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={90} sx={{ borderRadius: 3, mb: 2 }} />
        ))}
      </Box>
    );

  if (error)
    return (
      <Typography sx={{ p: 4 }} color="error">
        {t?.('loadfail') ?? 'Load failed'}
      </Typography>
    );

  return (
    <Box
      sx={{
        p: 4,
        width: '100%',
        maxWidth: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 2.5,
      }}
    >
      {title && (
        <Typography variant="h4" fontWeight={700} gridColumn="span 2">
          {title}
        </Typography>
      )}

      {trips
        ?.slice()
        .sort((a, b) => b.id - a.id)
        .map((trip) => (
          <Card
            key={trip.id}
            onClick={() => onTripClick?.(trip.id)}
            sx={{
              p: 2.5,
              borderRadius: 3,
              cursor: onTripClick ? 'pointer' : 'default',
              transition: '0.25s ease',
              background: 'linear-gradient(135deg, #fff 0%, #fafafa 100%)',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Stack spacing={1}>
              <TruncatedTooltip text={trip.name} className="max-w-full text-base font-semibold" />

              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'nowrap' }}>
                <CalendarMonthIcon sx={{ fontSize: 16 }} color="action" />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                </Typography>
              </Stack>
            </Stack>

            {trip.objectives && trip.objectives.length > 0 && (
              <Stack direction="row" flexWrap="wrap">
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  sx={{
                    mt: 0.5,
                    columnGap: 1,
                    rowGap: 1,
                  }}
                >
                  {trip.objectives.slice(0, 4).map((obj) => (
                    <Chip
                      key={obj.id ?? obj.name}
                      label={obj.name}
                      size="small"
                      clickable={false}
                      sx={{
                        bgcolor: obj.badgeColor ?? '#C8F7D8',
                        pointerEvents: 'none',
                        fontSize: 11,
                        height: 22,
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            )}
          </Card>
        ))}
    </Box>
  );
};

'use client';

import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useGetAllTrips } from './hooks/use-get-all-trips';
import { useTranslation } from 'react-i18next';

const AllTripPage = () => {
  const router = useRouter();
  const { data: trips, isLoading, isError } = useGetAllTrips();
  const { t } = useTranslation('trip_all');
  const handleClick = (tripId: number) => {
    router.push(`/trip/${tripId}?tab=overview`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) return <Typography sx={{ p: 4 }}>{t('loaddata')}</Typography>;
  if (isError) return <Typography sx={{ p: 4 }}>{t('loadfail')}</Typography>;

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" gutterBottom>
        {t('title')}
      </Typography>

      {trips
        ?.slice()
        .sort((a, b) => b.id - a.id)
        .map((trip) => (
          <Card
            key={trip.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 2,
              borderRadius: 2,
              boxShadow: 3,
              cursor: 'pointer',
              '&:hover': { boxShadow: 6 },
              width: '100%',
            }}
            onClick={() => handleClick(trip.id)}
          >
            <Box>
              <Typography variant="h6">{trip.name}</Typography>
              <Typography color="text.secondary">
                {t('date')} {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </Typography>
            </Box>
          </Card>
        ))}
    </Box>
  );
};

export default AllTripPage;

'use client';

import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

// ตัวอย่างข้อมูลทริป
const trips = [
  { id: 1, name: 'ทริปเชียงใหม่', startDate: '2025-12-05', endDate: '2025-12-08' },
  { id: 2, name: 'ทริปภูเก็ต', startDate: '2025-12-10', endDate: '2025-12-12' },
  { id: 3, name: 'ทริปกรุงเทพ', startDate: '2025-12-15', endDate: '2025-12-16' },
];

const AllTripPage = () => {
  const router = useRouter();

  const handleClick = (tripId: number) => {
    router.push(`/trip/${tripId}/overview`);
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" gutterBottom>
        ทริปทั้งหมด
      </Typography>

      {trips.map((trip) => (
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
              วันที่: {trip.startDate} - {trip.endDate}
            </Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default AllTripPage;

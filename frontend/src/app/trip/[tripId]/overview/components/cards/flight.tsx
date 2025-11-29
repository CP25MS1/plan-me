'use client';

import { Box, Typography } from '@mui/material';
import { Plane } from 'lucide-react';

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

export default function FlightCard() {
  const mockData = {
    airlineName: 'Nok Air',
    classType: 'Economy',
    gate: 'H22',
    flightNumber: 'AC 2505',
    seatNumber: 'A30',
    confirmation: '95159616',
    originAirport: 'Donmuang',
    destinationAirport: 'Hua Hin',
    passengerName: 'Numleab Seatung',
    departTime: '2025-07-20T15:00:00',
    arrivalTime: '2025-07-20T17:00:00',
    date: '2025-07-20',
    price: 800,
  };

  const ColItem = ({ label, value }: { label: string; value: string }) => (
    <Box>
      <Typography
        variant="caption"
        sx={{
          fontSize: '9px',
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: '11px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        border: '1px solid #E5E5E5',
        borderRadius: 2,
        p: 1,
        bgcolor: '#fff',
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.8,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Plane size={16} color="#25CF7A" />
          <Typography variant="subtitle2" sx={{ fontSize: '13px', fontWeight: 700 }}>
            เที่ยวบิน
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            background: '#F5F5F5',
            px: 0.8,
            py: 0.2,
            borderRadius: 1,
            fontSize: '10px',
          }}
        >
          THB {mockData.price.toFixed(2)}
        </Typography>
      </Box>

      {/* 4 Columns */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.8,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="สายการบิน" value={mockData.airlineName} />
          <ColItem label="คลาส" value={mockData.classType} />
          <ColItem label="Gate" value={mockData.gate} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="เที่ยวบิน" value={mockData.flightNumber} />
          <ColItem label="ที่นั่ง" value={mockData.seatNumber} />
          <ColItem label="CONFIRMATION #" value={mockData.confirmation} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="ต้นทาง" value={mockData.originAirport} />
          <ColItem label="ปลายทาง" value={mockData.destinationAirport} />
          <ColItem label="ผู้จอง" value={mockData.passengerName} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="ขึ้นเครื่อง" value={formatTime(mockData.departTime)} />
          <ColItem label="ถึง" value={formatTime(mockData.arrivalTime)} />
          <ColItem label="วันที่" value={formatDate(mockData.date)} />
        </Box>
      </Box>
    </Box>
  );
}

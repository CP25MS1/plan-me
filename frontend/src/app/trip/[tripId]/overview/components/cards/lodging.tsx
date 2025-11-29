'use client';

import { Box, Typography, Divider, Tooltip } from '@mui/material';
import { Building, Phone, Mail, UserRound } from 'lucide-react';

const formatDate = (datetime: string, withTime = false) => {
  if (!datetime) return '-';
  const d = new Date(datetime);

  const date = d.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
  });

  if (!withTime) return date;

  const time = d.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${date} ${time}`;
};

export default function LodgingCard() {
  const mockData = {
    hotelName: 'อศิรา บูทีคหัวหิน',
    hotelAddress: '4 Damrongrat Rd, Tambon Hua Hin, Hua Hin District, Prachuap Khiri Khan 77110',
    guestName: 'Numleab Seatung',
    checkIn: '2025-07-20T14:00',
    checkOut: '2025-07-24T12:00',
    bookingNumber: '123546457853422',
    phone: '065-8895347',
    email: 'arsira@gmail.com',
    price: 1800,
  };

  return (
    <Box
      sx={{
        border: '1px solid #E5E5E5',
        borderRadius: 2,
        p: 1.5,
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        maxWidth: 400,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Building size={18} color="#25CF7A" />
          <Typography variant="subtitle2" fontWeight={600}>
            ที่พัก
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={600}>
          {formatDate(mockData.checkIn)} → {formatDate(mockData.checkOut)}
        </Typography>
      </Box>

      {/* Main content */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {/* Left */}
        <Box sx={{ flex: 1 }}>
          <Tooltip title={mockData.hotelName}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              noWrap
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
                maxWidth: 250,
              }}
            >
              {mockData.hotelName}
            </Typography>
          </Tooltip>
          <Tooltip title={mockData.hotelAddress}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                maxWidth: 250,
                fontSize: 11,
                mt: 0.5,
              }}
            >
              {mockData.hotelAddress}
            </Typography>
          </Tooltip>

          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Phone size={14} />
              <Typography variant="caption">{mockData.phone}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Mail size={14} />
              <Typography variant="caption">{mockData.email}</Typography>
            </Box>
          </Box>

          <Typography variant="caption" sx={{ mt: 1 }}>
            <b>CONFIRM #</b> {mockData.bookingNumber}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Right */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <UserRound size={14} />
            <Typography
              variant="subtitle2"
              fontWeight={700}
              noWrap
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {mockData.guestName}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Check In
          </Typography>
          <Typography variant="caption">{formatDate(mockData.checkIn, true)}</Typography>

          <Typography variant="caption" color="text.secondary">
            Check Out
          </Typography>
          <Typography variant="caption">{formatDate(mockData.checkOut, true)}</Typography>

          <Box sx={{ mt: 0.5, textAlign: 'right' }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                background: '#F5F5F5',
                px: 1.5,
                py: 0.25,
                borderRadius: 1,
                display: 'inline-block',
              }}
            >
              THB {mockData.price.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

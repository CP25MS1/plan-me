'use client';

import { Box, Typography, Divider } from '@mui/material';
import {
  Utensils,
  Phone,
  Mail,
  UserRound,
  Calendar,
  Clock,
  MapPin,
  Table,
  Ticket,
  Users,
} from 'lucide-react';

const formatDate = (datetime: string) => {
  if (!datetime) return '-';
  const d = new Date(datetime);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
};

export default function RestaurantCard() {
  const mockData = {
    restaurantName: 'Yakiniku Beef',
    restaurantAddress:
      '4 Damrongrat Rd, Tambon Hua Hin, Hua Hin District, Prachuap Khiri Khan 77110',
    guestName: 'Numleab Seatung',
    bookingDate: '2025-07-20',
    bookingTime: '14:00',
    tableNumber: '41',
    queueNumber: '311',
    memberCount: 4,
    phone: '028-85645347',
    email: 'yakikuro@gmail.com',
    price: 1500,
    bookingNumber: '459651561162',
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
          <Utensils size={18} color="#25CF7A" />
          <Typography variant="subtitle2" fontWeight={600}>
            ร้านอาหาร
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={600}>
          {formatDate(mockData.bookingDate)}
        </Typography>
      </Box>

      {/* Main content */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {/* Left */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {mockData.restaurantName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {mockData.restaurantAddress}
          </Typography>

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
            <b>CONFIRMATION #</b> {mockData.bookingNumber}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Right */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Clock size={14} />
            <Typography variant="caption">{mockData.bookingTime}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <UserRound size={14} />
            <Typography variant="caption">{mockData.guestName}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Table size={14} />
            <Typography variant="caption">หมายเลขโต๊ะ {mockData.tableNumber}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Ticket size={14} />
            <Typography variant="caption">หมายเลขคิว {mockData.queueNumber}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Users size={14} />
            <Typography variant="caption">จำนวนสมาชิก {mockData.memberCount}</Typography>
          </Box>

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

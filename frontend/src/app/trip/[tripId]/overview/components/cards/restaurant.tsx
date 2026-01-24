'use client';

import { ReservationDto, RestaurantDetails } from '@/api/reservations';
import { Box, Typography, Divider } from '@mui/material';
import { Utensils, Phone, Mail, UserRound, Clock, Table, Ticket, Users } from 'lucide-react';

const formatDate = (datetime: string) => {
  if (!datetime) return '-';
  const d = new Date(datetime);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
};

export default function RestaurantCard({ data }: { data: ReservationDto | null }) {
  const restaurantDetails = (data as unknown as RestaurantDetails) || null;

  const restaurant = {
    restaurantName: restaurantDetails?.restaurantName || '',
    restaurantAddress: restaurantDetails?.restaurantAddress || '',
    underName: restaurantDetails?.underName || '',
    reservationDate: restaurantDetails?.reservationDate || '',
    reservationTime: restaurantDetails?.reservationTime || '',
    tableNo: restaurantDetails?.tableNo || '',
    queueNo: restaurantDetails?.queueNo || '',
    partySize: restaurantDetails?.partySize,
    bookingRef: data?.bookingRef || '',
    contactTel: data?.contactTel || '',
    contactEmail: data?.contactEmail || '',
    cost: Number(data?.cost),
  };

  return (
    <Box
      sx={{
        width: '100%', // ✅ สำคัญ
        border: '1px solid #E5E5E5',
        borderRadius: 2,
        p: 1.5,
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
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
          {formatDate(restaurant.reservationDate)}
        </Typography>
      </Box>

      {/* Main */}
      <Box sx={{ display: 'flex', gap: 1.5, minWidth: 0 }}>
        {/* Left */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {restaurant.restaurantName}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
            {restaurant.restaurantAddress}
          </Typography>

          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <Phone size={14} />
              <Typography variant="caption" noWrap>
                {restaurant.contactTel}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <Mail size={14} />
              <Typography variant="caption" noWrap>
                {restaurant.contactEmail}
              </Typography>
            </Box>
          </Box>

          <Typography variant="caption" sx={{ mt: 1 }} noWrap>
            <b>CONFIRMATION #</b> {restaurant.bookingRef}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Right */}
        <Box sx={{ width: 150, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Info icon={<Clock size={14} />} text={restaurant.reservationTime || '-'} />
          <Info icon={<UserRound size={14} />} text={restaurant.underName} />
          <Info icon={<Table size={14} />} text={`หมายเลขโต๊ะ ${restaurant.tableNo}`} />
          <Info icon={<Ticket size={14} />} text={`หมายเลขคิว ${restaurant.queueNo}`} />
          <Info icon={<Users size={14} />} text={`จำนวนสมาชิก ${restaurant.partySize}`} />

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
              THB {restaurant.cost?.toFixed(2) ?? '-'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* helper */
function Info({ icon, text }: { icon: React.ReactNode; text?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      {icon}
      <Typography variant="caption" noWrap>
        {text || '-'}
      </Typography>
    </Box>
  );
}

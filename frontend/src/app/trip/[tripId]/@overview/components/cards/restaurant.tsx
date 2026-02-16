'use client';

import { ReservationDto, RestaurantDetails } from '@/api/reservations';
import { Box, Typography, Divider, Tooltip, Stack } from '@mui/material';
import { Utensils, Phone, Mail, UserRound, Clock, Table, Ticket, Users } from 'lucide-react';
import { formatCurrencyTHB } from '@/lib/string';

const formatDate = (datetime: string) => {
  if (!datetime) return '-';
  const d = new Date(datetime);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
};

const formatTime = (time?: string) => {
  if (!time) return '-';
  return time.slice(0, 5);
};

export default function RestaurantCard({ data }: { data: ReservationDto | null }) {
  const restaurantDetails =
    (data?.details as RestaurantDetails | undefined) ?? (data as unknown as RestaurantDetails);

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
        width: '100%',
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
          <Tooltip title={restaurant.restaurantName} arrow disableInteractive>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              noWrap
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'default',
              }}
            >
              {restaurant.restaurantName}
            </Typography>
          </Tooltip>

          <Tooltip title={restaurant.restaurantAddress} arrow disableInteractive>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                cursor: 'default',
              }}
            >
              {restaurant.restaurantAddress}
            </Typography>
          </Tooltip>

          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <Phone size={14} />
              <Tooltip title={restaurant.contactTel} arrow disableInteractive>
                <Typography
                  variant="caption"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'default',
                  }}
                >
                  {restaurant.contactTel || '-'}
                </Typography>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <Mail size={14} />
              <Tooltip title={restaurant.contactEmail} arrow disableInteractive>
                <Typography
                  variant="caption"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'default',
                  }}
                >
                  {restaurant.contactEmail || '-'}
                </Typography>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Stack direction="column" alignItems="flex-center" textAlign="center" spacing={0.5}>
              <Typography variant="caption" fontWeight={600}>
                หมายเลขการจอง
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {restaurant.bookingRef || ''}
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Right */}
        <Box sx={{ width: 150, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Info icon={<Clock size={14} />} text={formatTime(restaurant.reservationTime)} />
          <Info icon={<UserRound size={14} />} text={restaurant.underName} />
          <Info icon={<Table size={14} />} text={`หมายเลขโต๊ะ ${restaurant.tableNo}`} />
          <Info icon={<Ticket size={14} />} text={`หมายเลขคิว ${restaurant.queueNo}`} />
          <Info
            icon={<Users size={14} />}
            text={
              restaurant.partySize != null ? `จำนวนสมาชิก ${restaurant.partySize}` : 'จำนวนสมาชิก'
            }
          />

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
              {formatCurrencyTHB(restaurant.cost)}
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

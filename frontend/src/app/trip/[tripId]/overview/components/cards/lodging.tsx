'use client';

import { LodgingDetails, ReservationDto } from '@/api/reservations';
import { Box, Typography, Divider } from '@mui/material';
import { Building, Phone, Mail, UserRound, Clock } from 'lucide-react';

const formatDate = (datetime: string) => {
  if (!datetime) return '-';
  const d = new Date(datetime);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
};

const formatDateTime = (datetime: string) => {
  if (!datetime) return '-';
  const d = new Date(datetime);
  const date = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
  const time = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} ${time}`;
};

export default function LodgingCard({ data }: { data: ReservationDto | null }) {
  const lodgingDetails = (data as unknown as LodgingDetails) || null;

  const lodging = {
    lodgingName: lodgingDetails?.lodgingName || '',
    lodgingAddress: lodgingDetails?.lodgingAddress || '',
    underName: lodgingDetails?.underName || '',
    checkinDate: lodgingDetails?.checkinDate || '',
    checkoutDate: lodgingDetails?.checkoutDate || '',
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
          <Building size={18} color="#25CF7A" />
          <Typography variant="subtitle2" fontWeight={600}>
            ที่พัก
          </Typography>
        </Box>

        <Typography variant="caption" fontWeight={600}>
          {formatDate(lodging.checkinDate)} → {formatDate(lodging.checkoutDate)}
        </Typography>
      </Box>

      {/* Main */}
      <Box sx={{ display: 'flex', gap: 1.5, minWidth: 0 }}>
        {/* Left */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {lodging.lodgingName}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
            {lodging.lodgingAddress}
          </Typography>

          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Phone size={14} />
              <Typography variant="caption" noWrap>
                {lodging.contactTel || '-'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Mail size={14} />
              <Typography variant="caption" noWrap>
                {lodging.contactEmail || '-'}
              </Typography>
            </Box>
          </Box>

          <Typography variant="caption" sx={{ mt: 1 }} noWrap>
            <b>CONFIRMATION #</b> {lodging.bookingRef || '-'}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Right (เหมือนร้านอาหาร) */}
        <Box sx={{ width: 150, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Info icon={<UserRound size={14} />} text={lodging.underName} />
          <Info
            icon={<Clock size={14} />}
            text={`Check-in ${formatDateTime(lodging.checkinDate)}`}
          />
          <Info
            icon={<Clock size={14} />}
            text={`Check-out ${formatDateTime(lodging.checkoutDate)}`}
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
              THB {lodging.cost?.toFixed(2) ?? '-'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

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

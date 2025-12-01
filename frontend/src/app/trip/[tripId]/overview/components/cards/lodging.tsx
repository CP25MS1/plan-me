'use client';

import { LodgingDetails, ReservationDto } from '@/api/reservations';
import { Box, Typography, Divider, Tooltip } from '@mui/material';
import { Building, Phone, Mail, UserRound } from 'lucide-react';

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

  const formatDate = (datetime: string, withTime = false) => {
    if (!datetime) return '-';
    const d = new Date(datetime);
    const date = d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
    if (!withTime) return date;
    const time = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
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
          {formatDate(lodging.checkinDate)} → {formatDate(lodging.checkoutDate)}
        </Typography>
      </Box>

      {/* Main content */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Tooltip title={lodging.lodgingName}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              noWrap
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 250 }}
            >
              {lodging.lodgingName}
            </Typography>
          </Tooltip>
          <Tooltip title={lodging.lodgingAddress}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ maxWidth: 250, fontSize: 11, mt: 0.5 }}
            >
              {lodging.lodgingAddress}
            </Typography>
          </Tooltip>

          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {lodging.contactTel && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Phone size={14} />
                <Typography variant="caption">{lodging.contactTel}</Typography>
              </Box>
            )}
            {lodging.contactEmail && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Mail size={14} />
                <Typography variant="caption">{lodging.contactEmail}</Typography>
              </Box>
            )}
          </Box>

          {lodging.bookingRef && (
            <Typography variant="caption" sx={{ mt: 1 }}>
              <b>CONFIRM #</b> {lodging.bookingRef}
            </Typography>
          )}
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <UserRound size={14} />
            <Typography
              variant="subtitle2"
              fontWeight={700}
              noWrap
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {lodging.underName}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Check In
          </Typography>
          <Typography variant="caption">{formatDate(lodging.checkinDate, true)}</Typography>

          <Typography variant="caption" color="text.secondary">
            Check Out
          </Typography>
          <Typography variant="caption">{formatDate(lodging.checkoutDate, true)}</Typography>

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

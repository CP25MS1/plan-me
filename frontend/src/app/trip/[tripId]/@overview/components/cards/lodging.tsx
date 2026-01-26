'use client';

import { LodgingDetails, ReservationDto } from '@/api/reservations';
import { Box, Typography, Divider, Tooltip } from '@mui/material';
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
  const lodgingDetails =
    (data?.details as LodgingDetails | undefined) ?? (data as unknown as LodgingDetails);

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
          <Tooltip title={lodging.lodgingName} arrow disableInteractive>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'default',
              }}
            >
              {lodging.lodgingName}
            </Typography>
          </Tooltip>

          <Tooltip title={lodging.lodgingAddress} arrow disableInteractive>
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
              {lodging.lodgingAddress}
            </Typography>
          </Tooltip>

          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Phone size={14} />
              <Tooltip title={lodging.contactTel} arrow disableInteractive>
                <Typography
                  variant="caption"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {lodging.contactTel || '-'}
                </Typography>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Mail size={14} />
              <Tooltip title={lodging.contactEmail} arrow disableInteractive>
                <Typography
                  variant="caption"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {lodging.contactEmail || '-'}
                </Typography>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" fontWeight={600}>
              CONFIRMATION #
            </Typography>

            <Typography variant="caption" color="text.secondary" noWrap>
              {lodging.bookingRef || '-'}
            </Typography>
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Right (เหมือนร้านอาหาร) */}
        <Box sx={{ width: 150, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Info icon={<UserRound size={14} />} label="Under name" value={lodging.underName} />
          <Info
            icon={<Clock size={14} />}
            label="Check-in"
            value={formatDateTime(lodging.checkinDate)}
          />

          <Info
            icon={<Clock size={14} />}
            label="Check-out"
            value={formatDateTime(lodging.checkoutDate)}
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

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.75, minWidth: 0 }}>
      {icon}

      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Typography variant="caption" fontWeight={600}>
          {label}
        </Typography>

        <Typography variant="caption" color="text.secondary" noWrap>
          {value || '-'}
        </Typography>
      </Box>
    </Box>
  );
}

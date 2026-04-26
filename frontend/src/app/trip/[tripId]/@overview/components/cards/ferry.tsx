'use client';

import { FerryDetails, ReservationDto } from '@/api/reservations';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Ship } from 'lucide-react';
import { formatCurrencyTHB } from '@/lib/string';

const formatTime = (date: string) =>
  date ? new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-';

const formatDate = (date: string) =>
  date
    ? new Date(date).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      })
    : '-';

export default function FerryCard({ data }: { data: ReservationDto | null }) {
  const { t } = useTranslation('trip_overview');
  const ferryDetails =
    (data?.details as FerryDetails | undefined) ?? (data as unknown as FerryDetails);

  const ferry = {
    transportCompany: ferryDetails?.transportCompany || '',
    ticketType: ferryDetails?.ticketType || '',
    bookingRef: data?.bookingRef || '',
    departurePort: ferryDetails?.departurePort || '',
    passengerName: ferryDetails?.passengerName || '',
    contactTel: data?.contactTel || '',
    arrivalPort: ferryDetails?.arrivalPort || '',
    contactEmail: data?.contactEmail || '',
    departureTime: ferryDetails?.departureTime || '',
    arrivalTime: ferryDetails?.arrivalTime || '',
    cost: Number(data?.cost),
  };

  const ColItem = ({ label, value }: { label: string; value?: string }) => (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          fontSize: '9px',
          color: 'text.secondary',
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        noWrap
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: '11px',
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        noWrap
      >
        {value || '-'}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        width: '100%',
        border: '1px solid #E5E5E5',
        borderRadius: 2,
        p: 1,
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.6,
      }}
    >
      {data?.typeMismatch && (
        <Box
          sx={{ bgcolor: '#fff3cd', border: '1px solid #ffeeba', px: 1, py: 0.5, borderRadius: 1 }}
        >
          <Typography variant="caption" sx={{ color: '#856404', fontWeight: 600 }}>
            {t('Reservation.typeMismatchWarning')}
          </Typography>
        </Box>
      )}
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Ship size={18} color="#a855f7" />
          <Typography
            variant="subtitle2"
            sx={{ fontSize: '13px', fontWeight: 700, color: '#a855f7' }}
          >
            {t('ManualReservation.Type.Ferry')}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: '#a855f7',
            background: '#f3e8ff',
            px: 0.8,
            py: 0.2,
            borderRadius: 1,
            fontSize: '10px',
          }}
        >
          {formatCurrencyTHB(ferry.cost)}
        </Typography>
      </Box>

      {/* Columns (เหมือน Flight / Bus) */}
      <Box sx={{ display: 'flex', gap: 1, minWidth: 0 }}>
        <Col>
          <ColItem
            label={t('reservation.fields.transportCompany.label')}
            value={ferry.transportCompany}
          />
          <ColItem label={t('reservation.fields.ticketType.label')} value={ferry.ticketType} />
          <ColItem label={t('reservation.fields.bookingRef.label')} value={ferry.bookingRef} />
        </Col>

        <Col>
          <ColItem
            label={t('reservation.fields.departurePort.label')}
            value={ferry.departurePort}
          />
          <ColItem
            label={t('reservation.fields.passengerName.label')}
            value={ferry.passengerName}
          />
          <ColItem label={t('reservation.fields.contactTel.label')} value={ferry.contactTel} />
        </Col>

        <Col>
          <ColItem label={t('reservation.fields.arrivalPort.label')} value={ferry.arrivalPort} />
          <ColItem label={t('reservation.fields.contactEmail.label')} value={ferry.contactEmail} />
        </Col>

        <Col>
          <ColItem
            label={t('reservation.fields.departureTime.label')}
            value={formatTime(ferry.departureTime)}
          />
          <ColItem
            label={t('reservation.fields.arrivalTime.label')}
            value={formatTime(ferry.arrivalTime)}
          />
          <ColItem label={t('reservation.card.date')} value={formatDate(ferry.departureTime)} />
        </Col>
      </Box>
    </Box>
  );
}

/* helper column (เหมือน Flight / Bus) */
function Col({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
      {children}
    </Box>
  );
}

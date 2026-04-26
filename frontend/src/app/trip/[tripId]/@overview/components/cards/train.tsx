'use client';

import { ReservationDto, TrainDetails } from '@/api/reservations';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Train } from 'lucide-react';
import { formatCurrencyTHB } from '@/lib/string';

const formatTime = (date: string) =>
  date
    ? new Date(date).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const formatDate = (date: string) =>
  date
    ? new Date(date).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      })
    : '-';

/* Item */
const Item = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      sx={{
        fontSize: 9,
        color: 'text.secondary',
        height: 14,
        lineHeight: '14px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 600,
        lineHeight: '16px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </Typography>
  </Box>
);

/* Row */
const Row = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      columnGap: 4,
      alignItems: 'start',
    }}
  >
    {children}
  </Box>
);

export default function TrainCard({ data }: { data: ReservationDto | null }) {
  const { t } = useTranslation('trip_overview');
  const trainDetails =
    (data?.details as TrainDetails | undefined) ?? (data as unknown as TrainDetails);

  const train = {
    trainNo: trainDetails?.trainNo || '-',
    trainClass: trainDetails?.trainClass || '-',
    seatClass: trainDetails?.seatClass || '-',
    seatNo: trainDetails?.seatNo || '-',
    passengerName: trainDetails?.passengerName || '-',
    departureStation: trainDetails?.departureStation || '-',
    departureTime: trainDetails?.departureTime || '',
    arrivalStation: trainDetails?.arrivalStation || '-',
    arrivalTime: trainDetails?.arrivalTime || '',
    bookingRef: data?.bookingRef || '-',
    contactTel: data?.contactTel || '-',
    cost: Number(data?.cost),
  };

  return (
    <Box
      sx={{
        width: '100%',
        border: '1px solid #E5E5E5',
        borderRadius: 2,
        p: 1,
        bgcolor: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.8,
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Train size={16} color="#ef4444" />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>
            {t('ManualReservation.Type.Train')}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: '#ef4444',
            background: '#fee2e2',
            px: 0.8,
            py: 0.2,
            borderRadius: 1,
            fontSize: '10px',
          }}
        >
          {formatCurrencyTHB(train.cost)}
        </Typography>
      </Box>

      {/* Rows */}
      <Row>
        <Item label={t('reservation.fields.trainNo.label')} value={train.trainNo} />
        <Item label={t('reservation.fields.trainClass.label')} value={train.trainClass} />
        <Item label={t('reservation.fields.seatNo.label')} value={train.seatNo} />
        <Item label={t('reservation.fields.passengerName.label')} value={train.passengerName} />
      </Row>

      <Row>
        <Item
          label={t('reservation.fields.departureStation.label')}
          value={train.departureStation}
        />
        <Item label={t('reservation.fields.seatClass.label')} value={train.seatClass} />
        <Item
          label={t('reservation.fields.departureTime.label')}
          value={formatTime(train.departureTime)}
        />
        <Item label={t('reservation.card.date')} value={formatDate(train.departureTime)} />
      </Row>

      <Row>
        <Item label={t('reservation.fields.arrivalStation.label')} value={train.arrivalStation} />
        <Item
          label={t('reservation.fields.arrivalTime.label')}
          value={formatTime(train.arrivalTime)}
        />
        <Item label={t('reservation.fields.bookingRef.label')} value={train.bookingRef} />
        <Item label={t('reservation.fields.contactTel.label')} value={train.contactTel} />
      </Row>
    </Box>
  );
}

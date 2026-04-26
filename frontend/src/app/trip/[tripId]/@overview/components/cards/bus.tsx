'use client';

import { BusDetails, ReservationDto } from '@/api/reservations';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Bus } from 'lucide-react';
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

/* Train */
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

function Col({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.4,
      }}
    >
      {children}
    </Box>
  );
}

export default function BusCard({ data }: { data: ReservationDto | null }) {
  const { t } = useTranslation('trip_overview');

  const busDetails = (data?.details as BusDetails | undefined) ?? (data as unknown as BusDetails);

  const bus = {
    transportCompany: busDetails?.transportCompany || '',
    departureStation: busDetails?.departureStation || '',
    departureTime: busDetails?.departureTime || '',
    arrivalStation: busDetails?.arrivalStation || '',
    busClass: busDetails?.busClass || '',
    passengerName: busDetails?.passengerName || '',
    seatNo: busDetails?.seatNo || '',
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
          <Bus size={18} color="#f97316" />
          <Typography
            variant="subtitle2"
            sx={{ fontSize: '13px', fontWeight: 700, color: '#f97316' }}
          >
            {t('ManualReservation.Type.Bus')}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: '#f97316',
            background: '#ffedd5',
            px: 0.8,
            py: 0.2,
            borderRadius: 1,
            fontSize: '10px',
          }}
        >
          {formatCurrencyTHB(bus.cost)}
        </Typography>
      </Box>

      {/* Columns layout */}
      <Box sx={{ display: 'flex', gap: 1, minWidth: 0 }}>
        <Col>
          <ColItem
            label={t('reservation.fields.transportCompany.label')}
            value={bus.transportCompany}
          />
          <ColItem label={t('reservation.fields.busClass.label')} value={bus.busClass} />
          <ColItem label={t('reservation.fields.bookingRef.label')} value={bus.bookingRef} />
        </Col>

        <Col>
          <ColItem
            label={t('reservation.fields.departureStation.label')}
            value={bus.departureStation}
          />
          <ColItem
            label={t('reservation.fields.departureTime.label')}
            value={formatTime(bus.departureTime)}
          />
          <ColItem label={t('reservation.card.date')} value={formatDate(bus.departureTime)} />
        </Col>

        <Col>
          <ColItem
            label={t('reservation.fields.arrivalStation.label')}
            value={bus.arrivalStation}
          />
          <ColItem label={t('reservation.fields.seatNo.label')} value={bus.seatNo} />
          <ColItem label={t('reservation.fields.passengerName.label')} value={bus.passengerName} />
        </Col>

        <Col>
          <ColItem label={t('reservation.fields.contactTel.label')} value={bus.contactTel} />
          <ColItem label={t('reservation.fields.contactEmail.label')} value={bus.contactEmail} />
        </Col>
      </Box>
    </Box>
  );
}

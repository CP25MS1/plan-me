'use client';

import { FlightDetails, ReservationDto } from '@/api/reservations';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Plane } from 'lucide-react';
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

export default function FlightCard({
  data,
  passengerIndex,
}: {
  data: ReservationDto | null;
  passengerIndex: number;
}) {
  const { t } = useTranslation('trip_overview');
  const flightDetails =
    (data?.details as FlightDetails | undefined) ?? (data as unknown as FlightDetails);

  const flight = {
    airline: flightDetails?.airline || '',
    flightNo: flightDetails?.flightNo || '',
    boardingTime: flightDetails?.boardingTime || '',
    gateNo: flightDetails?.gateNo || '',
    departureAirport: flightDetails?.departureAirport || '',
    departureTime: flightDetails?.departureTime || '',
    arrivalAirport: flightDetails?.arrivalAirport || '',
    arrivalTime: flightDetails?.arrivalTime || '',
    flightClass: flightDetails?.flightClass || '',
    bookingRef: data?.bookingRef || '',
    contactTel: data?.contactTel || '',
    contactEmail: data?.contactEmail || '',
    cost: Number(data?.cost),
    passengers: flightDetails?.passengers || [],
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
        gap: 0.5,
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
          <Plane size={16} color="#22c55e" />
          <Typography
            variant="subtitle2"
            sx={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}
          >
            {t('ManualReservation.Type.Flight')}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: '#22c55e',
            background: '#dcfce7',
            px: 0.8,
            py: 0.2,
            borderRadius: 1,
            fontSize: '10px',
          }}
        >
          {formatCurrencyTHB(flight.cost)}
        </Typography>
      </Box>

      {/* 4 Columns */}
      <Box sx={{ display: 'flex', gap: 1, minWidth: 0 }}>
        <Col>
          <ColItem label={t('reservation.fields.airline.label')} value={flight.airline} />
          <ColItem label={t('reservation.fields.flightClass.label')} value={flight.flightClass} />
          <ColItem label={t('reservation.fields.gateNo.label')} value={flight.gateNo} />
        </Col>

        <Col>
          <ColItem label={t('reservation.fields.flightNo.label')} value={flight.flightNo} />
          <ColItem
            label={t('reservation.fields.seatNo.label')}
            value={flight.passengers[passengerIndex]?.seatNo || '-'}
          />
          <ColItem label={t('reservation.fields.bookingRef.label')} value={flight.bookingRef} />
        </Col>

        <Col>
          <ColItem
            label={t('reservation.fields.departureAirport.label')}
            value={flight.departureAirport}
          />
          <ColItem
            label={t('reservation.fields.arrivalAirport.label')}
            value={flight.arrivalAirport}
          />
          <ColItem
            label={t('reservation.fields.passengerName.label')}
            value={flight.passengers[passengerIndex]?.passengerName || '-'}
          />
        </Col>

        <Col>
          <ColItem
            label={t('reservation.fields.boardingTime.label')}
            value={formatTime(flight.boardingTime || flight.departureTime)}
          />
          <ColItem
            label={t('reservation.fields.arrivalTime.label')}
            value={formatTime(flight.arrivalTime)}
          />
          <ColItem label={t('reservation.card.date')} value={formatDate(flight.departureTime)} />
        </Col>
      </Box>
    </Box>
  );
}

/* column helper */
function Col({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
      {children}
    </Box>
  );
}

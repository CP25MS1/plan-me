'use client';

import { FlightDetails, ReservationDto } from '@/api/reservations';
import { Box, Typography } from '@mui/material';
import { Plane } from 'lucide-react';

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

export default function FlightCard({ data }: { data: ReservationDto }) {
  const flightDetails = (data as unknown as FlightDetails) || null;
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
    bookingRef: data.bookingRef || '',
    contactTel: data.contactTel || '',
    contactEmail: data.contactEmail || '',
    cost: Number(data?.cost),
    passengers: flightDetails.passengers || [],
  };

  const ColItem = ({ label, value }: { label: string; value: string }) => (
    <Box>
      <Typography variant="caption" sx={{ fontSize: '9px', color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        border: '1px solid #E5E5E5',
        borderRadius: 2,
        p: 1,
        bgcolor: '#fff',
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Plane size={16} color="#25CF7A" />
          <Typography variant="subtitle2" sx={{ fontSize: '13px', fontWeight: 700 }}>
            เที่ยวบิน
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            background: '#F5F5F5',
            px: 0.8,
            py: 0.2,
            borderRadius: 1,
            fontSize: '10px',
          }}
        >
          THB {flight.cost?.toFixed(2) ?? '-'}
        </Typography>
      </Box>

      {/* Flight Info */}
      {/* 4 Columns Layout */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="สายการบิน" value={flight.airline} />
          <ColItem label="คลาส" value={flight.flightClass} />
          <ColItem label="Gate" value={flight.gateNo} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="เที่ยวบิน" value={flight.flightNo} />
          <ColItem
            label="ที่นั่ง"
            value={flight.passengers[0]?.seatNo || '-' || flight.passengers[0]?.seatNo}
          />
          <ColItem label="CONFIRMATION #" value={flight.bookingRef} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="ต้นทาง" value={flight.departureAirport} />
          <ColItem label="ปลายทาง" value={flight.arrivalAirport} />
          <ColItem
            label="ผู้จอง"
            value={
              flight.passengers[0]?.passengerName || '-' || flight.passengers[0]?.passengerName
            }
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem
            label="ขึ้นเครื่อง"
            value={formatTime(flight.boardingTime || flight.departureTime)}
          />
          <ColItem label="ถึง" value={formatTime(flight.arrivalTime)} />
          <ColItem label="วันที่" value={formatDate(flight.departureTime)} />
        </Box>
      </Box>
    </Box>
  );
}

'use client';

import { BusDetails, ReservationDto } from '@/api/reservations';
import { Box, Typography } from '@mui/material';
import { Bus } from 'lucide-react';

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

export default function BusCard({ data }: { data: ReservationDto | null }) {
  const busDetails = (data?.details as BusDetails | undefined) ?? (data as unknown as BusDetails);

  const bus = {
    transportCompany: busDetails?.transportCompany || '',
    busClass: busDetails?.busClass || '',
    bookingRef: data?.bookingRef || '',
    departureStation: busDetails?.departureStation || '',
    seatNo: busDetails?.seatNo || '',
    contactTel: data?.contactTel || '',
    arrivalStation: busDetails?.arrivalStation || '',
    passengerName: busDetails?.passengerName || '',
    contactEmail: data?.contactEmail || '',
    departureTime: busDetails?.departureTime || '',
    cost: Number(data?.cost),
  };

  const ColItem = ({ label, value }: { label: string; value?: string }) => (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ fontSize: '9px', color: 'text.secondary' }} noWrap>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }} noWrap>
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Bus size={18} color="#25CF7A" />
          <Typography variant="subtitle2" sx={{ fontSize: '13px', fontWeight: 700 }}>
            รถทัวร์
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
          THB {bus.cost?.toFixed(2) ?? '-'}
        </Typography>
      </Box>

      {/* Columns layout (เหมือน Flight) */}
      <Box sx={{ display: 'flex', gap: 1, minWidth: 0 }}>
        <Col>
          <ColItem label="บริษัท" value={bus.transportCompany} />
          <ColItem label="ประเภทรถ" value={bus.busClass} />
          <ColItem label="CONF #" value={bus.bookingRef} />
        </Col>

        <Col>
          <ColItem label="ต้นทาง" value={bus.departureStation} />
          <ColItem label="ที่นั่ง" value={bus.seatNo} />
          <ColItem label="โทรศัพท์" value={bus.contactTel} />
        </Col>

        <Col>
          <ColItem label="ปลายทาง" value={bus.arrivalStation} />
          <ColItem label="ผู้โดยสาร" value={bus.passengerName} />
          <ColItem label="Email" value={bus.contactEmail} />
        </Col>

        <Col>
          <ColItem label="เวลาออก" value={formatTime(bus.departureTime)} />
          <ColItem label="วันที่" value={formatDate(bus.departureTime)} />
        </Col>
      </Box>
    </Box>
  );
}

/* column helper (เหมือน FlightCard) */
function Col({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
      {children}
    </Box>
  );
}

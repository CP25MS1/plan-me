'use client';

import { FerryDetails, ReservationDto } from '@/api/reservations';
import { Box, Typography } from '@mui/material';
import { Ship } from 'lucide-react';

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
  const ferryDetails = (data as unknown as FerryDetails) || null;

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
          <Ship size={18} color="#25CF7A" />
          <Typography variant="subtitle2" sx={{ fontSize: '13px', fontWeight: 700 }}>
            เรือข้ามฟาก
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
          THB {ferry.cost?.toFixed(2) ?? '-'}
        </Typography>
      </Box>

      {/* Columns (เหมือน Flight / Bus) */}
      <Box sx={{ display: 'flex', gap: 1, minWidth: 0 }}>
        <Col>
          <ColItem label="บริษัท" value={ferry.transportCompany} />
          <ColItem label="ประเภทตั๋ว" value={ferry.ticketType} />
          <ColItem label="CONF #" value={ferry.bookingRef} />
        </Col>

        <Col>
          <ColItem label="ท่าเรือต้นทาง" value={ferry.departurePort} />
          <ColItem label="ผู้โดยสาร" value={ferry.passengerName} />
          <ColItem label="โทรศัพท์" value={ferry.contactTel} />
        </Col>

        <Col>
          <ColItem label="ท่าเรือปลายทาง" value={ferry.arrivalPort} />
          <ColItem label="Email" value={ferry.contactEmail} />
        </Col>

        <Col>
          <ColItem label="เวลาออกเรือ" value={formatTime(ferry.departureTime)} />
          <ColItem label="เวลาถึง" value={formatTime(ferry.arrivalTime)} />
          <ColItem label="วันที่" value={formatDate(ferry.departureTime)} />
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

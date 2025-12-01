'use client';

import { ReservationDto, TrainDetails } from '@/api/reservations';
import { Box, Typography } from '@mui/material';
import { Train } from 'lucide-react';

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

export default function TrainCard({ data }: { data: ReservationDto | null }) {
  const trainDetails = (data as unknown as TrainDetails) || null;
  const train = {
    trainNo: trainDetails?.trainNo || '',
    trainClass: trainDetails?.trainClass || '',
    seatClass: trainDetails?.seatClass || '',
    seatNo: trainDetails?.seatNo || '',
    passengerName: trainDetails?.passengerName || '',
    departureStation: trainDetails?.departureStation || '',
    departureTime: trainDetails?.departureTime || '',
    arrivalStation: trainDetails?.arrivalStation || '',
    arrivalTime: trainDetails?.arrivalTime || '',
    bookingRef: data?.bookingRef || '',
    contactTel: data?.contactTel || '',
    contactEmail: data?.contactEmail || '',
    cost: Number(data?.cost),
  };

  const ColItem = ({ label, value }: { label: string; value: string }) => (
    <Box>
      <Typography
        variant="caption"
        sx={{
          fontSize: '9px',
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: '11px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
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
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.8,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Train size={16} color="#25CF7A" />
          <Typography variant="subtitle2" sx={{ fontSize: '13px', fontWeight: 700 }}>
            รถไฟ
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
          THB {train.cost?.toFixed(2) ?? '-'}
        </Typography>
      </Box>

      {/* 4 Columns */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.8,
        }}
      >
        {/* Column 1 */}
        <ColItem label="หมายเลขขบวน" value={train.trainNo} />
        <ColItem label="ต้นทาง" value={train.departureStation} />
        <ColItem label="CONF #" value={train.bookingRef} />

        {/* Column 2 */}
        <ColItem label="ชั้นโดยสาร" value={train.trainClass} />
        <ColItem label="ประเภทที่นั่ง" value={train.seatClass} />
        <ColItem label="เวลาออก" value={formatTime(train.departureTime)} />

        {/* Column 3 */}
        <ColItem label="ที่นั่ง" value={train.seatNo} />
        <ColItem label="ปลายทาง" value={train.arrivalStation} />
        <ColItem label="ถึง" value={formatTime(train.arrivalTime)} />

        {/* Column 4 */}
        <ColItem label="ผู้โดยสาร" value={train.passengerName} />
        <ColItem label="วันที่" value={formatDate(train.departureTime)} />
        <ColItem label="โทรศัพท์" value={train.contactTel} />
      </Box>
    </Box>
  );
}

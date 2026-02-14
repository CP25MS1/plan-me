'use client';

import { ReservationDto, TrainDetails } from '@/api/reservations';
import { Box, Typography } from '@mui/material';
import { Train } from 'lucide-react';

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
    <Typography variant="caption" sx={{ fontSize: '9px', color: 'text.secondary' }} noWrap>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px' }} noWrap>
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

export default function TrainCard({ data }: { data: ReservationDto | null }) {
  const trainDetails =
    (data?.details as TrainDetails | undefined) ?? (data as unknown as TrainDetails);

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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Train size={18} color="#25CF7A" />
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

      {/* Columns layout */}
      <Box sx={{ display: 'flex', gap: 1, minWidth: 0 }}>
        <Col>
          <ColItem label="หมายเลขขบวน" value={train.trainNo} />
          <ColItem label="ชั้นโดยสาร" value={train.trainClass} />
          <ColItem label="หมายเลขการจอง" value={train.bookingRef} />
        </Col>

        <Col>
          <ColItem label="ต้นทาง" value={train.departureStation} />
          <ColItem label="ที่นั่ง" value={train.seatNo} />
          <ColItem label="โทรศัพท์" value={train.contactTel} />
        </Col>

        <Col>
          <ColItem label="ปลายทาง" value={train.arrivalStation} />
          <ColItem label="ประเภทที่นั่ง" value={train.seatClass} />
          <ColItem label="ผู้โดยสาร" value={train.passengerName} />
        </Col>

        <Col>
          <ColItem label="เวลาออก" value={formatTime(train.departureTime)} />
          <ColItem label="ถึง" value={formatTime(train.arrivalTime)} />
          <ColItem label="วันที่" value={formatDate(train.departureTime)} />
        </Col>
      </Box>
    </Box>
  );
}

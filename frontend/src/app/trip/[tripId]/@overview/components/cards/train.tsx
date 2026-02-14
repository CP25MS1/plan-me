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

/* Item */
const Item = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      sx={{
        fontSize: 9,
        color: 'text.secondary',
        height: 14,
        lineHeight: '14px',
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Train size={16} color="#25CF7A" />
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>รถไฟ</Typography>
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

      {/* Rows */}
      <Row>
        <Item label="หมายเลขขบวน" value={train.trainNo} />
        <Item label="ชั้นโดยสาร" value={train.trainClass} />
        <Item label="ที่นั่ง" value={train.seatNo} />
        <Item label="ผู้โดยสาร" value={train.passengerName} />
      </Row>

      <Row>
        <Item label="ต้นทาง" value={train.departureStation} />
        <Item label="ประเภทที่นั่ง" value={train.seatClass} />
        <Item label="เวลาออก" value={formatTime(train.departureTime)} />
        <Item label="วันที่" value={formatDate(train.departureTime)} />
      </Row>

      <Row>
        <Item label="ปลายทาง" value={train.arrivalStation} />
        <Item label="ถึง" value={formatTime(train.arrivalTime)} />
        <Item label="หมายเลขการจอง" value={train.bookingRef} />
        <Item label="โทรศัพท์" value={train.contactTel} />
      </Row>
    </Box>
  );
}

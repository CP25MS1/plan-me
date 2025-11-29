'use client';

import { Box, Typography } from '@mui/material';
import { Train } from 'lucide-react'; // สมมติใช้ไอคอน Train จาก lucide-react

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });

export default function TrainCard() {
  const mockData = {
    trainNumber: 'TD 405',
    originStation: 'Bangkok',
    confirmation: 'TR123456789',
    carriageType: 'Sleeper',
    departureTime: '2025-07-21T08:30:00',
    passengerName: 'Numleab Seatung',
    carriageNumber: 'C5',
    destinationStation: 'Chiang Mai',
    date: '2025-07-21',
    seatNumber: '12B',
    arrivalTime: '2025-07-21T15:45:00',
    phone: '0812345678',
    price: 1200,
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
          THB {mockData.price.toFixed(2)}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="หมายเลขขบวน" value={mockData.trainNumber} />
          <ColItem label="ต้นทาง" value={mockData.originStation} />
          <ColItem label="CONF #" value={mockData.confirmation} />
        </Box>

        {/* Column 2 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="ประเภทตู้" value={mockData.carriageType} />
          <ColItem label="เวลาออก" value={formatTime(mockData.departureTime)} />
          <ColItem label="ผู้จอง" value={mockData.passengerName} />
        </Box>

        {/* Column 3 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="หมายเลขตู้" value={mockData.carriageNumber} />
          <ColItem label="ปลายทาง" value={mockData.destinationStation} />
          <ColItem label="วันที่" value={formatDate(mockData.date)} />
        </Box>

        {/* Column 4 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="ที่นั่ง" value={mockData.seatNumber} />
          <ColItem label="ถึง" value={formatTime(mockData.arrivalTime)} />
          <ColItem label="โทรศัพท์" value={mockData.phone} />
        </Box>
      </Box>
    </Box>
  );
}

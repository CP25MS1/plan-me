'use client';

import { Box, Typography, Tooltip } from '@mui/material';
import { Ship, Phone, Mail } from 'lucide-react';

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });

export default function FerryCard() {
  const mockData = {
    companyName: 'SeaExpress',
    ticketType: 'VIP',
    confirmation: 'FER123456',
    originPort: 'Bangkok Pier',
    passengerName: 'Numleab',
    phone: '0812345678',
    destinationPort: 'Pattaya Pier',
    date: '2025-07-22',
    email: 'Seat@exa.com',
    departureTime: '2025-07-22T08:00:00',
    arrivalTime: '2025-07-22T10:30:00',
    price: 600,
  };

  const ColItem = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon?: React.ReactNode;
  }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: icon ? 0.3 : 0 }}>
        {icon}
        <Tooltip title={value} arrow>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '11px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {value}
          </Typography>
        </Tooltip>
      </Box>
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
          <ColItem label="บริษัท" value={mockData.companyName} />
          <ColItem label="ประเภทตั๋ว" value={mockData.ticketType} />
          <ColItem label="CONF #" value={mockData.confirmation} />
        </Box>

        {/* Column 2 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="ท่าเรือต้นทาง" value={mockData.originPort} />
          <ColItem label="ผู้จอง" value={mockData.passengerName} />
          <ColItem label="โทรศัพท์" value={mockData.phone} />
        </Box>

        {/* Column 3 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="ท่าเรือปลายทาง" value={mockData.destinationPort} />
          <ColItem label="วันที่" value={formatDate(mockData.date)} />
          <ColItem label="Email" value={mockData.email} />
        </Box>

        {/* Column 4 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <ColItem label="เวลาเรือออก" value={formatTime(mockData.departureTime)} />
          <ColItem label="เวลาถึง" value={formatTime(mockData.arrivalTime)} />
        </Box>
      </Box>
    </Box>
  );
}

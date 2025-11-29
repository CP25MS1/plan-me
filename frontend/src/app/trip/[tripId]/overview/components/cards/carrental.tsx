'use client';

import { Box, Typography, Tooltip } from '@mui/material';
import { Car, Phone, Mail } from 'lucide-react';

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });

export default function CarRentalCard() {
  const mockData = {
    companyName: 'FastCar Rental',
    carType: 'SUV',
    plateNumber: 'กข 1234',
    pickUpLocation: 'BangkokCity Center',
    pickUpTime: '2025-07-22T09:00:00',
    passengerName: 'Numleab',
    confirmation: 'CAR987654',
    dropOffLocation: 'DonmuangAirport',
    dropOffTime: '2025-07-25T18:00:00',
    phone: '0812345678',
    email: 'Sea12@exaexa.com',
    price: 1500,
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
          <Car size={18} color="#25CF7A" />
          <Typography variant="subtitle2" sx={{ fontSize: '13px', fontWeight: 700 }}>
            รถเช่า
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

      {/* 3 Rows, 3 Columns per row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0.8,
        }}
      >
        {/* Row 1 */}
        <ColItem label="บริษัท" value={mockData.companyName} />
        <ColItem label="ประเภทรถ" value={mockData.carType} />
        <ColItem label="หมายเลขทะเบียน" value={mockData.plateNumber} />

        {/* Row 2 */}
        <ColItem label="สถานที่รับรถ" value={mockData.pickUpLocation} />
        <ColItem label="เวลารับรถ" value={formatTime(mockData.pickUpTime)} />
        <ColItem label="ผู้จอง" value={mockData.passengerName} />

        {/* Row 3 */}
        <ColItem label="CONF #" value={mockData.confirmation} />
        <ColItem label="สถานที่คืนรถ" value={mockData.dropOffLocation} />
        <ColItem label="เวลาคืนรถ" value={formatTime(mockData.dropOffTime)} />

        {/* Row 4 */}
        <ColItem label="โทรศัพท์" value={mockData.phone} />
        <ColItem label="Email" value={mockData.email} />
        {/* ช่องว่างสำหรับเรียงเต็ม 3 คอลัมน์ */}
        <Box />
      </Box>
    </Box>
  );
}

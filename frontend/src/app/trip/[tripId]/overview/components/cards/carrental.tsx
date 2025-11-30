'use client';

import { Box, Typography, Tooltip } from '@mui/material';
import { Car, Phone, Mail } from 'lucide-react';

const formatTime = (date: string) =>
  date ? new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-';

export default function CarRentalCard({ data }: { data: any }) {
  const carRental = {
    rentalCompany: data.rentalCompany || '-',
    carModel: data.carModel || '-',
    vrn: data.vrn || '-',
    renterName: data.renterName || '-',
    pickupLocation: data.pickupLocation || '-',
    pickupTime: data.pickupTime || '',
    dropoffLocation: data.dropoffLocation || '-',
    dropoffTime: data.dropoffTime || '',
    bookingRef: data.bookingRef || '-',
    contactTel: data.contactTel || '-',
    contactEmail: data.contactEmail || '-',

    cost: data.cost ? Number(data.cost) : 0,
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
          THB {carRental.cost.toFixed(2)}
        </Typography>
      </Box>

      {/* Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0.8,
        }}
      >
        {/* Row 1 */}
        <ColItem label="บริษัท" value={carRental.rentalCompany} />
        <ColItem label="รุ่นรถ" value={carRental.carModel} />
        <ColItem label="ทะเบียน" value={carRental.vrn} />

        {/* Row 2 */}
        <ColItem label="รับรถที่" value={carRental.pickupLocation} />
        <ColItem label="เวลารับรถ" value={formatTime(carRental.pickupTime)} />
        <ColItem label="ผู้เช่า" value={carRental.renterName} />

        {/* Row 3 */}
        <ColItem label="CONF #" value={carRental.bookingRef} />
        <ColItem label="คืนรถที่" value={carRental.dropoffLocation} />
        <ColItem label="เวลาคืนรถ" value={formatTime(carRental.dropoffTime)} />

        {/* Row 4 */}
        <ColItem label="โทรศัพท์" value={carRental.contactTel} icon={<Phone size={12} />} />
        <ColItem label="Email" value={carRental.contactEmail} icon={<Mail size={12} />} />
        <Box />
      </Box>
    </Box>
  );
}

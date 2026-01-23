'use client';

import { CarRentalDetails, ReservationDto } from '@/api/reservations';
import { Box, Typography } from '@mui/material';
import { Car } from 'lucide-react';

const formatTime = (date: string) =>
  date
    ? new Date(date).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

export default function CarRentalCard({ data }: { data: ReservationDto | null }) {
  const carRentalDetails =
    (data?.details as CarRentalDetails | undefined) ?? (data as unknown as CarRentalDetails);

  const car = {
    rentalCompany: carRentalDetails?.rentalCompany || '-',
    carModel: carRentalDetails?.carModel || '-',
    vrn: carRentalDetails?.vrn || '-',
    renterName: carRentalDetails?.renterName || '-',
    pickupLocation: carRentalDetails?.pickupLocation || '-',
    pickupTime: carRentalDetails?.pickupTime || '',
    dropoffLocation: carRentalDetails?.dropoffLocation || '-',
    dropoffTime: carRentalDetails?.dropoffTime || '',
    bookingRef: data?.bookingRef || '-',
    contactTel: data?.contactTel || '-',
    contactEmail: data?.contactEmail || '-',
    cost: Number(data?.cost),
  };

  const ColItem = ({ label, value }: { label: string; value?: string }) => (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: '9px',
          color: 'text.secondary',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '11px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value || '-'}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        width: '100%', // ✅ เต็ม parent
        border: '1px solid #E5E5E5',
        borderRadius: 2,
        p: 1,
        bgcolor: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.6,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Car size={18} color="#25CF7A" />
          <Typography sx={{ fontSize: '13px', fontWeight: 700 }}>รถเช่า</Typography>
        </Box>

        <Typography
          sx={{
            fontSize: '10px',
            fontWeight: 700,
            background: '#F5F5F5',
            px: 0.8,
            py: 0.2,
            borderRadius: 1,
          }}
        >
          THB {car.cost?.toFixed(2) ?? '-'}
        </Typography>
      </Box>

      {/* Columns (เหมือน Bus / Flight) */}
      <Box sx={{ display: 'flex', gap: 1, minWidth: 0 }}>
        <Col>
          <ColItem label="บริษัท" value={car.rentalCompany} />
          <ColItem label="รุ่นรถ" value={car.carModel} />
          <ColItem label="CONF #" value={car.bookingRef} />
        </Col>

        <Col>
          <ColItem label="รับรถที่" value={car.pickupLocation} />
          <ColItem label="เวลารับรถ" value={formatTime(car.pickupTime)} />
          <ColItem label="โทรศัพท์" value={car.contactTel} />
        </Col>

        <Col>
          <ColItem label="คืนรถที่" value={car.dropoffLocation} />
          <ColItem label="เวลาคืนรถ" value={formatTime(car.dropoffTime)} />
          <ColItem label="Email" value={car.contactEmail} />
        </Col>

        <Col>
          <ColItem label="ทะเบียน" value={car.vrn} />
          <ColItem label="ผู้เช่า" value={car.renterName} />
        </Col>
      </Box>
    </Box>
  );
}

/* column helper (เหมือน BusCard) */
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

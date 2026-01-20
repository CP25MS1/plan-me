'use client';

import { BusDetails, ReservationDto } from '@/api/reservations';
import { Box, Typography, Tooltip } from '@mui/material';
import { Bus, Phone, Mail } from 'lucide-react';

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
  const busDetails = (data as unknown as BusDetails) || null;
  const bus = {
    transportCompany: busDetails?.transportCompany || '',
    departureStation: busDetails?.departureStation || '',
    departureTime: busDetails?.departureTime || '',
    arrivalStation: busDetails?.arrivalStation || '',
    busClass: busDetails?.busClass || '',
    passengerName: busDetails?.passengerName || '',
    seatNo: busDetails?.seatNo || '',
    bookingRef: data?.bookingRef || '',
    contactTel: data?.contactTel || '',
    contactEmail: data?.contactEmail || '',
    cost: Number(data?.cost),
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

      {/* Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.8,
        }}
      >
        {/* Column 1 */}
        <ColItem label="บริษัท" value={bus.transportCompany} />
        <ColItem label="ประเภทรถ" value={bus.busClass} />
        <ColItem label="CONF #" value={bus.bookingRef} />

        {/* Column 2 */}
        <ColItem label="ต้นทาง" value={bus.departureStation} />
        <ColItem label="ที่นั่ง" value={bus.seatNo} />
        <ColItem label="โทรศัพท์" value={bus.contactTel} icon={<Phone size={12} />} />

        {/* Column 3 */}
        <ColItem label="ปลายทาง" value={bus.arrivalStation} />
        <ColItem label="ผู้โดยสาร" value={bus.passengerName} />
        <ColItem label="Email" value={bus.contactEmail} icon={<Mail size={12} />} />

        {/* Column 4 */}
        <ColItem label="เวลาออก" value={formatTime(bus.departureTime)} />
        <ColItem label="วันที่" value={formatDate(bus.departureTime)} />
        <Box />
      </Box>
    </Box>
  );
}

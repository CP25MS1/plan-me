'use client';

import { Box, Typography, Tooltip } from '@mui/material';
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

export default function FerryCard({ data }: { data: any }) {
  const ferry = {
    transportCompany: data.transportCompany || '-',
    passengerName: data.passengerName || '-',
    departurePort: data.departurePort || '-',
    departureTime: data.departureTime || '',
    arrivalPort: data.arrivalPort || '-',
    arrivalTime: data.arrivalTime || '',
    ticketType: data.ticketType || '-',
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
          THB {ferry.cost.toFixed(2)}
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
        <ColItem label="บริษัท" value={ferry.transportCompany} />
        <ColItem label="ประเภทตั๋ว" value={ferry.ticketType} />
        <ColItem label="CONF #" value={ferry.bookingRef} />

        {/* Column 2 */}
        <ColItem label="ท่าเรือต้นทาง" value={ferry.departurePort} />
        <ColItem label="ผู้โดยสาร" value={ferry.passengerName} />
        <ColItem label="โทรศัพท์" value={ferry.contactTel} />

        {/* Column 3 */}
        <ColItem label="ท่าเรือปลายทาง" value={ferry.arrivalPort} />
        <ColItem label="วันที่ออกเดินทาง" value={formatDate(ferry.departureTime)} />
        <ColItem label="Email" value={ferry.contactEmail} />

        {/* Column 4 */}
        <ColItem label="เวลาออกเรือ" value={formatTime(ferry.departureTime)} />
        <ColItem label="เวลาถึง" value={formatTime(ferry.arrivalTime)} />
        <Box />
      </Box>
    </Box>
  );
}

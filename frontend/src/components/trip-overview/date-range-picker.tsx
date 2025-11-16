'use client';

import { useState } from 'react';
import { Box, Typography, Popover, TextField } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { DatePicker, PickersDay } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

export default function DateRangePickerComponent({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  setStartDate: (v: Dayjs | null) => void;
  setEndDate: (v: Dayjs | null) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const open = (e: any) => setAnchor(e.currentTarget);
  const close = () => setAnchor(null);

  const isInRange = (d: Dayjs) =>
    startDate && endDate && d.isAfter(startDate, 'day') && d.isBefore(endDate, 'day');

  return (
    <>
      {/* Trigger */}
      <Box sx={{ mt: 2, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarMonthIcon
          onClick={open}
          sx={{
            color: 'primary',
            backgroundColor: 'success.light',
            p: 0.7,
            borderRadius: '50%',
            cursor: 'pointer',
          }}
        />

        <Typography sx={{ fontWeight: 600 }}>
          {startDate?.format('DD/MM') || '--'} - {endDate?.format('DD/MM') || '--'}
        </Typography>
      </Box>

      {/* Popover Calendar */}
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ display: 'flex', p: 2, gap: 1 }}>
          {/* Start */}
          <DatePicker
            label="เริ่มต้น"
            value={startDate}
            onChange={(v) => setStartDate(v)}
            renderDay={(day, _v, props) => {
              const selected =
                isInRange(day) || day.isSame(startDate, 'day') || day.isSame(endDate, 'day');
              const isEdge = day.isSame(startDate, 'day') || day.isSame(endDate, 'day');

              return (
                <PickersDay
                  {...props}
                  sx={{
                    ...(selected && !isEdge && { backgroundColor: '#DCFCE7' }),
                    ...(isEdge && { backgroundColor: '#22C55E', color: 'white' }),
                  }}
                />
              );
            }}
            renderInput={(params) => <TextField {...params} />}
          />

          {/* End */}
          <DatePicker
            label="สิ้นสุด"
            value={endDate}
            onChange={(v) => setEndDate(v)}
            renderDay={(day, _v, props) => {
              const selected =
                isInRange(day) || day.isSame(startDate, 'day') || day.isSame(endDate, 'day');
              const isEdge = day.isSame(startDate, 'day') || day.isSame(endDate, 'day');

              return (
                <PickersDay
                  {...props}
                  sx={{
                    ...(selected && !isEdge && { backgroundColor: '#DCFCE7' }),
                    ...(isEdge && { backgroundColor: '#22C55E', color: 'white' }),
                  }}
                />
              );
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </Box>
      </Popover>
    </>
  );
}

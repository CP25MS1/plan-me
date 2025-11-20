'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Dialog,
  FormControl,
  InputAdornment,
  Popover,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import 'dayjs/locale/en';
import { useTranslation } from 'react-i18next';

import { useI18nSelector } from '@/store/selectors';

export type DateRange = [Dayjs | null, Dayjs | null];
export type PickersDaySx = {
  backgroundColor: string | null;
  color: string | null;
  borderRadius: string | number | null;
};

const formatRange = (value: DateRange) => {
  const [s, e] = value;
  if (s && !e) return `${s.format('DD/MM')}`;
  if (s && e) return `${s.format('DD/MM')} - ${e.format('DD/MM')}`;
  return '';
};

const DateRangePicker = ({
  value,
  onChange,
  label,
  required,
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
  label?: string;
  required?: boolean;
}) => {
  const { t } = useTranslation('trip_create');
  const { locale } = useI18nSelector();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [tempRange, setTempRange] = useState<DateRange>(value);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const clearAll = () => {
    setTempRange([null, null]);
    onChange([null, null]);
  };

  const renderDay = (dayProps: PickersDayProps) => {
    const day = dayProps.day;

    const [s, e] = tempRange;
    const isStart = !!s && day.isSame(s, 'day');
    const isEnd = !!e && day.isSame(e, 'day');
    const inRange = !!s && !!e && day.isAfter(s, 'day') && day.isBefore(e, 'day');

    const sx: PickersDaySx = {
      backgroundColor: null,
      color: null,
      borderRadius: null,
    };

    if (inRange) {
      sx.backgroundColor =
        theme.palette.mode === 'light'
          ? (theme.palette.primary.light ?? theme.palette.action.selected)
          : theme.palette.primary.dark;
      sx.color = theme.palette.primary.contrastText;
      sx.borderRadius = 0;
    }

    if (isStart && isEnd) {
      sx.backgroundColor = theme.palette.primary.main;
      sx.color = theme.palette.primary.contrastText;
      sx.borderRadius = '50%';
    } else if (isStart) {
      sx.backgroundColor = theme.palette.primary.main;
      sx.color = theme.palette.primary.contrastText;
      sx.borderRadius = '50% 0 0 50%';
    } else if (isEnd) {
      sx.backgroundColor = theme.palette.primary.main;
      sx.color = theme.palette.primary.contrastText;
      sx.borderRadius = '0 50% 50% 0';
    }

    return <PickersDay {...dayProps} sx={{ ...dayProps.sx, ...sx }} />;
  };

  const handlePick = (picked: Dayjs) => {
    const [ts, te] = tempRange;

    if (!ts) {
      setTempRange([picked, null]);
      return;
    }

    if (ts && !te) {
      if (picked.isSame(ts, 'day')) {
        setTempRange([null, null]);
        return;
      }

      if (picked.isBefore(ts, 'day')) {
        setTempRange([picked, null]);
        return;
      }

      const newRange: DateRange = [ts, picked];
      setTempRange(newRange);
      onChange(newRange);
      setOpen(false);
      return;
    }

    setTempRange([picked, null]);
  };

  const isRangeEqual = (a: DateRange, b: DateRange) => {
    const sameDay = (x?: Dayjs | null, y?: Dayjs | null) => {
      if (!x && !y) return true;
      if (!x || !y) return false;
      return x.isSame(y, 'day');
    };
    return sameDay(a[0], b[0]) && sameDay(a[1], b[1]);
  };

  const handleClose = () => {
    if (!isRangeEqual(tempRange, value)) {
      onChange(tempRange);
    }
    setOpen(false);
  };

  useEffect(() => {
    if (open) setTempRange(value);
  }, [open, value]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
      <FormControl fullWidth>
        {label && (
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            {label}
            {required && (
              <Box component="span" color="error.main">
                {' '}
                *
              </Box>
            )}
          </Typography>
        )}

        <Box ref={anchorRef} onClick={() => setOpen(true)} sx={{ cursor: 'pointer' }}>
          <TextField
            value={formatRange(value)}
            placeholder={`${t('fields.date.placeholder')}`}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAll();
                      }}
                      aria-label="clear dates"
                    >
                      <X size={16} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {isMobile ? (
          <Dialog open={open} onClose={handleClose} fullWidth>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('fields.date.start')} / {t('fields.date.end')}
              </Typography>

              <DateCalendar
                value={tempRange[0] ?? tempRange[1] ?? null}
                onChange={(d) => handlePick(d as Dayjs)}
                slots={{ day: renderDay }}
                shouldDisableDate={() => false}
              />
            </Box>
          </Dialog>
        ) : (
          <Popover
            open={open}
            anchorEl={anchorRef.current}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, ml: 1 }}>
                {t('fields.date.start')} / {t('fields.date.end')}
              </Typography>
              <DateCalendar
                value={tempRange[0] ?? tempRange[1] ?? null}
                onChange={(d) => handlePick(d as Dayjs)}
                slots={{ day: renderDay }}
                shouldDisableDate={() => false}
              />
            </Box>
          </Popover>
        )}
      </FormControl>
    </LocalizationProvider>
  );
};

export default DateRangePicker;

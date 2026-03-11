'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import DateRangePicker, { DateRange } from '@/components/common/date-time/date-range-picker';
import { useCreateTripFromPublicTemplate } from '@/app/hooks';
import { useCreateTripAlbum } from '@/app/memory/hooks/use-create-trip-album';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';

type ApplyTemplateDialogProps = {
  open: boolean;
  onClose: () => void;
  templateTripId: number;
  defaultTripName?: string;
  dayCount: number;
};

const NAME_MAX_LENGTH = 50;

const ApplyTemplateDialog = ({
  open,
  onClose,
  templateTripId,
  defaultTripName,
  dayCount,
}: ApplyTemplateDialogProps) => {
  const router = useRouter();
  const { t } = useTranslation('trip_overview');

  const { mutate: createFromTemplate, isPending: isCreatingTrip } =
    useCreateTripFromPublicTemplate();
  const { mutate: createAlbum, isPending: isCreatingAlbum } = useCreateTripAlbum();

  const [tripName, setTripName] = useState(defaultTripName ?? '');
  const [dateRange, setDateRange] = useState<DateRange>([null, null]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity?: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'error',
  });

  const isPending = isCreatingTrip || isCreatingAlbum;

  useEffect(() => {
    if (!open) return;
    setTripName(defaultTripName ?? '');
    setDateRange([null, null]);
    setNameError(null);
    setDateError(null);
  }, [open, defaultTripName]);

  const validateName = (value: string) => {
    if (!value.trim()) return t('template.apply.errors.nameRequired');
    if (value.trim().length > NAME_MAX_LENGTH) return t('template.apply.errors.nameTooLong');
    return null;
  };

  const validateDate = (range: DateRange) => {
    const [start, end] = range;
    if (!start) return t('template.apply.errors.dateRequired');

    if (dayCount > 0) {
      const requestedDays = (end ?? start).diff(start, 'day') + 1;
      if (requestedDays < dayCount) {
        return t('template.apply.errors.dayCountTooShort', { dayCount });
      }
    }
    return null;
  };

  const handleTripNameChange = (value: string) => {
    setTripName(value);
    if (nameError) {
      setNameError(validateName(value));
    }
  };

  const handleDateChange = (value: DateRange) => {
    setDateRange(value);
    if (dateError) {
      setDateError(validateDate(value));
    }
  };

  const payload = useMemo(() => {
    const [start, end] = dateRange;
    return {
      name: tripName.trim(),
      startDate: start ? dayjs(start).format('YYYY-MM-DD') : undefined,
      endDate: end ? dayjs(end).format('YYYY-MM-DD') : undefined,
    };
  }, [dateRange, tripName]);

  const handleSubmit = () => {
    const nextNameError = validateName(tripName);
    const nextDateError = validateDate(dateRange);

    setNameError(nextNameError);
    setDateError(nextDateError);

    if (nextNameError || nextDateError) return;

    createFromTemplate(
      { templateTripId, payload },
      {
        onSuccess: (data) => {
          if (!data?.id) {
            setSnack({
              open: true,
              message: t('template.apply.errors.generic'),
              severity: 'error',
            });
            return;
          }

          const tripId = data.id;
          const formData = new FormData();
          formData.append('name', tripName.trim());

          createAlbum(
            { tripId, formData },
            {
              onSuccess: () => {
                onClose();
                router.push(`/trip/${tripId}?tab=overview` as Route);
              },
              onError: () => {
                setSnack({
                  open: true,
                  message: t('template.apply.errors.albumFailed'),
                  severity: 'error',
                });
              },
            }
          );
        },
        onError: () => {
          setSnack({
            open: true,
            message: t('template.apply.errors.generic'),
            severity: 'error',
          });
        },
      }
    );
  };

  return (
    <>
      <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>{t('template.apply.title')}</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('template.apply.fields.name')}
              <Box component="span" color="error.main">
                {' '}
                *
              </Box>
            </Typography>

            <TextField
              value={tripName}
              onChange={(e) => handleTripNameChange(e.target.value)}
              placeholder={t('template.apply.placeholders.name')}
              error={!!nameError}
              helperText={nameError ?? ' '}
              disabled={isPending}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <DateRangePicker
              label={t('template.apply.fields.date', { dayCount })}
              required={false}
              value={dateRange}
              onChange={handleDateChange}
              disabled={isPending}
            />
            <Typography
              variant="caption"
              color={dateError ? 'error' : 'text.secondary'}
              sx={{ margin: '3px 14px 0px', display: 'block', minHeight: 18 }}
            >
              {dateError ?? ' '}
            </Typography>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isPending}>
            {t('template.apply.actions.cancel')}
          </Button>

          <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <CircularProgress size={20} thickness={5} sx={{ color: '#fff' }} />
            ) : (
              t('template.apply.actions.submit')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </>
  );
};

export default ApplyTemplateDialog;

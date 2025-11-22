'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  FormControl,
  IconButton,
  Button,
  Chip,
} from '@mui/material';
import { X as XIcon } from 'lucide-react';
import { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { useFullPageLoading } from '@/components/full-page-loading';
import DateRangePicker from '@/components/common/date-time/date-range-picker';
import ObjectivePickerDialog, {
  MAX_OBJECTIVES,
  useDefaultObjectives,
  getKey,
} from '@/components/trip/objective-picker-dialog';
import { DefaultObjective, Objective, UpsertObjective, UpsertTrip } from '@/api/trips';
import useCreateTrip from '@/app/trip/create/hooks/use-create-trip';
import { RootState } from '@/store';
import { Locale } from '@/store/i18n-slice';

type DateRange = [Dayjs | null, Dayjs | null];

const getDefaultObjectiveName = (locale: Locale, obj: DefaultObjective) => {
  if (locale === 'th') return obj.TH;
  return obj.EN;
};

const CreateTripPage = () => {
  const locale = useSelector((s: RootState) => s.i18n.locale);
  const router = useRouter();
  const { t } = useTranslation('trip_create');
  const defaultObjectives = useDefaultObjectives();
  const { mutate, isPending } = useCreateTrip();
  const { isNavigating, setIsNavigating, FullPageLoading } = useFullPageLoading();

  const [tripName, setTripName] = useState('');
  const [tripNameError, setTripNameError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>([null, null]);
  const [openObjectiveModal, setOpenObjectiveModal] = useState(false);
  const [selectedObjectives, setSelectedObjectives] = useState<Objective[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!tripName.trim()) {
      setTripNameError(t('fields.name.null'));
      return;
    }

    if (tripName.trim().length > 50) {
      setTripNameError(t('fields.name.maxLength'));
      return;
    }

    const startDate = dateRange[0]?.format('YYYY-MM-DD');
    const endDate = dateRange[1]?.format('YYYY-MM-DD');

    const objectives: UpsertObjective[] = selectedObjectives.map((s) => {
      if ((s as DefaultObjective).boId) {
        return {
          boId: (s as DefaultObjective).boId,
        };
      }

      return {
        name: s.name,
        badgeColor: s.badgeColor,
      };
    });

    const tripInfo: UpsertTrip = {
      name: tripName.trim(),
      startDate,
      endDate,
      objectives,
    };

    setIsNavigating(true);

    mutate(tripInfo, {
      onSuccess: (data) => {
        if (data?.id) {
          setIsNavigating(false);
          router.push(`/trip/${data.id}/overview` as Route);
        }
      },
    });
  };

  useEffect(() => {
    if (tripNameError) {
      if (tripName.trim() && tripName.trim().length <= 50) {
        setTripNameError(null);
      }
    }
  }, [tripName, tripNameError]);

  if (isPending || isNavigating) {
    return <FullPageLoading />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 } }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: 'auto', sm: '65vh' },
          p: { xs: 2, sm: 4 },
          gap: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 40 }} />
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {t('title')}
            </Typography>
          </Box>
          <Box sx={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton aria-label="close" onClick={() => router.back()}>
              <XIcon />
            </IconButton>
          </Box>
        </Box>

        <Stack spacing={3} sx={{ flex: '0 1 auto' }}>
          <FormControl fullWidth>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              {t('fields.name.label')}{' '}
              <Box component="span" color="error.main">
                *
              </Box>
            </Typography>

            <TextField
              placeholder={`${t('fields.name.label')}`}
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              fullWidth
              error={!!tripNameError}
              helperText={tripNameError ?? undefined}
            />
          </FormControl>

          <FormControl fullWidth>
            <DateRangePicker
              label={`${t('fields.date.label')}`}
              required={false}
              value={dateRange}
              onChange={setDateRange}
            />
          </FormControl>

          <FormControl fullWidth>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              {t('fields.objectives.label')}
            </Typography>

            {selectedObjectives.length === 0 ? (
              <TextField
                placeholder={`${t('fields.objectives.placeholder')}`}
                onClick={() => setOpenObjectiveModal(true)}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />
            ) : (
              <Box
                tabIndex={0}
                onClick={() => setOpenObjectiveModal(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpenObjectiveModal(true);
                  }
                }}
                sx={(theme) => ({
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  minHeight: 56,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  cursor: 'pointer',
                  '&:focus': {
                    outline: 'none',
                    boxShadow: `0 0 0 4px ${theme.palette.action.hover}`,
                  },
                })}
              >
                {selectedObjectives.map((s) => (
                  <Chip
                    key={getKey(s)}
                    label={'boId' in s ? getDefaultObjectiveName(locale, s) : s.name}
                    onDelete={(ev) => {
                      ev.stopPropagation();
                      setSelectedObjectives((prev) => prev.filter((x) => getKey(x) !== getKey(s)));
                    }}
                    deleteIcon={<XIcon size={14} />}
                    size="small"
                    sx={{
                      bgcolor: s.badgeColor,
                      mr: 0.5,
                      mb: 0.5,
                    }}
                  />
                ))}
                <Box sx={{ flex: 1, minWidth: 8 }} />
              </Box>
            )}
          </FormControl>
        </Stack>

        <Box sx={{ mt: { xs: 2, sm: 'auto' } }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              borderRadius: 3,
              py: 1.6,
              fontSize: 18,
            }}
          >
            {t('submit')}
          </Button>
        </Box>
      </Paper>

      <ObjectivePickerDialog
        open={openObjectiveModal}
        selected={selectedObjectives}
        defaultObjectives={defaultObjectives}
        onClose={() => setOpenObjectiveModal(false)}
        onChange={(next) => {
          const unique: Objective[] = [];
          for (const it of next) {
            if (unique.length >= MAX_OBJECTIVES) break;
            const key = getKey(it);
            if (
              !unique.some(
                (u) =>
                  ((u as DefaultObjective).boId
                    ? `bo:${(u as DefaultObjective).boId}`
                    : `c:${u.name}`) === key
              )
            ) {
              unique.push(it);
            }
          }
          setSelectedObjectives(unique);
        }}
      />
    </Container>
  );
};

export default CreateTripPage;

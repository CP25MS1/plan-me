import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  DialogTitle,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUpsertTripBudget } from '../hooks/use-update-trip-budget';
import { TripBudgetDto } from '@/api/budget/type';

type Props = {
  open: boolean;
  onClose: () => void;
  tripId: number;
  current?: TripBudgetDto | null;
  isOwner: boolean;
};

const budgetformat = /^\d+(\.\d{1,2})?$/;

export const SetBudgetModal: React.FC<Props> = ({ open, onClose, tripId, current, isOwner }) => {
  const { t } = useTranslation('trip_overview');
  const { t: tCommon } = useTranslation('common');

  const [budget, setBudget] = useState<string>('');
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const { mutate, isPending } = useUpsertTripBudget(tripId);

  const isEdit = current?.budgetConfigured ?? false;

  useEffect(() => {
    if (!open) {
      setBudget('');
      setErrorKey(null);
      return;
    }

    if (current?.budgetConfigured && current.totalBudget != null) {
      setBudget(current.totalBudget.toFixed(2));
    } else {
      setBudget('');
    }

    setErrorKey(null);
  }, [current, open]);

  if (!isOwner) {
    return (
      <Dialog open={open} onClose={onClose}>
        <Box p={3}>
          <Typography>{t('budget.setBudget.noPermission')}</Typography>
        </Box>
      </Dialog>
    );
  }

  const handleSave = () => {
    if (!budget) {
      setErrorKey('budget.setBudget.errors.required');
      return;
    }

    if (!budgetformat.test(budget)) {
      setErrorKey('budget.setBudget.errors.invalidFormat');
      return;
    }

    const digitsLength = budget.replace('.', '').length;

    if (digitsLength > 12) {
      setErrorKey('budget.setBudget.errors.maxDigits');
      return;
    }

    if (Number(budget) <= 0) {
      setErrorKey('budget.setBudget.errors.mustBePositive');
      return;
    }

    mutate(
      { totalBudget: budget },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: unknown) => {
          if (err instanceof Error) {
            setErrorKey('budget.setBudget.errors.generic');
          }
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={() => !isPending && onClose()}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          py: 1,
          px: 3,
        }}
      >
        {isEdit ? t('budget.setBudget.titleEdit') : t('budget.setBudget.titleCreate')}
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('budget.setBudget.help')}
        </Typography>

        <Box>
          {/* label แยกบรรทัด */}
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t('budget.setBudget.amountLabel')}
          </Typography>

          <TextField
            autoFocus
            value={budget}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(v) || v === '') {
                setBudget(v);
                setErrorKey(null);
              }
            }}
            fullWidth
            placeholder={t('budget.setBudget.placeholder')}
            error={!!errorKey}
            helperText={errorKey ? t(errorKey) : ''}
            inputMode="decimal"
            inputProps={{
              pattern: '[0-9]*',
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          {tCommon('cancel')}
        </Button>

        <Button variant="contained" onClick={handleSave} disabled={isPending}>
          {tCommon('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

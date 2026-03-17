'use client';

import React from 'react';
import {
  Avatar,
  Box,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useTranslation } from 'react-i18next';

import type { ExpenseType } from '@/api/budget/type';
import type { PublicUserInfo } from '@/api/users/type';

import type { ExpenseFormApi } from '../hooks/use-expense-form';
import type { SupportedLocale } from '../utils/format-number';
import { EXPENSE_TYPE_OPTIONS, ExpenseTypeIcon } from './expense-type-options';

const amountFormat = /^\d*\.?\d{0,2}$/;

type Props = {
  form: ExpenseFormApi;
  members: PublicUserInfo[];
  currentUserId: number;
  locale: SupportedLocale;
  disableAll: boolean;
  disablePayer: boolean;
  disableSpentAt: boolean;
};

export const ExpenseFormBasicFields: React.FC<Props> = ({
  form,
  members,
  currentUserId,
  locale,
  disableAll,
  disablePayer,
  disableSpentAt,
}) => {
  const { t } = useTranslation('trip_overview');

  return (
    <>
      {disableAll && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            px: 2,
            py: 1.5,
            borderRadius: 3,
            bgcolor: 'rgba(124,124,124,0.08)',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('budget.expenseForm.permissions.readOnlyHint')}
          </Typography>
        </Paper>
      )}

      <Stack spacing={2.5} mt={1}>
        <TextField
          label={t('budget.expenseForm.fields.name.label')}
          placeholder={t('budget.expenseForm.fields.name.placeholder')}
          InputLabelProps={{ shrink: true }}
          value={form.name}
          onChange={(e) => {
            form.setName(e.target.value);
            form.clearError('name');
            form.clearError('form');
          }}
          disabled={disableAll}
          error={!!form.errors.name}
          helperText={form.errors.name ? t(form.errors.name) : ''}
          size="small"
        />

        <Grid container spacing={2}>
          <Grid size={7}>
            <FormControl fullWidth error={!!form.errors.type} size="small" disabled={disableAll}>
              <InputLabel shrink>{t('budget.expenseForm.fields.type.label')}</InputLabel>
              <Select
                value={form.type}
                label={t('budget.expenseForm.fields.type.label')}
                displayEmpty
                onChange={(e) => {
                  form.setType(e.target.value as ExpenseType);
                  form.clearError('type');
                  form.clearError('form');
                }}
              >
                <MenuItem value="" disabled>
                  <Typography color="text.secondary">
                    {t('budget.expenseForm.fields.type.placeholder')}
                  </Typography>
                </MenuItem>
                {EXPENSE_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ExpenseTypeIcon type={opt.value} size={18} />
                      <Typography>{t(opt.labelKey)}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              {form.errors.type && (
                <Typography variant="caption" color="error">
                  {t(form.errors.type)}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid size={5}>
            <TextField
              label={t('budget.expenseForm.fields.amount.label')}
              placeholder={t('budget.expenseForm.fields.amount.placeholder')}
              InputLabelProps={{ shrink: true }}
              value={form.amountStr}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || amountFormat.test(v)) {
                  form.setAmountStr(v);
                  form.clearError('amount');
                  form.clearError('form');
                }
              }}
              disabled={disableAll}
              error={!!form.errors.amount}
              helperText={form.errors.amount ? t(form.errors.amount) : ''}
              size="small"
              inputMode="decimal"
              InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }}
            />
          </Grid>
        </Grid>

        <FormControl fullWidth size="small" error={!!form.errors.payer} disabled={disablePayer}>
          <InputLabel>{t('budget.expenseForm.fields.payer.label')}</InputLabel>
          <Select
            value={form.payerId}
            label={t('budget.expenseForm.fields.payer.label')}
            onChange={(e) => {
              form.setPayerId(Number(e.target.value));
              form.clearError('payer');
              form.clearError('form');
            }}
          >
            {members.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={m.profilePicUrl ?? undefined} sx={{ width: 24, height: 24 }}>
                    {m.username?.[0]}
                  </Avatar>
                  <Typography>{m.username}</Typography>
                  {m.id === currentUserId && (
                    <Typography variant="caption" color="text.secondary">
                      {t('budget.meSuffix')}
                    </Typography>
                  )}
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {form.errors.payer && (
          <Box>
            <Typography variant="caption" color="error">
              {t(form.errors.payer)}
            </Typography>
          </Box>
        )}

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
          <DateTimePicker
            enableAccessibleFieldDOMStructure={false}
            label={t('budget.expenseForm.fields.date.label')}
            ampm={false}
            value={form.spentAt}
            onChange={(val) => {
              if (disableSpentAt) return;
              form.setSpentAt(val);
              form.clearError('spentAt');
              form.clearError('form');
            }}
            disabled={disableSpentAt}
            format="DD/MM/YYYY HH:mm"
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                placeholder: t('budget.expenseForm.fields.date.placeholder'),
                error: !!form.errors.spentAt,
                helperText: form.errors.spentAt ? t(form.errors.spentAt) : '',
              },
            }}
          />
        </LocalizationProvider>
      </Stack>
    </>
  );
};

export default ExpenseFormBasicFields;

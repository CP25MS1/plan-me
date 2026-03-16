'use client';

import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { FilterX, Plus, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { tokens } from '@/providers/theme/design-tokens';

type Variant = 'noExpenses' | 'filteredEmpty';

type Props = {
  variant: Variant;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
};

export const ExpensesEmptyState: React.FC<Props> = ({
  variant,
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const { t } = useTranslation('trip_overview');

  const isFiltered = variant === 'filteredEmpty';

  const title = t(isFiltered ? 'budget.expenseList.emptyFilter.title' : 'budget.expenseList.empty.title');
  const body = t(isFiltered ? 'budget.expenseList.emptyFilter.body' : 'budget.expenseList.empty.body');

  const primaryLabel = t(
    isFiltered ? 'budget.expenseList.emptyFilter.cta' : 'budget.expenseList.empty.cta'
  );

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1.5px dashed ${tokens.color.primary}`,
        borderRadius: 4,
        backgroundColor: tokens.color.lightBackground,
        px: 3,
        py: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 3,
          mx: 'auto',
          mb: 2,
          bgcolor: 'rgba(37, 207, 122, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isFiltered ? (
          <FilterX size={24} color={tokens.color.primaryDark} />
        ) : (
          <Receipt size={24} color={tokens.color.primaryDark} />
        )}
      </Box>

      <Typography fontWeight={700} sx={{ mb: 0.5 }}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
        {body}
      </Typography>

      <Stack direction="row" spacing={1.5} justifyContent="center">
        <Button
          variant="contained"
          onClick={onPrimaryAction}
          startIcon={isFiltered ? undefined : <Plus size={18} />}
          sx={{ borderRadius: 999 }}
        >
          {primaryLabel}
        </Button>

        {onSecondaryAction && (
          <Button
            variant="outlined"
            onClick={onSecondaryAction}
            startIcon={<Plus size={18} />}
            sx={{ borderRadius: 999 }}
          >
            {t('budget.expenseList.empty.cta')}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default ExpensesEmptyState;


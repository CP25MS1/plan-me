'use client';

import React from 'react';
import { Avatar, AvatarGroup, Box, ButtonBase, IconButton, Stack, Typography } from '@mui/material';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { TripExpenseDto } from '@/api/budget/type';
import { SwipeReveal } from '@/components/common/card';
import { tokens } from '@/providers/theme/design-tokens';

import type { SupportedLocale } from '../utils/format-number';
import { formatCurrency } from '../utils/format-number';
import { getExpenseTotal } from '../utils/expense-money';
import { formatExpenseDateTime } from '../utils/format-date';

type Props = {
  expense: TripExpenseDto;
  locale: SupportedLocale;
  canDelete: boolean;
  onClick: () => void;
  onRequestDelete: () => void;
};

export const ExpenseRowCard: React.FC<Props> = ({
  expense,
  locale,
  canDelete,
  onClick,
  onRequestDelete,
}) => {
  const { t } = useTranslation('trip_overview');

  const participants = expense.splits.map((s) => s.participant);
  const amountText = formatCurrency(getExpenseTotal(expense), locale);
  const dateTimeText = formatExpenseDateTime(expense.spentAt, locale);

  const content = (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        px: 2,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        textAlign: 'left',
        minWidth: 0,
        justifyContent: 'space-between',
        transition: 'background-color 120ms ease',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      disableRipple
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={650} noWrap>
          {expense.name}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5, minWidth: 0 }}>
          <AvatarGroup
            max={4}
            sx={{
              '& .MuiAvatar-root': {
                width: 26,
                height: 26,
                fontSize: 11,
                border: '2px solid #fff',
              },
            }}
          >
            {participants.map((p) => (
              <Avatar key={p.id} src={p.profilePicUrl ?? undefined}>
                {(p.username ?? '?')[0]}
              </Avatar>
            ))}
          </AvatarGroup>

          <Typography variant="caption" color="text.secondary" noWrap sx={{ minWidth: 0 }}>
            {dateTimeText}
          </Typography>
        </Stack>
      </Box>

      <Typography fontWeight={800} sx={{ whiteSpace: 'nowrap' }}>
        {amountText}
      </Typography>
    </ButtonBase>
  );

  if (!canDelete) {
    return <Box sx={{ width: '100%' }}>{content}</Box>;
  }

  const actionNode = (
    <IconButton
      aria-label={t('budget.aria.deleteExpense')}
      onClick={(e) => {
        e.stopPropagation();
        onRequestDelete();
      }}
      size="large"
      sx={{ color: 'common.white' }}
    >
      <Trash2 size={20} />
    </IconButton>
  );

  return (
    <SwipeReveal
      actionNode={actionNode}
      actionWidth={80}
      actionSide="right"
      actionSx={{
        bgcolor: tokens.color.error,
      }}
      cardSx={{
        p: 0,
        borderRadius: 0,
        boxShadow: 'none',
        bgcolor: 'background.paper',
      }}
    >
      {content}
    </SwipeReveal>
  );
};

export default ExpenseRowCard;

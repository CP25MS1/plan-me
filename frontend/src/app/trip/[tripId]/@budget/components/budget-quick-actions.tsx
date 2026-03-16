'use client';

import React from 'react';
import {
  Badge,
  Box,
  ButtonBase,
  Card,
  CardContent,
  Divider,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChevronRight, HandCoins, Info, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useI18nSelector } from '@/store/selectors';

import { useGetTripExpenses } from '../hooks/use-get-trip-expenses';
import { getExpenseAmountForParticipant } from '../utils/expense-money';
import { formatCurrency } from '../utils/format-number';

type Props = {
  tripId: number;
  currentUserId: number;
  hasNewNoSplit: boolean;
  onOpenNoSplitDialog: () => void;
  onOpenDebtSummary: () => void;
};

export const BudgetQuickActions: React.FC<Props> = ({
  tripId,
  currentUserId,
  hasNewNoSplit,
  onOpenNoSplitDialog,
  onOpenDebtSummary,
}) => {
  const { t } = useTranslation('trip_overview');
  const { locale } = useI18nSelector();

  const expensesQuery = useGetTripExpenses(tripId);
  const split = expensesQuery.data?.split ?? [];
  const noSplit = expensesQuery.data?.noSplit ?? [];

  const [infoAnchorEl, setInfoAnchorEl] = React.useState<HTMLElement | null>(null);
  const infoOpen = Boolean(infoAnchorEl);

  const usedSplit = React.useMemo(
    () => split.reduce((sum, e) => sum + getExpenseAmountForParticipant(e, currentUserId), 0),
    [currentUserId, split]
  );
  const usedNoSplit = React.useMemo(
    () => noSplit.reduce((sum, e) => sum + getExpenseAmountForParticipant(e, currentUserId), 0),
    [currentUserId, noSplit]
  );
  const usedTotal = usedSplit + usedNoSplit;

  const showDash = expensesQuery.isLoading || expensesQuery.isError;
  const valueOrDash = (value: number) => (showDash ? '—' : formatCurrency(value, locale));
  const countText = (count: number) => (showDash ? '—' : t('budget.quickActions.count', { count }));

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={750}>{t('budget.paidSummary.title')}</Typography>

          <Tooltip title={t('budget.paidSummary.tooltip')}>
            <IconButton
              size="small"
              aria-label={t('budget.paidSummary.aria')}
              onClick={(e) => setInfoAnchorEl(e.currentTarget)}
            >
              <Info size={18} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Popover
          open={infoOpen}
          anchorEl={infoAnchorEl}
          onClose={() => setInfoAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { p: 2, maxWidth: 320, borderRadius: 3 } } }}
        >
          <Typography fontWeight={700} sx={{ mb: 0.5 }}>
            {t('budget.paidSummary.popoverTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {t('budget.paidSummary.popoverBody')}
          </Typography>
        </Popover>

        <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
          <PaidBox label={t('budget.paidSummary.split')} value={valueOrDash(usedSplit)} />
          <PaidBox label={t('budget.paidSummary.personal')} value={valueOrDash(usedNoSplit)} />
          <PaidBox label={t('budget.paidSummary.total')} value={valueOrDash(usedTotal)} highlight />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          <ActionRow
            ariaLabel={t('budget.quickActions.personal.aria')}
            icon={
              <Badge
                variant="dot"
                color="error"
                invisible={!hasNewNoSplit}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Wallet size={20} />
              </Badge>
            }
            title={t('budget.quickActions.personal.title')}
            subtitle={t('budget.quickActions.personal.subtitle')}
            meta={countText(noSplit.length)}
            onClick={onOpenNoSplitDialog}
          />

          <ActionRow
            ariaLabel={t('budget.quickActions.debt.aria')}
            icon={<HandCoins size={20} />}
            title={t('budget.quickActions.debt.title')}
            subtitle={t('budget.quickActions.debt.subtitle')}
            onClick={onOpenDebtSummary}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

const PaidBox = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => {
  return (
    <Box
      sx={{
        flex: 1,
        p: 1.5,
        borderRadius: 3,
        bgcolor: highlight ? 'rgba(34, 197, 94, 0.12)' : 'rgba(124,124,124,0.08)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={800} sx={{ mt: 0.25, whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
    </Box>
  );
};

const ActionRow = ({
  icon,
  title,
  subtitle,
  meta,
  onClick,
  ariaLabel,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  meta?: string;
  onClick: () => void;
  ariaLabel: string;
}) => {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={ariaLabel}
      sx={{
        width: '100%',
        px: 2,
        py: 1.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        textAlign: 'left',
        transition: 'background-color 120ms ease',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 3,
          bgcolor: 'rgba(34,197,94,0.16)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={700} noWrap>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {subtitle}
        </Typography>
      </Box>

      {meta && (
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {meta}
        </Typography>
      )}

      <ChevronRight size={18} />
    </ButtonBase>
  );
};

export default BudgetQuickActions;

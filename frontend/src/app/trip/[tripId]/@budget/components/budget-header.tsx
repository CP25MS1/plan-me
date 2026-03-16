import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  LinearProgress,
  Stack,
  Button,
  Tooltip,
} from '@mui/material';
import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TripBudgetDto } from '@/api/budget/type';
import { formatCurrency } from '../utils/format-number';
import { tokens } from '@/providers/theme/design-tokens';
import { useI18nSelector } from '@/store/selectors';

type Props = {
  data?: TripBudgetDto | null;
  onOpenSetBudget: () => void;
  onEdit?: () => void;
  isOwner: boolean;
};

export const BudgetHeader: React.FC<Props> = ({ data, onOpenSetBudget, onEdit, isOwner }) => {
  const { t } = useTranslation('trip_overview');
  const { locale } = useI18nSelector();

  const budgetConfigured = data?.budgetConfigured ?? false;
  const totalExpense = data?.totalExpense ?? 0;
  const remainingBudgetRaw = data?.remainingBudget ?? 0;
  const remainingBudget = Math.max(0, remainingBudgetRaw);
  const usagePercentage = data?.usagePercentage ?? 0;
  const totalBudget = data?.totalBudget ?? 0;
  const isOver = data?.isOverBudget ?? false;

  const progressPct = budgetConfigured ? Math.min(100, usagePercentage) : 0;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* title + percent */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{t('budget.summary.title')}</Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              fontWeight={700}
              color={budgetConfigured ? (isOver ? 'error.main' : 'success.main') : 'text.secondary'}
            >
              {budgetConfigured ? `${Math.round(usagePercentage)}%` : '0%'}
            </Typography>

            {budgetConfigured && isOwner && (
              <Tooltip title={t('budget.summary.editBudgetTooltip')}>
                <IconButton onClick={onEdit}>
                  <Pencil size={18} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* progress */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: '#e5e7eb',
              '& .MuiLinearProgress-bar': {
                backgroundColor: isOver ? '#ef4444' : '#22c55e',
              },
            }}
          />
        </Box>

        {/* usage text */}
        <Box sx={{ mt: 1 }}>
          {budgetConfigured ? (
            <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
              {t('budget.summary.usedFromTotal', {
                spent: formatCurrency(totalExpense, locale),
                total: formatCurrency(totalBudget, locale),
              })}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
              {isOwner ? t('budget.summary.notConfiguredOwner') : t('budget.summary.notConfiguredGuest')}
            </Typography>
          )}
        </Box>

        {/* total budget card */}
        <Box
          sx={{
            mt: 1,
            p: 2,
            borderRadius: 3,
            border: `1px solid ${tokens.color.primary}`,
            backgroundColor: 'rgba(34,197,94,0.12)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              color: tokens.color.textSecondary,
            }}
          >
            {t('budget.summary.totalBudget')}
          </Typography>

          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 550,
            }}
          >
            {budgetConfigured ? formatCurrency(totalBudget, locale) : '-'}
          </Typography>
        </Box>

        {/* summary row */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          {/* total expense */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 3,
              border: `1px solid ${tokens.color.textplaceholder}`,
              backgroundColor: '#f3f4f6',
            }}
          >
            <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
              {t('budget.summary.totalExpense')}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 22,
                fontWeight: 550,
              }}
            >
              {formatCurrency(totalExpense, locale)}
            </Typography>
          </Box>

          {/* remaining */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 3,
              border: `1px solid ${tokens.color.textplaceholder}`,
              backgroundColor: '#f3f4f6',
              textAlign: 'left',
            }}
          >
            <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
              {t('budget.summary.remainingBudget')}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 22,
                fontWeight: 550,
                color: tokens.color.primary,
              }}
            >
              {budgetConfigured ? formatCurrency(remainingBudget, locale) : '-'}
            </Typography>
          </Box>
        </Stack>

        {/* button when no budget */}
        {!budgetConfigured && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 2,
              gap: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {isOwner ? t('budget.summary.notConfiguredOwner') : t('budget.summary.notConfiguredGuest')}
            </Typography>
            {isOwner && (
              <Button variant="contained" onClick={onOpenSetBudget} sx={{ borderRadius: 28 }}>
                {t('budget.summary.setBudgetCta')}
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

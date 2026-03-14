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
import { TripBudgetDto } from '@/api/budget/type';
import { formatCurrencyTH } from '../utils/format-number';

type Props = {
  data?: TripBudgetDto | null;
  onOpenSetBudget: () => void;
  onEdit?: () => void;
  isOwner: boolean;
};

export const BudgetHeader: React.FC<Props> = ({ data, onOpenSetBudget, onEdit, isOwner }) => {
  const budgetConfigured = data?.budgetConfigured ?? false;
  const totalExpense = data?.totalExpense ?? 0;
  const remainingBudget = data?.remainingBudget ?? 0;
  const usagePercentage = data?.usagePercentage ?? 0;
  const isOver = data?.isOverBudget ?? false;

  // progress shown always; when no budget configured, show 0%
  const progressPct = budgetConfigured ? Math.min(100, usagePercentage) : 0;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* top row: title + pencil */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">งบประมาณรวม</Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            {/* percentage */}
            <Typography
              fontWeight={700}
              color={budgetConfigured ? (isOver ? 'error.main' : 'success.main') : 'text.secondary'}
            >
              {budgetConfigured ? `${Math.round(usagePercentage)}%` : '- %'}
            </Typography>

            {budgetConfigured && isOwner && (
              <Tooltip title="แก้ไขงบประมาณ">
                <IconButton aria-label="edit budget" onClick={onEdit}>
                  <Pencil size={18} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* progress bar (show always) */}
        <Box sx={{ mt: 2, width: '100%' }}>
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

        {/* summary row: left = used, right = remaining */}
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              งบประมาณที่ใช้ไป
            </Typography>

            <Typography
              variant="h6"
              color={isOver ? 'error.main' : 'text.primary'}
              sx={{ mt: 0.5 }}
            >
              {formatCurrencyTH(totalExpense)}
            </Typography>
          </Box>

          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">
              งบประมาณคงเหลือ
            </Typography>

            <Typography
              variant="h6"
              color={
                budgetConfigured
                  ? remainingBudget < 0
                    ? 'error.main'
                    : 'success.main'
                  : 'text.secondary'
              }
              sx={{
                mt: 0.5,
                textAlign: budgetConfigured ? 'right' : 'center',
              }}
            >
              {budgetConfigured ? formatCurrencyTH(remainingBudget) : '-'}
            </Typography>
          </Box>
        </Stack>

        {/* center message + button when no budget configured */}
        {!budgetConfigured && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              mt: 2,
              gap: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              ยังไม่ได้ตั้งงบประมาณสำหรับทริปนี้
            </Typography>

            {isOwner && (
              <Button variant="contained" onClick={onOpenSetBudget} sx={{ borderRadius: 28 }}>
                กำหนดงบประมาณ
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

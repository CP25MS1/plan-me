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
import { tokens } from '@/providers/theme/design-tokens';

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
  const totalBudget = data?.totalBudget ?? 0;
  const isOver = data?.isOverBudget ?? false;

  const progressPct = budgetConfigured ? Math.min(100, usagePercentage) : 0;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* title + percent */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">สรุปงบประมาณ</Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              fontWeight={700}
              color={budgetConfigured ? (isOver ? 'error.main' : 'success.main') : 'text.secondary'}
            >
              {budgetConfigured ? `${Math.round(usagePercentage)}%` : '0%'}
            </Typography>

            {budgetConfigured && isOwner && (
              <Tooltip title="แก้ไขงบประมาณ">
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
              ใช้ไปแล้ว {formatCurrencyTH(totalExpense)} จากงบทั้งหมด{' '}
              {formatCurrencyTH(totalBudget)}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
              {isOwner ? 'ยังไม่ได้ตั้งงบประมาณสำหรับทริปนี้' : 'เจ้าของทริปยังไม่ได้กำหนดงบประมาณ'}
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
            งบประมาณรวม
          </Typography>

          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 550,
            }}
          >
            {budgetConfigured ? formatCurrencyTH(totalBudget) : '-'}
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
              ค่าใช้จ่ายรวม
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 22,
                fontWeight: 550,
              }}
            >
              {formatCurrencyTH(totalExpense)}
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
              งบประมาณคงเหลือ
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 22,
                fontWeight: 550,
                color: tokens.color.primary,
              }}
            >
              {budgetConfigured ? formatCurrencyTH(remainingBudget) : '-'}
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
              {isOwner ? 'ยังไม่ได้ตั้งงบประมาณสำหรับทริปนี้' : 'เจ้าของทริปยังไม่ได้กำหนดงบประมาณ'}
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

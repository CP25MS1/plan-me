import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from '@mui/material';
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
  const [budget, setBudget] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useUpsertTripBudget(tripId);

  const isEdit = current?.budgetConfigured ?? false;

  useEffect(() => {
    if (!open) {
      setBudget('');
      setError(null);
      return;
    }

    if (current?.budgetConfigured && current.totalBudget != null) {
      setBudget(current.totalBudget.toFixed(2));
    } else {
      setBudget('');
    }

    setError(null);
  }, [current, open]);

  if (!isOwner) {
    return (
      <Dialog open={open} onClose={onClose}>
        <Box p={3}>
          <Typography>คุณไม่มีสิทธิ์แก้ไขงบประมาณของทริปนี้</Typography>
        </Box>
      </Dialog>
    );
  }

  const handleSave = () => {
    if (!budget) {
      setError('โปรดระบุจำนวนเงิน');
      return;
    }

    if (!budgetformat.test(budget)) {
      setError('รูปแบบต้องเป็นตัวเลข มีได้สูงสุด 2 ตำแหน่งทศนิยม เช่น 12000.00');
      return;
    }

    const digitsLength = budget.replace('.', '').length;

    if (digitsLength > 12) {
      setError('โปรดระบุจำนวนเงินไม่เกิน 12 หลักรวมทศนิยม');
      return;
    }

    if (Number(budget) <= 0) {
      setError('จำนวนเงินต้องมากกว่า 0');
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
            setError('เกิดข้อผิดพลาด');
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
        {isEdit ? 'แก้ไขงบประมาณของทริป' : 'กำหนดงบประมาณของทริป'}
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          สมาชิกในทริปของคุณจะเห็นงบประมาณที่คุณตั้งไว้
        </Typography>

        <Box>
          {/* label แยกบรรทัด */}
          <Typography variant="body2" sx={{ mb: 1 }}>
            จำนวนเงิน (บาท)
          </Typography>

          <TextField
            autoFocus
            value={budget}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(v) || v === '') {
                setBudget(v);
                setError(null);
              }
            }}
            fullWidth
            placeholder="12000.00"
            error={!!error}
            helperText={error ?? ''}
            inputMode="decimal"
            inputProps={{
              pattern: '[0-9]*',
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          ยกเลิก
        </Button>

        <Button variant="contained" onClick={handleSave} disabled={isPending}>
          ยืนยัน
        </Button>
      </DialogActions>
    </Dialog>
  );
};

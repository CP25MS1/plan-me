'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Typography,
  Checkbox,
  FormControlLabel,
  Avatar,
  Box,
  Divider,
} from '@mui/material';

import dayjs from '@/lib/dayjs';
import type { Dayjs } from 'dayjs';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useGetTripMembers } from '@/app/hooks/use-get-trip-members';
import { useCreateTripExpense } from '../hooks/use-create-trip-expense';
import { CreateTripExpenseRequest, ExpenseType } from '@/api/budget/type';

type PublicUserInfo = {
  id: number;
  username: string;
  profilePicUrl?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  tripId: number;
  members: PublicUserInfo[];
  currentUserId: number;
};

type SplitMode = 'ALL' | 'SELECTED' | 'NO_SPLIT';

export const AddExpenseModal: React.FC<Props> = ({ open, onClose, tripId, currentUserId }) => {
  const [name, setName] = React.useState<string>('');
  const [type, setType] = React.useState<ExpenseType>('FOOD');
  const [amountStr, setAmountStr] = React.useState<string>('');
  const [spentAt, setSpentAt] = React.useState<Dayjs | null>(() => dayjs());
  const [payerId, setPayerId] = React.useState<number>(currentUserId);
  const [splitMode, setSplitMode] = React.useState<SplitMode>('ALL');
  const members = useGetTripMembers(tripId);
  const [selectedParticipantIds, setSelectedParticipantIds] = React.useState<number[]>([]);

  const [customSplits, setCustomSplits] = React.useState<Record<number, string>>({});
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const { mutateAsync } = useCreateTripExpense(tripId);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setSelectedParticipantIds(members.map((m) => m.id));
  }, [members]);

  const validate = (): boolean => {
    const err: Record<string, string> = {};

    if (!name.trim()) err.name = 'โปรดระบุชื่อค่าใช้จ่าย';
    if (!amountStr.trim()) {
      err.amount = 'โปรดระบุจำนวนเงิน';
    } else {
      const norm = amountStr.replace(',', '');
      if (!/^\d+(\.\d{1,2})?$/.test(norm)) {
        err.amount = 'รูปแบบจำนวนเงินไม่ถูกต้อง (ใช้ตัวเลข และทศนิยมสูงสุด 2 ตำแหน่ง)';
      } else if (Number(norm) <= 0) {
        err.amount = 'จำนวนเงินต้องมากกว่า 0';
      }
    }

    if (!type) err.type = 'โปรดเลือกประเภท';
    if (!spentAt) err.spentAt = 'โปรดระบุวันที่';

    if (!members.find((m) => m.id === payerId)) {
      err.payer = 'ผู้จ่ายต้องเป็นสมาชิกของทริป';
    }

    if (splitMode === 'NO_SPLIT') {
      // ok
    } else {
      if (!selectedParticipantIds || selectedParticipantIds.length === 0) {
        err.splits = 'ต้องมีผู้ร่วมจ่ายอย่างน้อย 1 คน';
      } else {
        if (Object.keys(customSplits).length > 0) {
          let sum = 0;
          for (const pid of selectedParticipantIds) {
            const raw = customSplits[pid] ?? '';
            const v = raw.replace(',', '');
            if (v === '') {
              err.splits = 'โปรดระบุจำนวนเงินสำหรับผู้ร่วมจ่ายทุกคน หรือล้างค่าในช่องกำหนดเอง';
              break;
            }
            if (!/^\d+(\.\d{1,2})?$/.test(v)) {
              err.splits = 'รูปแบบจำนวนเงินผู้ร่วมจ่ายไม่ถูกต้อง';
              break;
            }
            const n = Number(v);
            if (n <= 0) {
              err.splits = 'จำนวนเงินผู้ร่วมจ่ายต้องมากกว่า 0';
              break;
            }
            sum += n;
          }
          const total = Number(amountStr.replace(',', ''));
          if (!err.splits && Math.abs(sum - total) > 0.01) {
            err.splits = `ผลรวมการแบ่ง (${sum.toFixed(2)}) ต้องเท่ากับยอดรวม ${total.toFixed(2)}`;
          }
        }
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleToggleParticipant = (id: number) => {
    setSelectedParticipantIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      return [...prev, id];
    });
    setCustomSplits((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const computeEqualSplits = (): Record<number, number> => {
    const total = Number(amountStr.replace(',', '')) || 0;
    const people = selectedParticipantIds.length || 1;
    const baseRaw = total / people;
    const base = Math.floor(baseRaw * 100) / 100;
    const parts: number[] = new Array(people).fill(base);
    const assigned = base * people;
    let remainder = Math.round((total - assigned) * 100); // in satang
    for (let i = 0; i < people && remainder > 0; i++) {
      parts[i] = +(parts[i] + 0.01).toFixed(2);
      remainder--;
    }
    const map: Record<number, number> = {};
    selectedParticipantIds.forEach((id, idx) => {
      map[id] = parts[idx];
    });
    return map;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);

    try {
      const total = Number(amountStr.replace(',', ''));
      let splitsPayload: { participantUserId: number; amount: number }[] = [];

      if (splitMode === 'NO_SPLIT') {
        splitsPayload = [{ participantUserId: payerId, amount: total }];
      } else {
        if (Object.keys(customSplits).length > 0) {
          splitsPayload = selectedParticipantIds.map((pid) => ({
            participantUserId: pid,
            amount: Number((customSplits[pid] ?? '0').replace(',', '')),
          }));
        } else {
          const equal = computeEqualSplits();
          splitsPayload = selectedParticipantIds.map((pid) => ({
            participantUserId: pid,
            amount: equal[pid],
          }));
        }
      }

      const payload: CreateTripExpenseRequest = {
        name: name.trim(),
        type,
        payerUserId: payerId,
        // dayjs -> ISO string
        spentAt: spentAt ? spentAt.toISOString() : dayjs().toISOString(),
        splits: splitsPayload,
      };

      await mutateAsync(payload);

      setName('');
      setType('FOOD');
      setAmountStr('');
      setSpentAt(dayjs());
      setPayerId(currentUserId);
      setSplitMode('ALL');
      setSelectedParticipantIds(members.map((m) => m.id));
      setCustomSplits({});
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors({ form: err.message });
      } else {
        try {
          setErrors({ form: String(err) });
        } catch {
          setErrors({ form: 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ' });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onCustomSplitChange = (participantId: number, value: string) => {
    setCustomSplits((prev) => ({ ...prev, [participantId]: value }));
  };

  const memberById = React.useMemo(() => {
    const map = new Map<number, PublicUserInfo>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  const equalPreview = React.useMemo(() => {
    if (!amountStr || selectedParticipantIds.length === 0) return {};
    return computeEqualSplits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountStr, selectedParticipantIds.join(',')]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>เพิ่มค่าใช้จ่าย</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="ชื่อการใช้จ่าย"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>ประเภท</InputLabel>
              <Select
                value={type}
                label="ประเภท"
                onChange={(e: SelectChangeEvent<string>) => setType(e.target.value as ExpenseType)}
                error={!!errors.type}
              >
                <MenuItem value={'TRANSPORT'}>การเดินทาง</MenuItem>
                <MenuItem value={'ACCOMMODATION'}>ที่พัก</MenuItem>
                <MenuItem value={'FOOD' as ExpenseType}>อาหาร</MenuItem>
                <MenuItem value={'ACTIVITY' as ExpenseType}>กิจกรรม</MenuItem>
                <MenuItem value={'SHOPPING' as ExpenseType}>ช็อปปิ้ง</MenuItem>
                <MenuItem value={'OTHER' as ExpenseType}>อื่น ๆ</MenuItem>
              </Select>
              {errors.type && (
                <Typography color="error" variant="caption">
                  {errors.type}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="จำนวนเงิน (฿)"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              error={!!errors.amount}
              helperText={errors.amount ?? 'ใส่จำนวนเต็มหรือทศนิยมไม่เกิน 2 ตำแหน่ง'}
              fullWidth
            />
          </Stack>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="วันที่ใช้จ่าย"
              value={spentAt}
              onChange={(newVal) => setSpentAt(newVal)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.spentAt,
                  helperText: errors.spentAt,
                },
              }}
            />
          </LocalizationProvider>

          <FormControl fullWidth>
            <InputLabel>ผู้จ่าย</InputLabel>
            <Select
              value={String(payerId)}
              label="ผู้จ่าย"
              onChange={(e: SelectChangeEvent<string>) => setPayerId(Number(e.target.value))}
              error={!!errors.payer}
            >
              {members.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      src={m.profilePicUrl ?? undefined}
                      sx={{ width: 24, height: 24, fontSize: 12 }}
                    >
                      {m.username[0]}
                    </Avatar>
                    <Typography>{m.username}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            {errors.payer && (
              <Typography color="error" variant="caption">
                {errors.payer}
              </Typography>
            )}
          </FormControl>

          <Divider />

          <Stack spacing={1}>
            <Typography fontWeight={600}>วิธีการแบ่งจ่าย</Typography>

            <Stack direction="row" spacing={1}>
              <Button
                variant={splitMode === 'ALL' ? 'contained' : 'outlined'}
                onClick={() => setSplitMode('ALL')}
              >
                หาร (ทุกคนที่ถูกเลือก)
              </Button>

              <Button
                variant={splitMode === 'SELECTED' ? 'contained' : 'outlined'}
                onClick={() => setSplitMode('SELECTED')}
              >
                รายคน (เลือกสมาชิก)
              </Button>

              <Button
                variant={splitMode === 'NO_SPLIT' ? 'contained' : 'outlined'}
                onClick={() => setSplitMode('NO_SPLIT')}
              >
                ไม่หาร
              </Button>
            </Stack>

            {splitMode !== 'NO_SPLIT' && (
              <>
                <Typography variant="body2">เลือกผู้ร่วมจ่าย</Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {members.map((m) => {
                    const checked = selectedParticipantIds.includes(m.id);
                    return (
                      <FormControlLabel
                        key={m.id}
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={() => handleToggleParticipant(m.id)}
                          />
                        }
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                              src={m.profilePicUrl ?? undefined}
                              sx={{ width: 24, height: 24, fontSize: 12 }}
                            >
                              {m.username[0]}
                            </Avatar>
                            <Typography>{m.username}</Typography>
                            {customSplits[m.id] ? (
                              <Typography>฿{customSplits[m.id]}</Typography>
                            ) : null}
                          </Stack>
                        }
                      />
                    );
                  })}
                </Box>

                <Typography variant="body2" color="text.secondary">
                  คุณสามารถกำหนดจำนวนเงินแบบกำหนดเองได้ (ถ้าว่างจะใช้หารเท่า)
                </Typography>

                <Stack spacing={1}>
                  {selectedParticipantIds.map((pid) => {
                    const m = memberById.get(pid)!;
                    const val = customSplits[pid] ?? '';
                    return (
                      <Stack key={pid} direction="row" spacing={1} alignItems="center">
                        <Avatar
                          src={m.profilePicUrl ?? undefined}
                          sx={{ width: 28, height: 28, fontSize: 12 }}
                        >
                          {m.username[0]}
                        </Avatar>
                        <Typography sx={{ width: 120 }}>{m.username}</Typography>

                        <TextField
                          placeholder={equalPreview[pid] ? `${equalPreview[pid].toFixed(2)}` : ''}
                          value={val}
                          onChange={(e) => onCustomSplitChange(pid, e.target.value)}
                          size="small"
                          sx={{ width: 160 }}
                          InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>฿</Typography> }}
                        />
                      </Stack>
                    );
                  })}
                </Stack>

                {errors.splits && <Typography color="error">{errors.splits}</Typography>}
              </>
            )}

            {splitMode === 'NO_SPLIT' && (
              <Typography variant="body2" color="text.secondary">
                ค่าใช้จ่ายจะถูกเก็บโดยไม่สร้งหนี้ระหว่างสมาชิก (แสดงเฉพาะผู้สร้าง).
              </Typography>
            )}
          </Stack>

          {errors.form && <Typography color="error">{errors.form}</Typography>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          ยกเลิก
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          บันทึก
        </Button>
      </DialogActions>
    </Dialog>
  );
};

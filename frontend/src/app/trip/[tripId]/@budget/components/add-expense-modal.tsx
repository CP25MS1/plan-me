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
  Divider,
  Grid,
  Chip,
  Box,
  Avatar,
  InputAdornment,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';

import dayjs from '@/lib/dayjs';
import type { Dayjs } from 'dayjs';
import { useCreateTripExpense } from '../hooks/use-create-trip-expense';
import { useGetTripMembers } from '@/app/hooks/use-get-trip-members';
import { CreateTripExpenseRequest } from '@/api/budget/type';
import { PublicUserInfo } from '@/api/users/type';
import { MemberPickerModal } from './member-picker-modal';
import { EXPENSE_TYPE_OPTIONS } from './expense-type-options';
import { ParticipantsSplitEditor } from './participants-split-editor';
import { computeEqualSplitAmounts } from '../utils/split-utils';
import { X } from 'lucide-react';
import { ExpenseType, ExpenseSplitType } from '@/api/budget/type';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

type Props = {
  open: boolean;
  onClose: () => void;
  tripId: number;
  currentUserId: number;
};

type SplitEntry = { participantUserId: number; amount: number };

export const AddExpenseModal: React.FC<Props> = ({ open, onClose, tripId, currentUserId }) => {
  const members = useGetTripMembers(tripId);
  const { mutate, isPending } = useCreateTripExpense(tripId);

  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<ExpenseType | ''>('');
  const [amountStr, setAmountStr] = React.useState('');
  const [spentAt, setSpentAt] = React.useState<Dayjs | null>(dayjs());
  const [payerId, setPayerId] = React.useState<number>(currentUserId);
  const [splitMode, setSplitMode] = React.useState<ExpenseSplitType>('NO_SPLIT');
  const [selectedParticipantIds, setSelectedParticipantIds] = React.useState<number[]>([]);
  const [memberPickerOpen, setMemberPickerOpen] = React.useState(false);
  const [customSplitsNumeric, setCustomSplitsNumeric] = React.useState<Record<number, number>>({});
  const [errors, setErrors] = React.useState<Record<string, string | null>>({});

  React.useEffect(() => {
    if (!open) return;
    setSelectedParticipantIds([]);
    setPayerId(currentUserId);
    setAmountStr('');
    setName('');
    setSpentAt(dayjs());
    setCustomSplitsNumeric({});
    setSplitMode('NO_SPLIT');
    setType('');
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const memberById = React.useMemo(() => {
    const map = new Map<number, PublicUserInfo>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  const participantsOrdered: PublicUserInfo[] = selectedParticipantIds.map((id) => {
    const m = memberById.get(id);
    return (
      m ?? {
        id,
        username: 'Unknown',
        email: '',
        profilePicUrl: '',
      }
    );
  });

  const totalAmount = Number(amountStr.replace(/,/g, '')) || 0;

  const splitSum = React.useMemo(() => {
    if (splitMode === 'NO_SPLIT') return totalAmount;

    const hasCustom = Object.keys(customSplitsNumeric).length > 0;

    if (hasCustom) {
      return selectedParticipantIds.reduce((sum, id) => sum + (customSplitsNumeric[id] ?? 0), 0);
    }

    const equal = computeEqualSplitAmounts(totalAmount, selectedParticipantIds);
    return selectedParticipantIds.reduce((sum, id) => sum + (equal[id] ?? 0), 0);
  }, [splitMode, totalAmount, customSplitsNumeric, selectedParticipantIds]);

  const splitComplete = splitSum === totalAmount;

  const validate = (): boolean => {
    const e: Record<string, string | null> = {};
    if (!name.trim()) e.name = 'โปรดระบุชื่อ';
    if (!type) e.type = 'โปรดเลือกประเภท';
    if (!amountStr.trim()) e.amount = 'โปรดระบุจำนวนเงิน';
    if (!spentAt) e.spentAt = 'โปรดระบุวันที่';
    if (!members.find((m) => m.id === payerId)) e.payer = 'ผู้จ่ายต้องเป็นสมาชิก';
    if (splitMode === 'SPLIT' && selectedParticipantIds.length === 0)
      e.splits = 'โปรดเลือกผู้ร่วมจ่าย';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildSplitsPayload = (): SplitEntry[] => {
    if (splitMode === 'NO_SPLIT') {
      return [{ participantUserId: payerId, amount: totalAmount }];
    }

    const hasCustom = Object.keys(customSplitsNumeric).length > 0;
    if (hasCustom) {
      return selectedParticipantIds.map((id) => ({
        participantUserId: id,
        amount: customSplitsNumeric[id] ?? 0,
      }));
    }

    const equal = computeEqualSplitAmounts(totalAmount, selectedParticipantIds);
    return selectedParticipantIds.map((id) => ({ participantUserId: id, amount: equal[id] ?? 0 }));
  };

  const handleSplitsChange = React.useCallback((map: Record<number, number>) => {
    setCustomSplitsNumeric((prev) => {
      const prevKeys = Object.keys(prev).map(Number).sort();
      const nextKeys = Object.keys(map).map(Number).sort();
      if (prevKeys.length !== nextKeys.length) return map;
      for (const k of prevKeys) {
        if ((prev[k] ?? null) !== (map[k] ?? null)) return map;
      }
      return prev;
    });
  }, []);

  const handleSubmit = () => {
    if (!validate()) return;
    if (!spentAt) return;
    if (splitMode === 'SPLIT' && !splitComplete) {
      setErrors((s) => ({ ...s, form: 'จำนวนเงินยังไม่ครบ' }));
      return;
    }
    if (!type) {
      setErrors((s) => ({ ...s, type: 'โปรดเลือกประเภท' }));
      return;
    }
    const payload: CreateTripExpenseRequest = {
      name,
      type,
      payerUserId: payerId,
      spentAt: spentAt.toISOString(),
      splits: buildSplitsPayload(),
    };
    mutate(payload, {
      onSuccess: () => onClose(),
      onError: () => setErrors({ form: 'เกิดข้อผิดพลาดในการบันทึก' }),
    });
  };
  const amountValid = amountStr.trim() !== '';

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          เพิ่มค่าใช้จ่าย
          <IconButton size="small" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="ชื่อการใช้จ่าย"
              placeholder="e.g. หมูกระทะ"
              InputLabelProps={{ shrink: true }}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((s) => ({ ...s, name: null }));
              }}
              error={!!errors.name}
              helperText={errors.name ?? ''}
              size="small"
            />

            <Grid container spacing={2}>
              <Grid size={7}>
                <FormControl fullWidth error={!!errors.type} size="small">
                  <InputLabel shrink>ประเภท</InputLabel>

                  <Select
                    value={type}
                    label="ประเภท"
                    displayEmpty
                    onChange={(e: SelectChangeEvent) => {
                      setType(e.target.value as ExpenseType);
                      if (errors.type) setErrors((s) => ({ ...s, type: null }));
                    }}
                  >
                    <MenuItem value="" disabled>
                      <Typography color="text.secondary">โปรดเลือกประเภท</Typography>
                    </MenuItem>

                    {EXPENSE_TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {opt.icon}
                          <Typography>{opt.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.type && (
                    <Typography variant="caption" color="error">
                      {errors.type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid size={5}>
                <TextField
                  label="จำนวนเงิน"
                  placeholder="e.g. 500"
                  InputLabelProps={{ shrink: true }}
                  value={amountStr}
                  onChange={(e) => {
                    const onlyNumber = e.target.value.replace(/[^0-9]/g, '');
                    setAmountStr(onlyNumber);

                    if (errors.amount) setErrors((s) => ({ ...s, amount: null }));
                  }}
                  error={!!errors.amount}
                  helperText={errors.amount ?? ''}
                  size="small"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">฿</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>จ่ายโดย</InputLabel>
                  <Select
                    value={payerId}
                    label="จ่ายโดย"
                    onChange={(e: SelectChangeEvent<number>) => setPayerId(Number(e.target.value))}
                  >
                    {members.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar src={m.profilePicUrl ?? undefined} sx={{ width: 24, height: 24 }}>
                            {m.username[0]}
                          </Avatar>

                          <Typography>{m.username}</Typography>

                          {m.id === currentUserId && (
                            <Typography variant="caption" color="text.secondary">
                              (ฉัน)
                            </Typography>
                          )}
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errors.payer && (
                  <Typography variant="caption" color="error">
                    {errors.payer}
                  </Typography>
                )}
              </Grid>
            </Grid>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <DateTimePicker
                    enableAccessibleFieldDOMStructure={false}
                    label="วันที่และเวลา"
                    ampm={false}
                    value={spentAt}
                    onChange={(val) => {
                      setSpentAt(val);
                    }}
                    format="DD/MM/YYYY HH:mm"
                    slots={{ textField: TextField }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        placeholder: 'e.g. 20/03/2026 18:30',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>

            <Divider />

            <Box>
              <Typography sx={{ mb: 1 }}>วิธีการแบ่งจ่าย</Typography>

              <Stack direction="row" alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Chip
                    label="ไม่หาร"
                    clickable
                    color={splitMode === 'NO_SPLIT' ? 'success' : 'default'}
                    onClick={() => setSplitMode('NO_SPLIT')}
                  />

                  <Chip
                    label="หาร"
                    clickable
                    color={splitMode === 'SPLIT' ? 'success' : 'default'}
                    onClick={() => setSplitMode('SPLIT')}
                  />
                </Stack>

                <Box sx={{ flexGrow: 1 }} />

                {splitMode === 'SPLIT' && (
                  <Button size="small" variant="outlined" onClick={() => setMemberPickerOpen(true)}>
                    เลือกคนที่หาร ({selectedParticipantIds.length})
                  </Button>
                )}
              </Stack>

              {splitMode === 'NO_SPLIT' && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{
                    mt: 2,
                    px: 3,
                    lineHeight: 1.5,
                  }}
                >
                  รายการค่าใช้จ่ายนี้จะไม่รวมในงบประมาณของทริป และไม่แสดงให้ผู้ร่วมทริปคนอื่นเห็น
                </Typography>
              )}

              {splitMode === 'SPLIT' && (
                <Paper sx={{ p: 1, mt: 1 }}>
                  <ParticipantsSplitEditor
                    totalAmount={Number(amountStr.replace(/,/g, '')) || 0}
                    participants={participantsOrdered}
                    payerId={payerId}
                    onChange={handleSplitsChange}
                    error={errors.splits ?? null}
                  />
                </Paper>
              )}
            </Box>

            {errors.form && <Typography color="error">{errors.form}</Typography>}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>ยกเลิก</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            disabled={isPending || !amountValid || (splitMode === 'SPLIT' && !splitComplete)}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isPending ? 'กำลังบันทึก' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      <MemberPickerModal
        open={memberPickerOpen}
        onClose={() => setMemberPickerOpen(false)}
        members={members}
        payerId={payerId}
        selectedIds={selectedParticipantIds}
        onConfirm={(ids) => {
          setSelectedParticipantIds(ids);
          setMemberPickerOpen(false);
        }}
      />
    </>
  );
};

export default AddExpenseModal;

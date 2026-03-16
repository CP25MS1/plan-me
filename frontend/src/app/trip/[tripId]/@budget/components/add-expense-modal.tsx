'use client';

import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
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
import { X } from 'lucide-react';
import dayjs from '@/lib/dayjs';
import type { Dayjs } from 'dayjs';
import type { CreateTripExpenseRequest, ExpenseSplitType, ExpenseType } from '@/api/budget/type';
import type { PublicUserInfo } from '@/api/users/type';
import { useGetTripMembers } from '@/app/hooks/use-get-trip-members';
import { useCreateTripExpense } from '../hooks/use-create-trip-expense';
import { computeEqualSplitAmounts } from '../utils/split-utils';
import { EXPENSE_TYPE_OPTIONS } from './expense-type-options';
import { MemberPickerModal } from './member-picker-modal';
import { ParticipantsSplitEditor } from './participants-split-editor';

type Props = {
  open: boolean;
  onClose: () => void;
  tripId: number;
  currentUserId: number;
};

type ErrorKey = 'name' | 'type' | 'amount' | 'payer' | 'spentAt' | 'splits' | 'form';
type FormErrors = Partial<Record<ErrorKey, string>>;
type SplitMap = Record<number, number>;

const toCents = (n: number) => Math.round(n * 100);

export const AddExpenseModal: React.FC<Props> = ({ open, onClose, tripId, currentUserId }) => {
  const members = useGetTripMembers(tripId);
  const { mutate, isPending } = useCreateTripExpense(tripId);
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<ExpenseType | ''>('');
  const [amountStr, setAmountStr] = React.useState('');
  const [spentAt, setSpentAt] = React.useState<Dayjs | null>(dayjs());
  const [payerId, setPayerId] = React.useState(currentUserId);
  const [splitMode, setSplitMode] = React.useState<ExpenseSplitType>('NO_SPLIT');
  const [selectedParticipantIds, setSelectedParticipantIds] = React.useState<number[]>([]);
  const [memberPickerOpen, setMemberPickerOpen] = React.useState(false);
  const [splitMap, setSplitMap] = React.useState<SplitMap>({});
  const [errors, setErrors] = React.useState<FormErrors>({});
  const clearError = React.useCallback((key: ErrorKey) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);
  const resetForm = React.useCallback((userId: number) => {
    setName('');
    setType('');
    setAmountStr('');
    setSpentAt(dayjs());
    setPayerId(userId);
    setSplitMode('NO_SPLIT');
    setSelectedParticipantIds([]);
    setSplitMap({});
    setErrors({});
    setMemberPickerOpen(false);
  }, []);
  React.useEffect(() => {
    if (open) resetForm(currentUserId);
    else setMemberPickerOpen(false);
  }, [open, currentUserId, resetForm]);
  const memberById = React.useMemo(
    () => new Map(members.map((m) => [m.id, m] as const)),
    [members]
  );

  const participantsOrdered = React.useMemo<PublicUserInfo[]>(
    () =>
      selectedParticipantIds.map(
        (id) => memberById.get(id) ?? { id, username: 'Unknown', email: '', profilePicUrl: '' }
      ),
    [memberById, selectedParticipantIds]
  );
  const totalAmount = amountStr ? Number(amountStr) : 0;
  const totalCents = toCents(totalAmount);
  const isSplit = splitMode === 'SPLIT';

  const effectiveSplitMap = React.useMemo<SplitMap>(() => {
    if (!isSplit || selectedParticipantIds.length === 0) return {};
    const equal = computeEqualSplitAmounts(totalAmount, selectedParticipantIds);
    if (Object.keys(splitMap).length === 0) return equal;
    const out: SplitMap = {};
    for (const id of selectedParticipantIds) out[id] = splitMap[id] ?? equal[id] ?? 0;
    return out;
  }, [isSplit, selectedParticipantIds, splitMap, totalAmount]);
  const splitSumCents = isSplit
    ? selectedParticipantIds.reduce((sum, id) => sum + toCents(effectiveSplitMap[id] ?? 0), 0)
    : totalCents;
  const splitComplete = splitSumCents === totalCents;

  const validateForm = (): FormErrors => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'โปรดระบุชื่อ';
    if (!type) next.type = 'โปรดเลือกประเภท';
    if (!amountStr.trim()) next.amount = 'โปรดระบุจำนวนเงิน';
    if (!spentAt) next.spentAt = 'โปรดระบุวันที่';
    if (!members.some((m) => m.id === payerId)) next.payer = 'ผู้จ่ายต้องเป็นสมาชิก';
    if (isSplit) {
      if (selectedParticipantIds.length === 0) next.splits = 'โปรดเลือกผู้ร่วมจ่าย';
      else if (!splitComplete) next.form = 'จำนวนเงินยังไม่ครบ';
    }
    return next;
  };

  const buildSplitsPayload = (): CreateTripExpenseRequest['splits'] => {
    if (!isSplit) return [{ participantUserId: payerId, amount: totalAmount }];
    return selectedParticipantIds.map((id) => ({
      participantUserId: id,
      amount: effectiveSplitMap[id] ?? 0,
    }));
  };
  const handleSplitsChange = React.useCallback((map: SplitMap) => {
    setSplitMap(map);
    clearError('splits');
    clearError('form');
  }, [clearError]);

  const handleSubmit = () => {
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!spentAt || !type) return;

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
                clearError('name');
                clearError('form');
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
                    onChange={(e) => {
                      setType(e.target.value as ExpenseType);
                      clearError('type');
                      clearError('form');
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
                    setAmountStr(e.target.value.replace(/[^0-9]/g, ''));
                    clearError('amount');
                    clearError('form');
                  }}
                  error={!!errors.amount}
                  helperText={errors.amount ?? ''}
                  size="small"
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">฿</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={12}>
                <FormControl fullWidth size="small" error={!!errors.payer}>
                  <InputLabel>จ่ายโดย</InputLabel>
                  <Select
                    value={payerId}
                    label="จ่ายโดย"
                    onChange={(e) => {
                      setPayerId(Number(e.target.value));
                      clearError('payer');
                      clearError('form');
                    }}
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
                      clearError('spentAt');
                      clearError('form');
                    }}
                    format="DD/MM/YYYY HH:mm"
                    slots={{ textField: TextField }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        placeholder: 'e.g. 20/03/2026 18:30',
                        error: !!errors.spentAt,
                        helperText: errors.spentAt,
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
                    color={!isSplit ? 'success' : 'default'}
                    onClick={() => {
                      setSplitMode('NO_SPLIT');
                      clearError('splits');
                      clearError('form');
                    }}
                  />
                  <Chip
                    label="หาร"
                    clickable
                    color={isSplit ? 'success' : 'default'}
                    onClick={() => {
                      setSplitMode('SPLIT');
                      clearError('splits');
                      clearError('form');
                    }}
                  />
                </Stack>
                <Box sx={{ flexGrow: 1 }} />
                {isSplit && (
                  <Button size="small" variant="outlined" onClick={() => setMemberPickerOpen(true)}>
                    เลือกคนที่หาร ({selectedParticipantIds.length})
                  </Button>
                )}
              </Stack>
              {isSplit && errors.splits && (
                <Typography variant="caption" color="error">
                  {errors.splits}
                </Typography>
              )}
              {!isSplit && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 2, px: 3, lineHeight: 1.5 }}
                >
                  รายการค่าใช้จ่ายนี้จะไม่รวมในงบประมาณของทริป และไม่แสดงให้ผู้ร่วมทริปคนอื่นเห็น
                </Typography>
              )}
              {isSplit && (
                <Paper sx={{ p: 1, mt: 1 }}>
                  <ParticipantsSplitEditor
                    totalAmount={totalAmount}
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
            disabled={isPending || !amountStr.trim() || (isSplit && !splitComplete)}
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
          clearError('splits');
          clearError('form');
        }}
      />
    </>
  );
};

export default AddExpenseModal;

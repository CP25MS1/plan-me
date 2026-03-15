'use client';

import React from 'react';
import { Stack, Avatar, Typography, TextField, Box, Chip } from '@mui/material';
import { PublicUserInfo } from '@/api/users/type';
import { computeEqualSplitAmounts } from '../utils/split-utils';

type Props = {
  totalAmount: number;
  participants: PublicUserInfo[];
  payerId: number;
  onChange: (splits: Record<number, number>) => void;
  error?: string | null;
};

export const ParticipantsSplitEditor: React.FC<Props> = ({
  totalAmount,
  participants,
  payerId,
  onChange,
}) => {
  const ids = React.useMemo(() => participants.map((p) => p.id), [participants]);

  const equalMap = React.useMemo(
    () => computeEqualSplitAmounts(totalAmount, ids),
    [totalAmount, ids]
  );

  const [customMap, setCustomMap] = React.useState<Record<number, string>>({});

  const lastEmittedRef = React.useRef<string>('');

  React.useEffect(() => {
    const out: Record<number, number> = {};

    for (const id of ids) {
      const raw = (customMap[id] ?? '').trim();

      if (!raw) out[id] = equalMap[id] ?? 0;
      else {
        const n = Number(raw.replace(/,/g, ''));
        out[id] = Number.isFinite(n) ? +n.toFixed(2) : 0;
      }
    }

    const serialized = JSON.stringify(out);

    if (serialized !== lastEmittedRef.current) {
      lastEmittedRef.current = serialized;
      onChange(out);
    }
  }, [customMap, equalMap, ids, onChange]);

  React.useEffect(() => {
    setCustomMap((prev) => {
      const next: Record<number, string> = {};
      for (const id of ids) next[id] = prev[id] ?? '';
      return next;
    });
  }, [ids]);

  const handleChange = (id: number, value: string) => {
    const cleaned = value.replace(/[^\d.,]/g, '');
    setCustomMap((prev) => ({ ...prev, [id]: cleaned }));
  };

  const displayName = (name: string) => {
    return name.split(' ')[0];
  };

  const totalEntered = participants.reduce((sum, p) => {
    const raw = customMap[p.id];
    if (!raw) return sum + (equalMap[p.id] ?? 0);
    return sum + (Number(raw.replace(/,/g, '')) || 0);
  }, 0);

  const diff = totalAmount - totalEntered;

  if (participants.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          ยังไม่ได้เลือกคนที่หาร
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1}>
      {participants.map((p) => {
        const id = p.id;

        const enteredStr = customMap[id] ?? '';
        const value = enteredStr === '' ? (equalMap[id] ?? 0).toFixed(2) : enteredStr;

        return (
          <Stack key={id} direction="row" alignItems="center" spacing={2} sx={{ px: 1, py: 0.5 }}>
            <Avatar src={p.profilePicUrl ?? undefined} sx={{ width: 36, height: 36 }}>
              {p.username[0]}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">{displayName(p.username)}</Typography>

                {p.id === payerId && (
                  <Chip label="เป็นคนจ่าย" size="small" color="success" variant="outlined" />
                )}
              </Stack>
            </Box>

            <TextField
              size="small"
              value={value}
              onChange={(e) => handleChange(id, e.target.value)}
              sx={{ width: 90 }}
              inputProps={{ style: { textAlign: 'right' } }}
            />
          </Stack>
        );
      })}

      {/* total summary */}
      <Box sx={{ pt: 1, textAlign: 'right' }}>
        <Typography variant="body2">
          จำนวนเงินรวม {totalAmount.toFixed(0)} / {totalEntered.toFixed(0)}
        </Typography>

        {diff !== 0 && (
          <Typography variant="caption" color="error">
            จำนวนเงินยังไม่ครบ ขาดอีก {Math.abs(diff).toFixed(0)}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

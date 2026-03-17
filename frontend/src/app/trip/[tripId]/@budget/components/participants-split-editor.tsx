'use client';

import React from 'react';
import { Stack, Avatar, Typography, TextField, Box, Chip } from '@mui/material';
import { PublicUserInfo } from '@/api/users/type';
import { useTranslation } from 'react-i18next';
import { useI18nSelector } from '@/store/selectors';
import { computeEqualSplitAmounts } from '../utils/split-utils';
import { formatCurrency } from '../utils/format-number';

type Props = {
  totalAmount: number;
  participants: PublicUserInfo[];
  payerId: number;
  onChange: (splits: Record<number, number>) => void;
  initialSplits?: Record<number, number>;
  initialTotalAmount?: number;
  disabled?: boolean;
  error?: string | null;
  autoEqualizeOnTotalChange?: boolean;
};

export const ParticipantsSplitEditor: React.FC<Props> = ({
  totalAmount,
  participants,
  payerId,
  onChange,
  initialSplits,
  initialTotalAmount,
  disabled = false,
  autoEqualizeOnTotalChange = false,
}) => {
  const { t } = useTranslation('trip_overview');
  const { locale } = useI18nSelector();

  const ids = React.useMemo(() => participants.map((p) => p.id), [participants]);

  const equalMap = React.useMemo(
    () => computeEqualSplitAmounts(totalAmount, ids),
    [totalAmount, ids]
  );

  const [customMap, setCustomMap] = React.useState<Record<number, string>>({});

  const lastEmittedRef = React.useRef<string>('');

  const prevTotalAmountRef = React.useRef<number | null>(null);
  const didInitFromInitialTotalRef = React.useRef(false);

  React.useEffect(() => {
    if (!autoEqualizeOnTotalChange) return;

    const isInitialTotal =
      initialTotalAmount != null &&
      Math.round(totalAmount * 100) === Math.round(initialTotalAmount * 100);
    if (!didInitFromInitialTotalRef.current && isInitialTotal) {
      prevTotalAmountRef.current = totalAmount;
      didInitFromInitialTotalRef.current = true;
      return;
    }

    if (prevTotalAmountRef.current == null) {
      prevTotalAmountRef.current = totalAmount;
      return;
    }

    if (prevTotalAmountRef.current === totalAmount) return;
    prevTotalAmountRef.current = totalAmount;

    setCustomMap(() => {
      const next: Record<number, string> = {};
      for (const id of ids) next[id] = '';
      return next;
    });
    lastEmittedRef.current = '';
  }, [autoEqualizeOnTotalChange, ids, initialTotalAmount, totalAmount]);

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
      for (const id of ids) {
        const init = initialSplits?.[id];
        next[id] = init != null ? Number(init).toFixed(2) : (prev[id] ?? '');
      }
      return next;
    });
  }, [ids, initialSplits]);

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
          {t('budget.splitEditor.empty')}
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
          <Stack key={id} direction="row" alignItems="center" spacing={2} sx={{ px: 1, py: 1 }}>
            <Avatar
              src={p.profilePicUrl ?? undefined}
              sx={{ width: 36, height: 36, flexShrink: 0 }}
            >
              {p.username[0]}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  columnGap: 1,
                  rowGap: 0.5,
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    minWidth: 0,
                    flex: '1 1 auto',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayName(p.username)}
                </Typography>

                {p.id === payerId && (
                  <Chip
                    label={t('budget.splitEditor.payerChip')}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ flexShrink: 0 }}
                  />
                )}
              </Box>
            </Box>

            <TextField
              size="small"
              value={value}
              onChange={(e) => handleChange(id, e.target.value)}
              sx={{ width: 120, flexShrink: 0 }}
              inputProps={{ style: { textAlign: 'right' } }}
              disabled={disabled}
            />
          </Stack>
        );
      })}

      {/* total summary */}
      <Box sx={{ pt: 1, textAlign: 'right' }}>
        <Typography variant="body2">
          {t('budget.splitEditor.totalSummary', {
            total: formatCurrency(totalAmount, locale),
            entered: formatCurrency(totalEntered, locale),
          })}
        </Typography>

        {diff !== 0 && (
          <Typography variant="caption" color="error">
            {t(diff > 0 ? 'budget.splitEditor.diffUnder' : 'budget.splitEditor.diffOver', {
              amount: formatCurrency(Math.abs(diff), locale),
            })}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

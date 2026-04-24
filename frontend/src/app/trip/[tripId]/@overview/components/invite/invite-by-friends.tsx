'use client';

import { Button } from '@/components/ui/button';
import { Checkbox, Box, Typography, Avatar, TextField, InputAdornment } from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import { Navigation, Search } from 'lucide-react';
import { TruncatedTooltip } from '@/components/atoms';
import { tokens } from '@/providers/theme/design-tokens';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

import { useGetFriends } from '../../hooks/invite/use-get-friends';
import { useInviteTrip } from '../../hooks/invite/use-invite-trip';
import { useGetTripmates } from '@/app/trip/[tripId]/@overview/hooks/invite/use-get-tripmates';
import { useTranslation } from 'react-i18next';

export default function InviteByFriends({ tripId }: { tripId: number }) {
  const { t } = useTranslation('trip_overview');
  const { data } = useGetFriends();
  const { data: tripmates, refetch: refetchTripmates } = useGetTripmates(tripId);
  const { mutate, isPending } = useInviteTrip(tripId);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selected, setSelected] = useState<number[]>([]);

  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    setSearchKeyword('');
    setSelected([]);
    refetchTripmates();
  }, [refetchTripmates]);

  const statusMap = useMemo(() => {
    if (!tripmates) return new Map<number, 'JOINED' | 'PENDING'>();

    const map = new Map<number, 'JOINED' | 'PENDING'>();

    tripmates.joined.forEach((t) => {
      map.set(t.user.id, 'JOINED');
    });

    tripmates.pending.forEach((t) => {
      map.set(t.user.id, 'PENDING');
    });

    return map;
  }, [tripmates]);

  const filteredFriends = useMemo(() => {
    if (!data) return [];

    const lower = searchKeyword.toLowerCase();

    return data.filter((f) => {
      const status = statusMap.get(f.id);

      if (status === 'JOINED' || status === 'PENDING') return false;

      if (!searchKeyword.trim()) return true;

      return f.username?.toLowerCase().includes(lower) || f.email?.toLowerCase().includes(lower);
    });
  }, [data, searchKeyword, statusMap]);

  const toggle = (id: number, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  const hasFriends = data && data.length > 0;

  const handleInvite = () => {
    mutate(
      { receiverIds: selected },
      {
        onSuccess: () => {
          showSuccess(t('inviteDialog.byFriends.inviteSuccess'));
          setSelected([]);
        },
        onError: (err) => {
          console.error('Invite trip failed:', err);
          showError(t('inviteDialog.byFriends.inviteFailed'));
        },
      }
    );
  };

  const handleCardClick = (id: number) => {
    const isSelected = selected.includes(id);
    toggle(id, !isSelected);
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={1.5}>
        {/* ===== Search Box ===== */}
        <TextField
          fullWidth
          placeholder={t('inviteDialog.byFriends.searchPlaceholder')}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                borderRadius: 2,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
          }}
        />

        {/* ===== Friend list ===== */}
        {hasFriends ? (
          filteredFriends.length > 0 ? (
            filteredFriends.map((f) => (
              <Box
                key={f.id}
                display="flex"
                alignItems="center"
                gap={2}
                borderRadius={3}
                p={2}
                onClick={() => handleCardClick(f.id)}
                sx={{
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                }}
              >
                <Checkbox
                  checked={selected.includes(f.id)}
                  onChange={(e, checked) => toggle(f.id, checked)}
                  onClick={(e) => e.stopPropagation()}
                  disableRipple
                />

                <Avatar src={f.profilePicUrl} alt={f.username} sx={{ width: 40, height: 40 }}>
                  {f.username?.[0]?.toUpperCase()}
                </Avatar>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flex={1}
                  minWidth={0}
                >
                  <Box flex={1} minWidth={0}>
                    <Typography
                      fontWeight={500}
                      noWrap
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <TruncatedTooltip text={f.username} />
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <TruncatedTooltip text={f.email} />
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))
          ) : (
            <Typography textAlign="center" color="text.secondary" sx={{ py: 6 }}>
              {t('inviteDialog.byFriends.emptySearch')}
            </Typography>
          )
        ) : (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 6 }}>
            {t('inviteDialog.byFriends.emptyFriends')}
          </Typography>
        )}

        {/* ===== Bottom action ===== */}
        <Box display="flex" justifyContent="space-between" alignItems="center" pt={2}>
          <Typography fontWeight={500} sx={{ color: tokens.color.primary }}>
            {t('inviteDialog.byFriends.selectedCount', { count: selected.length })}
          </Typography>

          <Button
            disabled={!selected.length || isPending}
            onClick={handleInvite}
            className="flex items-center justify-center gap-2 rounded-full px-12 py-4 text-white shadow-md disabled:opacity-50"
          >
            <Navigation size={18} />
            {t('inviteDialog.byFriends.sendInvite')}
          </Button>
        </Box>
      </Box>

    </>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Checkbox, Box, Typography, Avatar, TextField, InputAdornment } from '@mui/material';
import { useState } from 'react';
import { Navigation } from 'lucide-react';
import { TruncatedTooltip } from '@/components/atoms';
import { useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { tokens } from '@/providers/theme/design-tokens';

import { AppSnackbar } from '@/components/common/snackbar/snackbar';

import { useGetFriends } from '../../hooks/invite/use-get-friends';
import { useInviteTrip } from '../../hooks/invite/use-invite-trip';
import { useGetTripmates } from '@/app/trip/[tripId]/@overview/hooks/invite/use-get-tripmates';

export default function InviteByFriends({ tripId }: { tripId: number }) {
  const { data } = useGetFriends();
  const { data: tripmates, refetch: refetchTripmates } = useGetTripmates(tripId);
  const { mutate, isPending } = useInviteTrip(tripId);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    setSearchKeyword('');
    setSelected([]);
    refetchTripmates();
  }, [refetchTripmates]);

  const filteredFriends = useMemo(() => {
    if (!data) return [];
    if (!searchKeyword.trim()) return data;
    const lower = searchKeyword.toLowerCase();
    return data.filter(
      (f) => f.username?.toLowerCase().includes(lower) || f.email?.toLowerCase().includes(lower)
    );
  }, [data, searchKeyword]);

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

  const toggle = (id: number, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  const hasFriends = data && data.length > 0;

  const handleInvite = () => {
    mutate(
      { receiverIds: selected },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: 'ส่งคำเชิญสำเร็จ',
            severity: 'success',
          });

          setSelected([]);
        },
        onError: (err) => {
          console.error('Invite trip failed:', err);

          setSnackbar({
            open: true,
            message: 'ไม่สามารถส่งคำเชิญได้',
            severity: 'error',
          });
        },
      }
    );
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={1.5}>
        {/* ===== Search Box ===== */}
        <TextField
          fullWidth
          placeholder="ค้นหาด้วยชื่อหรืออีเมล"
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

        <Box display="flex" gap={2} alignItems="center">
          {/* JOINED */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: 0.5,
                backgroundColor: tokens.color.primary,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              เข้าร่วมแล้ว
            </Typography>
          </Box>

          {/* PENDING */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: 0.5,
                backgroundColor: tokens.color.warning,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              กำลังถูกเชิญ
            </Typography>
          </Box>
        </Box>

        {/* ===== Friend list ===== */}
        {hasFriends ? (
          filteredFriends.length > 0 ? (
            filteredFriends.map((f) => {
              const status = statusMap.get(f.id);

              return (
                <Box
                  key={f.id}
                  position="relative"
                  display="flex"
                  alignItems="center"
                  gap={2}
                  borderRadius={3}
                  p={2}
                  sx={{ boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                >
                  <Checkbox
                    checked={selected.includes(f.id)}
                    onChange={(e, checked) => toggle(f.id, checked)}
                    disabled={status === 'JOINED' || status === 'PENDING'}
                    disableRipple
                    sx={{
                      '& .MuiSvgIcon-root': {
                        display: status === 'JOINED' || status === 'PENDING' ? 'none' : 'block',
                      },

                      width: 16,
                      height: 16,
                      borderRadius: 0.5,
                      p: 0.5,

                      backgroundColor:
                        status === 'JOINED'
                          ? tokens.color.primary
                          : status === 'PENDING'
                            ? tokens.color.warning
                            : 'transparent',

                      border:
                        status === 'JOINED' || status === 'PENDING' ? 'none' : '1px solid #ccc',
                    }}
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
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        <TruncatedTooltip text={f.username} />
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        <TruncatedTooltip text={f.email} />
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography textAlign="center" color="text.secondary" sx={{ py: 6 }}>
              ไม่พบผู้ใช้ที่คุณค้นหา
            </Typography>
          )
        ) : (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 6 }}>
            ยังไม่มีรายชื่อเพื่อน
          </Typography>
        )}

        {/* ===== Bottom action ===== */}
        <Box display="flex" justifyContent="space-between" alignItems="center" pt={2}>
          <Typography
            sx={{
              fontWeight: 500,
              color: tokens.color.primary,
            }}
          >
            {selected.length} เพื่อนที่เลือกแล้ว
          </Typography>

          <Button
            disabled={!selected.length || isPending}
            onClick={handleInvite}
            className="flex items-center justify-center gap-2 rounded-full px-12 py-4 text-white shadow-md disabled:opacity-50"
            style={{
              backgroundColor: tokens.color.primary,
            }}
          >
            <Navigation size={18} />
            ส่งคำเชิญ
          </Button>
        </Box>
      </Box>

      {/* ===== Snackbar ===== */}
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </>
  );
}

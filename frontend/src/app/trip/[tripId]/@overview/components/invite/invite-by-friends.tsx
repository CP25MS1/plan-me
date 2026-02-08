'use client';

import { Button } from '@/components/ui/button';
import { Checkbox, Box, Typography, Avatar } from '@mui/material';
import { useState } from 'react';
import { Navigation } from 'lucide-react';
import { TruncatedTooltip } from '@/components/atoms';

import { tokens } from '@/providers/theme/design-tokens';

import { AppSnackbar } from '@/components/common/snackbar/snackbar';

import { useGetFriends } from '../../hooks/invite/use-get-friends';
import { useInviteTrip } from '../../hooks/invite/use-invite-trip';

export default function InviteByFriends({ tripId }: { tripId: number }) {
  const { data } = useGetFriends();
  const { mutate, isPending } = useInviteTrip(tripId);

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
      <Box display="flex" flexDirection="column" gap={3}>
        {/* ===== Friend list ===== */}
        {hasFriends ? (
          data.map((f) => (
            <Box
              key={f.id}
              display="flex"
              alignItems="center"
              gap={2}
              borderRadius={3}
              p={2}
              sx={{
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              }}
            >
              <Checkbox
                checked={selected.includes(f.id)}
                onChange={(e, checked) => toggle(f.id, checked)}
              />
              <Avatar src={f.profilePicUrl} alt={f.username} sx={{ width: 40, height: 40 }}>
                {f.username?.[0]?.toUpperCase()}
              </Avatar>

              <Box sx={{ minWidth: 0, maxWidth: 200 }}>
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
          ))
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

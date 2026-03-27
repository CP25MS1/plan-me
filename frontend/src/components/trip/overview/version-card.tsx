'use client';

import { useState } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { Clock3, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { TruncatedTooltip } from '@/components/atoms';
import { useRouter } from 'next/navigation';
import { TripVersion } from '@/api/trips';
import ConfirmDialog from '@/components/common/dialog/confirm-dialog';
import SwipeReveal from '@/components/common/card/swipe-reveal';
import { tokens } from '@/providers/theme/design-tokens';

type VersionCardProps = {
  version: TripVersion;
  tripId: number;
  onDelete: (versionId: number) => Promise<void>;
  isOwner: boolean;
};

export const VersionCard = ({ version, onDelete, isOwner }: VersionCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(version.id);
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <SwipeReveal
        actionWidth={92}
        disabled={!isOwner || isDeleting}
        actionSx={{
          bgcolor: 'transparent',
          borderRadius: 2,
        }}
        cardSx={{
          borderRadius: 2,
          boxShadow: 'none',
          border: 'none',
          overflow: 'visible',
        }}
        actionNode={
          isOwner && (
            <Box
              onClick={() => setConfirmOpen(true)}
              sx={{
                width: '100%',
                my: 0.5,
                px: 1.5,
                py: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                color: tokens.color.contrastText,
                cursor: 'pointer',
                bgcolor: tokens.color.error,
              }}
            >
              <Trash2 size={16} />
              <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 600 }}>
                ลบ
              </Typography>
            </Box>
          )
        }
      >
        <Box
          sx={{
            width: 'calc(100% )',
            height: 80,
            mr: '-12px',
            px: 2,
            py: 1.75,
            bgcolor: tokens.color.background,
            borderRadius: 2,
            boxShadow: '0 10px 24px rgba(9, 9, 9, 0.08)',
            border: '1px solid rgba(9, 9, 9, 0.06)',
            cursor: 'pointer',
          }}
          onClick={() =>
            router.push(`/trip-version-view/${version.id}?tab=overview&tripId=${version.tripId}`)
          }
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Stack spacing={0.4} sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ maxWidth: '60%' }}>
                <TruncatedTooltip
                  text={version.versionName}
                  className="text-[17px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap min-w-0 block"
                />
              </Stack>

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                  <Clock3 size={13} color={tokens.color.textSecondary} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: tokens.color.textSecondary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {dayjs(version.createdAt).format('DD/MM/YYYY - HH:mm')}
                  </Typography>
                </Stack>
              </Stack>

              {version.isCurrent && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.4,
                    borderRadius: 2,
                    bgcolor: tokens.color.lightBackground,
                    color: tokens.color.primaryDark,
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 600 }}>
                    ใช้งานล่าสุด
                  </Typography>
                </Box>
              )}
            </Stack>

            {isDeleting ? (
              <CircularProgress size={18} sx={{ color: tokens.color.primary }} />
            ) : null}
          </Stack>
        </Box>
      </SwipeReveal>
      {isOwner && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => {
            if (!isDeleting) {
              setConfirmOpen(false);
            }
          }}
          onConfirm={() => void handleDelete()}
          confirmLoading={isDeleting}
          color="error"
          content={
            <Box sx={{ pr: 4 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                ยืนยันการลบบันทึกเวอร์ชัน?
              </Typography>
              <Typography sx={{ color: tokens.color.textSecondary }}>
                คุณแน่ใจหรือไม่ที่จะลบบันทึกเวอร์ชัน <strong>{version.versionName}</strong> ?
              </Typography>
            </Box>
          }
        />
      )}
    </>
  );
};

export default VersionCard;

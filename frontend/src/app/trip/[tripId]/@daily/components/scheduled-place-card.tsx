'use client';

import React, { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Route } from 'next';
import Image from 'next/image';
import { Box, Button, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { Map, Menu, Star, Trash2 as Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

import { SwipeReveal } from '@/components/common/card';
import { ScheduledPlace } from '@/api/trips';
import { tokens } from '@/providers/theme/design-tokens';
import { PLACEHOLDER_IMAGE } from '@/constants/link';
import { Locale } from '@/store/i18n-slice';
import { ConfirmDialog } from '@/components/common/dialog';
import {
  useRemoveScheduledPlace,
  useUpdateScheduledPlace,
} from '@/app/trip/[tripId]/@daily/hooks/use-scheduled-place-mutation';
import PlaceDetailsDialog from '@/app/trip/[tripId]/components/place-details/place-details-dialog';
import { useOpeningDialogContext } from '@/app/trip/[tripId]/@daily/context/opening-dialog-context';
import { useTripLockLease } from '@/app/trip/[tripId]/realtime/hooks/use-trip-lock-lease';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';

type ScheduledPlaceCardProps = {
  planId: number;
  scheduledPlace: ScheduledPlace;
  locale: Locale;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  isDragging: boolean;
  readOnly?: boolean;
  mapBasePath?: string;
  disabled?: boolean;
  lockOwnerName?: string;
};

const ScheduledPlaceCard = ({
  planId,
  scheduledPlace,
  locale,
  dragHandleProps,
  isDragging,
  readOnly = false,
  mapBasePath,
  disabled = false,
  lockOwnerName,
}: ScheduledPlaceCardProps) => {
  const router = useRouter();
  const { t } = useTranslation('trip_overview');
  const params = useParams();
  const tripIdParam = (params as { tripId?: string }).tripId;
  const tripId = Number(tripIdParam);
  const { acquireLease } = useTripLockLease(tripId);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string } | null>(null);

  const lockLabel = disabled ? `Locked by ${lockOwnerName ?? 'someone'}` : '';
  const deleteReleaseRef = useRef<null | (() => Promise<void>)>(null);
  const notesReleaseRef = useRef<null | (() => Promise<void>)>(null);
  const resolvedBasePath =
    mapBasePath ?? (Number.isFinite(tripId) ? `/trip/${tripId}` : '');
  const place = scheduledPlace.ggmp;
  const { name, desc } =
    locale === 'en'
      ? { name: place.enName, desc: place.enDescription }
      : { name: place.thName, desc: place.thDescription };

  const { isDetailsDialogOpened, openDetailsDialog, closeDetailsDialog, selectedGgmpId } =
    useOpeningDialogContext();
  const { mutate: update } = useUpdateScheduledPlace(tripId);
  const handleUpdateNotes = async (notes: string) => {
    if (readOnly || disabled) return;
    await new Promise<void>((resolve, reject) => {
      update(
        {
          placeId: scheduledPlace.id,
          payload: {
            planId,
            notes,
            order: scheduledPlace.order,
          },
        },
        {
          onSuccess: () => resolve(),
          onError: (e) => reject(e),
        }
      );
    });
  };

  const [isRemoveDialogOpened, setIsRemoveDialogOpened] = useState(false);
  const { mutate: remove, isPending: isRemoving } = useRemoveScheduledPlace(tripId);

  const openDeleteDialogButton = (
    <IconButton
      aria-label="delete place"
      onClick={() => {
        if (disabled) {
          setSnackbar({ open: true, message: lockLabel });
          return;
        }

        void (async () => {
          const lease = await acquireLease({
            resourceType: 'SCHEDULED_PLACE',
            resourceId: scheduledPlace.id,
            purpose: 'DELETE',
          });

          if (lease.status === 'conflict') {
            setSnackbar({
              open: true,
              message: `Locked by ${lease.lock.owner.username}`,
            });
            return;
          }

          deleteReleaseRef.current = lease.release;
          setIsRemoveDialogOpened(true);
        })();
      }}
      size="large"
      sx={{ color: 'common.white' }}
    >
      <Trash size={20} />
    </IconButton>
  );

  const confirmRemove = () => {
    remove(
      scheduledPlace.id,
      {
        onSuccess: () => {
          setIsRemoveDialogOpened(false);
          void deleteReleaseRef.current?.();
          deleteReleaseRef.current = null;
        },
        onError: () => {
          setIsRemoveDialogOpened(false);
          void deleteReleaseRef.current?.();
          deleteReleaseRef.current = null;
        },
      }
    );
  };

  const cardContent = (
    <Box
      onClick={() => {
        openDetailsDialog(scheduledPlace.ggmp.ggmpId);
      }}
      sx={{
        display: 'flex',
        gap: 1,
        flex: 1,
        minWidth: 0,
        width: '100%',
        cursor: 'pointer',
      }}
    >
      {!readOnly && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            opacity: disabled ? 0.4 : 1,
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          {...(dragHandleProps ?? {})}
        >
          <Menu size={21} color={tokens.color.textSecondary} />
        </Box>
      )}

      <Box
        sx={{
          width: 75,
          height: 65,
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
          my: 'auto',
        }}
      >
        <Image
          src={place.defaultPicUrl ?? PLACEHOLDER_IMAGE}
          alt={name || 'place image'}
          fill
          style={{ objectFit: 'cover' }}
          sizes="75px"
          unoptimized
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', pr: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              flex: 1,
              minWidth: 0,

              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',

              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
          >
            {name}
          </Typography>

          {resolvedBasePath ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `${resolvedBasePath}?tab=map&selectedPlaceId=${scheduledPlace.id}` as Route
                );
              }}
              variant="contained"
              size="small"
              startIcon={<Map size={14} />}
              sx={{
                flexShrink: 0,
                height: 24,
                fontSize: 12,
                whiteSpace: 'nowrap',
                borderRadius: '0.25rem',
              }}
            >
              เปิดแผนที่
            </Button>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
          <Star size={14} fill={tokens.color.warning} strokeWidth={0} />
          <Typography variant="subtitle2" color="warning" sx={{ ml: 0.5 }}>
            {Number(place.rating).toFixed(1)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <Typography variant="caption" align="left" sx={{ display: 'block' }}>
            {desc}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {readOnly ? (
        <Paper
          elevation={1}
          sx={{
            overflow: 'hidden',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            py: 2,
            pl: 2,
            pr: 0,
            ...(disabled ? { border: '2px solid', borderColor: 'warning.main' } : {}),
          }}
        >
          {cardContent}
        </Paper>
      ) : (
        <Tooltip title={disabled ? lockLabel : ''} arrow disableHoverListener={!disabled}>
          <Box>
            <SwipeReveal
              actionNode={openDeleteDialogButton}
              actionWidth={80}
              actionSide="right"
              actionSx={{ bgcolor: 'error.main' }}
              cardSx={{
                py: 2,
                pl: 2,
                pr: 0,
                ...(disabled ? { border: '2px solid', borderColor: 'warning.main' } : {}),
              }}
              disabled={disabled}
            >
              {cardContent}
            </SwipeReveal>
          </Box>
        </Tooltip>
      )}

      {selectedGgmpId === place.ggmpId && (
        <PlaceDetailsDialog
          isOpened={isDetailsDialogOpened}
          onClose={() => {
            closeDetailsDialog();
            void notesReleaseRef.current?.();
            notesReleaseRef.current = null;
          }}
          ggmpId={place.ggmpId}
          notableInfo={
            disabled ? (
              <Typography variant="caption" sx={{ display: 'block', color: 'warning.main' }}>
                {lockLabel} — view only
              </Typography>
            ) : null
          }
          notableProps={
            readOnly
              ? undefined
              : {
                  notes: scheduledPlace.notes,
                  onSave: handleUpdateNotes,
                  onBeginEdit: async () => {
                    if (disabled) {
                      setSnackbar({ open: true, message: lockLabel });
                      return false;
                    }
                    const lease = await acquireLease({
                      resourceType: 'SCHEDULED_PLACE',
                      resourceId: scheduledPlace.id,
                      purpose: 'EDIT',
                    });
                    if (lease.status === 'conflict') {
                      setSnackbar({
                        open: true,
                        message: `Locked by ${lease.lock.owner.username}`,
                      });
                      return false;
                    }
                    notesReleaseRef.current = lease.release;
                    return true;
                  },
                  onEndEdit: async () => {
                    await notesReleaseRef.current?.();
                    notesReleaseRef.current = null;
                  },
                }
          }
        />
      )}

      {!readOnly && (
        <ConfirmDialog
          open={isRemoveDialogOpened}
          onClose={() => {
            setIsRemoveDialogOpened(false);
            void deleteReleaseRef.current?.();
            deleteReleaseRef.current = null;
          }}
          onConfirm={confirmRemove}
          content={<Typography>{t('sectionCard.dailyPlan.remove.confirm_message')}</Typography>}
          confirmLabel={t('sectionCard.dailyPlan.remove.confirm_label')}
          confirmLoading={isRemoving}
          color="error"
        />
      )}

      <AppSnackbar
        open={Boolean(snackbar?.open)}
        message={snackbar?.message ?? ''}
        severity="warning"
        onClose={() => setSnackbar(null)}
      />
    </>
  );
};

export default ScheduledPlaceCard;

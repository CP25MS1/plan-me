'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddItemButton from '@/components/trip/overview/add-item-button';
import SectionCard from '@/components/trip/overview/section-card';
import SectionCardNoClose from '@/components/trip/overview/section-card-no-close';

import { Add, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';

import { Trash2, UserPen, AlertCircle } from 'lucide-react';

import { TripChecklistDto } from '@/api/checklist/type';

import { useGetTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-get-trip-checklist';
import { useGetRecommendedChecklistItems } from '@/app/trip/[tripId]/@checklist/hooks/use-get-recommended-checklist-items';
import { useCreateTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-create-trip-checklist';
import { useDeleteTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-delete-trip-checklist';
import { useUpdateTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-update-trip-checklist';

import { useAppSelector } from '@/store';
import { useGetTripMembers } from '@/app/hooks/use-get-trip-members';
import TripmateModal from '@/app/trip/[tripId]/@checklist/components/tripmate-modal';
import { tokens } from '@/providers/theme/design-tokens';
import { useI18nSelector } from '@/store/selectors';
import useTripAddPresenceEffect from '@/app/trip/[tripId]/realtime/hooks/use-trip-add-presence';
import SectionPresenceGroup from '@/app/trip/[tripId]/realtime/components/section-presence-group';
import { useTripSectionUsers, useTripRealtimeLocksMap } from '@/store/selectors';
import { useTripLockLease } from '@/app/trip/[tripId]/realtime/hooks/use-trip-lock-lease';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';

export default function ChecklistPage() {
  const params = useParams();
  const tripId = Number(params.tripId);
  const { t } = useTranslation('trip_checklist');
  const { locale } = useI18nSelector();

  const me = useAppSelector((s) => s.profile.currentUser);
  const tripmates = useGetTripMembers(tripId);
  const completedLockedTooltip = t('hints.completedLocked');
  
  const checklistUsers = useTripSectionUsers(tripId, 'CHECKLIST');
  const locksMap = useTripRealtimeLocksMap(tripId);
  const { acquireLease } = useTripLockLease(tripId);
  const checklistEditReleaseRef = React.useRef<null | (() => Promise<void>)>(null);

  /* ===== checklist hooks ===== */
  const { data: items = [], isLoading } = useGetTripChecklist(tripId);
  const { data: recommendedItems = [], isLoading: isRecommendedLoading } =
    useGetRecommendedChecklistItems(tripId);

  const createMut = useCreateTripChecklist(tripId);
  const updateMut = useUpdateTripChecklist(tripId);
  const deleteMut = useDeleteTripChecklist(tripId);

  /* ===== local state ===== */
  const [openSection] = useState(true);

  const [assignTarget, setAssignTarget] = useState<TripChecklistDto | null>(null);
  const [assignAnchor, setAssignAnchor] = useState<HTMLElement | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [addingName, setAddingName] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const [duplicateWarningFor, setDuplicateWarningFor] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity?: 'error' | 'warning' | 'info' | 'success' } | null>(null);

  useTripAddPresenceEffect({
    tripId,
    enabled: isAdding || editingId !== null,
    section: 'CHECKLIST',
  });

  if (!tripId || Number.isNaN(tripId)) return null;

  const existingNames = new Set(items.map((i) => i.name.trim().toLowerCase()));

  const handleInlineAdd = () => {
    const name = addingName.trim();

    if (!name) {
      setIsAdding(false);
      setAddingName('');
      setDuplicateWarningFor(null);
      return;
    }

    if (existingNames.has(name.toLowerCase()) && duplicateWarningFor !== name) {
      setDuplicateWarningFor(name);
      return;
    }

    createMut.mutate(name, {
      onSuccess: () => {
        setAddingName('');
        setIsAdding(false);
        setDuplicateWarningFor(null);
      },
    });
  };

  const handleInlineUpdate = (id: number) => {
    const currentItem = items.find((x) => x.id === id);
    if (currentItem?.completed) {
      setEditingId(null);
      setDuplicateWarningFor(null);
      void checklistEditReleaseRef.current?.();
      checklistEditReleaseRef.current = null;
      return;
    }

    const name = editingName.trim();

    if (!currentItem || !name || name.toLowerCase() === currentItem.name.trim().toLowerCase()) {
      setEditingId(null);
      setDuplicateWarningFor(null);
      void checklistEditReleaseRef.current?.();
      checklistEditReleaseRef.current = null;
      return;
    }

    if (existingNames.has(name.toLowerCase()) && duplicateWarningFor !== name) {
      setDuplicateWarningFor(name);
      return;
    }

    updateMut.mutate({
      itemId: id,
      payload: { name },
    });

    setEditingId(null);
    setDuplicateWarningFor(null);
    void checklistEditReleaseRef.current?.();
    checklistEditReleaseRef.current = null;
  };

  const handleToggleComplete = (item: TripChecklistDto) => {
    if (item.assignee && (!me || me.id !== item.assignee.id)) return;

    updateMut.mutate({
      itemId: item.id,
      payload: { completed: !item.completed },
    });
  };

  const handleAssign = (item: TripChecklistDto, assigneeId: number | null) => {
    const currentItem = items.find((x) => x.id === item.id);
    if (currentItem?.completed) {
      setAssignAnchor(null);
      setAssignTarget(null);
      return;
    }

    updateMut.mutate({
      itemId: item.id,
      payload: { assigneeId },
    });

    setAssignAnchor(null);
    setAssignTarget(null);
  };

  const handleDelete = (id: number) => {
    const currentItem = items.find((x) => x.id === id);
    if (currentItem?.completed) {
      return;
    }

    void (async () => {
      const lease = await acquireLease({
        resourceType: 'CHECKLIST_ITEM',
        resourceId: id,
        purpose: 'DELETE',
      });
      if (lease.status === 'conflict') {
        setSnackbar({
          open: true,
          message: `Locked by ${lease.lock.owner.username}`,
          severity: 'warning',
        });
        return;
      }
      deleteMut.mutate(id, {
        onSettled: () => void lease.release(),
      });
    })();
  };

  /* ===== render ===== */

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <SectionCard
        title={t('recommended.title')}
        defaultOpen={false}
        asEmpty={!isRecommendedLoading && recommendedItems.length === 0}
        titleEndAdornment={
          !isRecommendedLoading && recommendedItems.length > 0 ? (
            <Typography variant="caption" sx={{ color: tokens.color.textSecondary }}>
              ({recommendedItems.length})
            </Typography>
          ) : null
        }
      >
        {isRecommendedLoading ? (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rounded" width={96} height={32} />
            ))}
          </Box>
        ) : recommendedItems.length === 0 ? (
          <Typography sx={{ color: tokens.color.textSecondary, textAlign: 'left' }}>
            {t('recommended.empty')}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {recommendedItems.map((rec) => {
              const name = locale === 'th' ? rec.TH : rec.EN || rec.TH;
              const isAdded = existingNames.has(name.trim().toLowerCase());

              return (
                <Chip
                  key={rec.id}
                  label={name}
                  icon={isAdded ? undefined : <Add fontSize="small" />}
                  clickable={!isAdded}
                  disabled={isAdded || createMut.isPending}
                  onClick={() => {
                    if (isAdded) return;
                    createMut.mutate(name);
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    '& .MuiChip-label': {
                      textAlign: 'left',
                    },
                    opacity: isAdded ? 0.6 : 1,
                  }}
                  variant={isAdded ? 'outlined' : 'filled'}
                />
              );
            })}
          </Box>
        )}
      </SectionCard>

      {openSection && (
        <SectionCardNoClose
          title={t('title')}
          asEmpty={!isLoading && items.length === 0 && !isAdding}
          titleAdornment={
            <SectionPresenceGroup users={checklistUsers} dialogTitle={`กำลังใช้งาน: ${t('title')}`} />
          }
        >
          {/* ===== List ===== */}
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 3,
                  p: 2,
                  mb: 2,
                }}
              >
                <Stack direction="row" justifyContent="space-between">
                  <Skeleton width="40%" />
                  <Skeleton variant="circular" width={32} height={32} />
                </Stack>
              </Box>
            ))
          ) : items.length === 0 ? (
            <Box
              sx={{
                borderRadius: 4,
                textAlign: 'center',
                bgcolor: '#fff',
              }}
            >
              {isAdding ? (
                <Box
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: 3,
                    p: 2,
                    boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    autoFocus
                    placeholder={t('fields.namePlaceholder')}
                    value={addingName}
                    onChange={(e) => setAddingName(e.target.value)}
                    onBlur={() => {
                      if (!duplicateWarningFor) handleInlineAdd();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleInlineAdd();
                      }
                    }}
                    error={duplicateWarningFor === addingName.trim() && addingName.trim() !== ''}
                    helperText={
                      duplicateWarningFor === addingName.trim() && addingName.trim() !== ''
                        ? t('hints.duplicateName')
                        : ''
                    }
                    inputProps={{ maxLength: 30 }}
                    InputProps={{
                      endAdornment: (
                        <Typography
                          variant="caption"
                          sx={{ ml: 1, color: tokens.color.textSecondary }}
                        >
                          {addingName.length}/30
                        </Typography>
                      ),
                    }}
                  />
                </Box>
              ) : (
                <AddItemButton label={t('actions.add')} onClick={() => setIsAdding(true)} />
              )}
            </Box>
          ) : (
            [...items]
              .sort((a, b) => {
                if (a.completed !== b.completed) {
                  return a.completed ? 1 : -1;
                }

                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              })
              .map((it) => {
                const canToggle = !it.assignee || (me && it.assignee && me.id === it.assignee.id);
                const isLocked = it.completed === true;

                const lock = locksMap[`CHECKLIST_ITEM:${it.id}`];
                const lockedByOther = Boolean(lock) && Boolean(me) && lock!.owner.id !== me?.id;
                
                const isHighlighted =
                  duplicateWarningFor &&
                  it.name.trim().toLowerCase() === duplicateWarningFor.trim().toLowerCase()
                    ? true
                    : false;

                return (
                  <Box key={it.id} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: '#fff',
                        borderRadius: 3,
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
                        border: isHighlighted
                          ? `2px solid ${tokens.color.warning}`
                          : lockedByOther 
                          ? `2px solid ${tokens.color.warning}`
                          : '2px solid transparent',
                      }}
                    >
                      {/* Left */}
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        <IconButton onClick={() => handleToggleComplete(it)} disabled={!canToggle}>
                          {it.completed ? <CheckBox /> : <CheckBoxOutlineBlank />}
                        </IconButton>
  
                          {editingId === it.id ? (
                            <Box sx={{ flex: 1 }}>
                              <TextField
                                size="small"
                                autoFocus
                                fullWidth
                                value={editingName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingName(val);
                                  const trimmed = val.trim().toLowerCase();
                                  if (trimmed && items.some(xi => xi.id !== it.id && xi.name.trim().toLowerCase() === trimmed)) {
                                    setDuplicateWarningFor(val.trim());
                                  } else {
                                    setDuplicateWarningFor(null);
                                  }
                                }}
                                onBlur={() => {
                                  handleInlineUpdate(it.id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleInlineUpdate(it.id);
                                  }
                                }}
                                inputProps={{ maxLength: 30 }}
                                InputProps={{
                                  endAdornment: (
                                    <Typography
                                      variant="caption"
                                      sx={{ ml: 1, color: tokens.color.textSecondary }}
                                    >
                                      {editingName.length}/30
                                    </Typography>
                                  ),
                                  sx: {
                                    '& fieldset': {
                                      borderColor: duplicateWarningFor === editingName.trim() && editingName.trim() !== '' ? `${tokens.color.warning} !important` : undefined,
                                    },
                                  }
                                }}
                              />
                              {duplicateWarningFor === editingName.trim() && editingName.trim() !== '' && (
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                  <AlertCircle size={14} color={tokens.color.warning} />
                                  <Typography variant="caption" sx={{ color: tokens.color.warning, fontWeight: 500 }}>
                                    {t('hints.duplicateName')}
                                  </Typography>
                                </Stack>
                              )}
                            </Box>
                          ) : (
                            <Typography
                              sx={{
                                textDecoration: it.completed ? 'line-through' : 'none',
                                cursor: isLocked || lockedByOther ? 'default' : 'pointer',
                                flex: 1,
                                textAlign: 'left',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                                lineHeight: 1.5,
                              }}
                              onClick={() => {
                                if (isLocked || lockedByOther) return;
                                void (async () => {
                                  const lease = await acquireLease({
                                    resourceType: 'CHECKLIST_ITEM',
                                    resourceId: it.id,
                                    purpose: 'EDIT',
                                  });
                                  if (lease.status === 'conflict') {
                                    setSnackbar({
                                      open: true,
                                      message: `Locked by ${lease.lock.owner.username}`,
                                      severity: 'warning',
                                    });
                                    return;
                                  }
                                  checklistEditReleaseRef.current = lease.release;
                                  setEditingId(it.id);
                                  setEditingName(it.name);
                                })();
                              }}
                            >
                              {it.name}
                            </Typography>
                          )}
                      </Stack>
  
                      {/* Right */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        {/* ===== Assign Button ===== */}
                        {it.assignee ? (
                          <Box
                            sx={{
                              position: 'relative',
  
                              '& .remove-btn': {
                                opacity: 0,
                                pointerEvents: 'none',
                                transition: '0.15s',
                              },
  
                              '&:hover .remove-btn': {
                                opacity: 1,
                                pointerEvents: 'auto',
                              },
                            }}
                          >
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                              badgeContent={
                                <IconButton
                                  size="small"
                                  className="remove-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssign(it, null);
                                  }}
                                  disabled={isLocked || lockedByOther}
                                  sx={{
                                    bgcolor: '#fff',
                                    boxShadow: 1,
                                    width: 18,
                                    height: 18,
                                    '&:hover': { bgcolor: '#eee' },
                                  }}
                                >
                                  <CloseIcon sx={{ fontSize: 12 }} />
                                </IconButton>
                              }
                            >
                              <Tooltip
                                title={
                                  isLocked ? completedLockedTooltip : t('tooltips.changeAssignee')
                                }
                              >
                                <Avatar
                                  src={it.assignee.profilePicUrl}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    cursor: isLocked || lockedByOther ? 'not-allowed' : 'pointer',
                                    opacity: isLocked || lockedByOther ? 0.7 : 1,
                                  }}
                                  onClick={(e) => {
                                    if (isLocked || lockedByOther) return;
  
                                    setAssignTarget(it);
                                    setAssignAnchor(e.currentTarget);
                                  }}
                                />
                              </Tooltip>
                            </Badge>
                          </Box>
                        ) : (
                          <Tooltip title={isLocked ? completedLockedTooltip : t('tooltips.assign')}>
                            <span>
                              <IconButton
                                disabled={isLocked || lockedByOther}
                                onClick={(e) => {
                                  setAssignTarget(it);
                                  setAssignAnchor(e.currentTarget);
                                }}
                              >
                                <UserPen size={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
  
                        {/* Delete */}
                        <Tooltip title={isLocked ? completedLockedTooltip : t('tooltips.delete')}>
                          <span>
                            <IconButton disabled={isLocked || lockedByOther} onClick={() => handleDelete(it.id)}>
                              <Trash2 size={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Box>
                );
              })
          )}

          {/* ===== Add Section ===== */}
          {!isLoading && items.length > 0 && (
            <Box mt={2}>
              {isAdding ? (
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 3,
                      p: 2,
                      boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
                      border: duplicateWarningFor === addingName.trim() && addingName.trim() !== ''
                        ? `2px solid ${tokens.color.warning}`
                        : '2px solid transparent',
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      autoFocus
                      placeholder={t('fields.namePlaceholder')}
                      value={addingName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddingName(val);
                        const trimmed = val.trim().toLowerCase();
                        if (trimmed && items.some(it => it.name.trim().toLowerCase() === trimmed)) {
                          setDuplicateWarningFor(val.trim());
                        } else {
                          setDuplicateWarningFor(null);
                        }
                      }}
                      onBlur={() => {
                        handleInlineAdd();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleInlineAdd();
                        }
                      }}
                      inputProps={{ maxLength: 30 }}
                      InputProps={{
                        endAdornment: (
                          <Typography
                            variant="caption"
                            sx={{ ml: 1, color: tokens.color.textSecondary }}
                          >
                            {addingName.length}/30
                          </Typography>
                        ),
                        sx: {
                          '& fieldset': {
                            borderColor: duplicateWarningFor === addingName.trim() && addingName.trim() !== '' ? `${tokens.color.warning} !important` : undefined,
                          },
                        }
                      }}
                    />
                    {duplicateWarningFor === addingName.trim() && addingName.trim() !== '' && (
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        <AlertCircle size={14} color={tokens.color.warning} />
                        <Typography variant="caption" sx={{ color: tokens.color.warning, fontWeight: 500 }}>
                          {t('hints.duplicateName')}
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box textAlign="center">
                  <Button startIcon={<Add />} variant="contained" onClick={() => setIsAdding(true)}>
                    {t('actions.add')}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </SectionCardNoClose>
      )}

      {/* ===== Assign Dialog ===== */}
      <TripmateModal
        anchorEl={assignAnchor}
        onClose={() => {
          setAssignAnchor(null);
          setAssignTarget(null);
        }}
        tripmates={tripmates}
        onAssign={(userId) => {
          if (assignTarget) handleAssign(assignTarget, userId);
        }}
      />
      
      <AppSnackbar
        open={Boolean(snackbar?.open)}
        message={snackbar?.message ?? ''}
        severity={snackbar?.severity ?? 'error'}
        onClose={() => setSnackbar(null)}
      />
    </Box>
  );
}

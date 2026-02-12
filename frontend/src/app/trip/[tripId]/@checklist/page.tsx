'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';

import {
  Box,
  Button,
  IconButton,
  Avatar,
  TextField,
  Typography,
  Stack,
  Skeleton,
  Tooltip,
  Badge,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddItemButton from '@/components/trip/overview/add-item-button';
import SectionCard from '@/components/trip/overview/section-card';

import { Add } from '@mui/icons-material';
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';

import { UserPen, Trash2 } from 'lucide-react';

import { TripChecklistDto } from '@/api/checklist/type';

import { useGetTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-get-trip-checklist';
import { useCreateTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-create-trip-checklist';
import { useDeleteTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-delete-trip-checklist';
import { useUpdateTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-update-trip-checklist';

import { useAppSelector } from '@/store';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { useGetTripMembers } from '@/app/hooks/use-get-trip-members';
import TripmateModal from '@/app/trip/[tripId]/@checklist/components/tripmate-modal';
import { tokens } from '@/providers/theme/design-tokens';

export default function ChecklistPage() {
  const params = useParams();
  const tripId = Number(params.tripId);

  const me = useAppSelector((s) => s.profile.currentUser);
  const tripmates = useGetTripMembers(tripId);

  /* ===== checklist hooks ===== */
  const { data: items = [], isLoading } = useGetTripChecklist(tripId);

  const createMut = useCreateTripChecklist(tripId);
  const updateMut = useUpdateTripChecklist(tripId);
  const deleteMut = useDeleteTripChecklist(tripId);

  /* ===== local state ===== */
  const [openSection] = useState(true);

  const [assignTarget, setAssignTarget] = useState<TripChecklistDto | null>(null);
  const [assignAnchor, setAssignAnchor] = useState<HTMLElement | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [addingName, setAddingName] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity?: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  if (!tripId || Number.isNaN(tripId)) return null;

  const handleInlineAdd = () => {
    const name = addingName.trim();

    if (!name) {
      setIsAdding(false);
      setAddingName('');
      return;
    }

    if (name.length > 30) {
      setSnack({
        open: true,
        message: 'ชื่อยาวเกิน 30 ตัว',
        severity: 'error',
      });
      return;
    }

    createMut.mutate(name, {
      onSuccess: () => {
        setAddingName('');
        setIsAdding(false);
      },
    });
  };

  const handleInlineUpdate = (id: string) => {
    const name = editingName.trim();

    if (!name) {
      setEditingId(null);
      return;
    }

    if (name.length > 30) {
      setSnack({
        open: true,
        message: 'ชื่อยาวเกิน 30 ตัว',
        severity: 'error',
      });
      return;
    }

    updateMut.mutate({
      itemId: id,
      payload: { name },
    });

    setEditingId(null);
  };

  const handleToggleComplete = (item: TripChecklistDto) => {
    if (item.assignee && (!me || me.id !== item.assignee.id))
      return setSnack({
        open: true,
        message: 'เฉพาะผู้รับผิดชอบเท่านั้นที่เช็คได้',
        severity: 'error',
      });

    updateMut.mutate({
      itemId: item.id,
      payload: { completed: !item.completed },
    });
  };

  const handleAssign = (item: TripChecklistDto, assigneeId: number | null) => {
    updateMut.mutate({
      itemId: item.id,
      payload: { assigneeId },
    });

    setAssignAnchor(null);
    setAssignTarget(null);
  };

  const handleDelete = (id: string) => {
    deleteMut.mutate(id);
  };

  /* ===== render ===== */

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {openSection && (
        <SectionCard title="เช็กลิสต์" asEmpty={!isLoading && items.length === 0 && !isAdding}>
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
                    placeholder="eg. ถุงขยะ, ชุดกันหนาว, ทิชชู่"
                    value={addingName}
                    onChange={(e) => setAddingName(e.target.value)}
                    onBlur={handleInlineAdd}
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
                    }}
                  />
                </Box>
              ) : (
                <AddItemButton label="เพิ่มเช็กลิสต์" onClick={() => setIsAdding(true)} />
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

                return (
                  <Box
                    key={it.id}
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 3,
                      p: 2,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
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
                        <TextField
                          size="small"
                          autoFocus
                          fullWidth
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => handleInlineUpdate(it.id)}
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
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            textDecoration: it.completed ? 'line-through' : 'none',
                            cursor: 'pointer',
                            flex: 1,
                            textAlign: 'left',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            lineHeight: 1.5,
                          }}
                          onClick={() => {
                            setEditingId(it.id);
                            setEditingName(it.name);
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
                            <Avatar
                              src={it.assignee.profilePicUrl}
                              sx={{ width: 32, height: 32, cursor: 'pointer' }}
                              onClick={(e) => {
                                setAssignTarget(it);
                                setAssignAnchor(e.currentTarget);
                              }}
                            />
                          </Badge>
                        </Box>
                      ) : (
                        <Tooltip title="Assign">
                          <IconButton
                            onClick={(e) => {
                              setAssignTarget(it);
                              setAssignAnchor(e.currentTarget);
                            }}
                          >
                            <UserPen size={18} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Delete */}
                      <IconButton onClick={() => handleDelete(it.id)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Stack>
                  </Box>
                );
              })
          )}

          {/* ===== Add Section ===== */}
          {!isLoading && items.length > 0 && (
            <Box mt={2}>
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
                    placeholder="eg. ถุงขยะ, ชุดกันหนาว, ทิชชู่"
                    value={addingName}
                    onChange={(e) => setAddingName(e.target.value)}
                    onBlur={handleInlineAdd}
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
                    }}
                  />
                </Box>
              ) : (
                <Box textAlign="center">
                  <Button startIcon={<Add />} variant="contained" onClick={() => setIsAdding(true)}>
                    เพิ่มเช็กลิสต์
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </SectionCard>
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
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
}

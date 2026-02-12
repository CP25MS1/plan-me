'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Avatar,
  TextField,
  Typography,
  Stack,
  Skeleton,
  Tooltip,
  Badge,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { Add } from '@mui/icons-material';
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';

import { ChevronDown, ChevronUp, UserPen, Trash2 } from 'lucide-react';

import { TripChecklistDto } from '@/api/checklist/type';

import { useGetTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-get-trip-checklist';
import { useCreateTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-create-trip-checklist';
import { useDeleteTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-delete-trip-checklist';
import { useUpdateTripChecklist } from '@/app/trip/[tripId]/@checklist/hooks/use-update-trip-checklist';

import { useAppSelector } from '@/store';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { useGetTripMembers } from '@/app/hooks/use-get-trip-members';
import TripmateModal from '@/app/trip/[tripId]/@checklist/components/tripmate-modal';

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
  const [openSection, setOpenSection] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const [assignTarget, setAssignTarget] = useState<TripChecklistDto | null>(null);
  const [assignAnchor, setAssignAnchor] = useState<HTMLElement | null>(null);

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

  /* ===== actions ===== */

  const handleAdd = () => {
    if (!newName.trim())
      return setSnack({ open: true, message: 'กรุณากรอกชื่อ', severity: 'error' });

    if (newName.length > 30)
      return setSnack({
        open: true,
        message: 'ชื่อยาวเกิน 30 ตัว',
        severity: 'error',
      });

    createMut.mutate(newName.trim(), {
      onSuccess: () => {
        setOpenAdd(false);
        setNewName('');
        setSnack({ open: true, message: 'สร้างรายการแล้ว', severity: 'success' });
      },
    });
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
      {/* ===== Header ===== */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2, cursor: 'pointer' }}
        onClick={() => setOpenSection((s) => !s)}
      >
        <Typography fontWeight={600}>Checklist</Typography>
        {openSection ? <ChevronUp /> : <ChevronDown />}
      </Stack>

      {openSection && (
        <Box
          sx={{
            bgcolor: '#E9FBEF',
            borderRadius: 4,
            p: 2,
          }}
        >
          {/* ===== List ===== */}
          {isLoading
            ? [1, 2, 3].map((i) => (
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
            : items.map((it) => {
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
                      alignItems: 'center',
                      boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* Left */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <IconButton onClick={() => handleToggleComplete(it)} disabled={!canToggle}>
                        {it.completed ? <CheckBox /> : <CheckBoxOutlineBlank />}
                      </IconButton>

                      <Typography
                        sx={{
                          textDecoration: it.completed ? 'line-through' : 'none',
                        }}
                      >
                        {it.name}
                      </Typography>
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
              })}

          {/* ===== Add Button ===== */}
          <Box textAlign="center" mt={2}>
            <Button
              startIcon={<Add />}
              variant="contained"
              color="success"
              onClick={() => setOpenAdd(true)}
            >
              Add Checklist
            </Button>
          </Box>
        </Box>
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

      {/* ===== Add Dialog ===== */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth>
        <DialogTitle>เพิ่ม Checklist</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ชื่อรายการ (ไม่เกิน 30 ตัว)"
            inputProps={{ maxLength: 30 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="caption">{newName.length}/30</Typography>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleAdd}>
            สร้าง
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
}

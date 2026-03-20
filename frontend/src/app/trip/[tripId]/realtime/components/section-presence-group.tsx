'use client';

import { useMemo, useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { X } from 'lucide-react';

import type { TripRealtimeUser } from '@/api/realtime';

type SectionPresenceGroupProps = {
  users: TripRealtimeUser[];
  max?: number;
  dialogTitle?: string;
};

const getInitial = (username?: string | null) => (username?.trim()?.[0] ?? '?').toUpperCase();

export const SectionPresenceGroup = ({
  users,
  max = 4,
  dialogTitle = 'กำลังใช้งานอยู่',
}: SectionPresenceGroupProps) => {
  const [open, setOpen] = useState(false);

  const visibleUsers = useMemo(() => users.filter(Boolean), [users]);
  if (visibleUsers.length === 0) return null;

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        onPointerDown={(e) => e.stopPropagation()}
        sx={{ cursor: 'pointer' }}
      >
        <AvatarGroup
          max={max}
          sx={{
            '& .MuiAvatar-root': {
              width: 28,
              height: 28,
              fontSize: 12,
            },
          }}
        >
          {visibleUsers.map((u) => (
            <Tooltip key={u.id} title={u.username} arrow>
              <Avatar src={u.profilePicUrl ?? undefined}>{getInitial(u.username)}</Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
      </Box>

      <Dialog
        open={open}
        onClose={(_, reason) => {
          if (reason === 'backdropClick') return;
          setOpen(false);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>{dialogTitle}</Box>
          <IconButton onClick={() => setOpen(false)} aria-label="close">
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <List>
            {visibleUsers.map((u) => (
              <ListItem key={u.id} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar src={u.profilePicUrl ?? undefined}>{getInitial(u.username)}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={u.username} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SectionPresenceGroup;


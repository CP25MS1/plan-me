'use client';

import { Menu, Stack, Avatar, Typography, Box } from '@mui/material';

interface Tripmate {
  id: number;
  username: string;
  profilePicUrl?: string;
}

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  tripmates: Tripmate[];
  onAssign: (userId: number | null) => void;
}

export default function TripmateModal({ anchorEl, onClose, tripmates, onAssign }: Props) {
  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: {
          mt: 1,
          borderRadius: 3,
          minWidth: 220,
        },
      }}
    >
      <Box
        px={1}
        sx={{
          maxHeight: 240,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#ccc',
            borderRadius: 3,
          },
        }}
      >
        {tripmates.map((m) => (
          <Stack
            key={m.id}
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              p: 1,
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
            onClick={() => onAssign(m.id)}
          >
            <Avatar src={m.profilePicUrl} sx={{ width: 28, height: 28 }} />
            <Typography fontSize={14}>{m.username}</Typography>
          </Stack>
        ))}
      </Box>
    </Menu>
  );
}

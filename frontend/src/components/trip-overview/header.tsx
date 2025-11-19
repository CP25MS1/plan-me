'use client';

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  AvatarGroup,
  Button,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

export default function Header({ members }: { members: { id: number; avatar: string }[] }) {
  return (
    <AppBar position="static" elevation={0} color="inherit">
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton>
          <ArrowBackIosNewIcon />
        </IconButton>

        <Typography sx={{ flexGrow: 1, fontWeight: 700, fontSize: 20 }}>หัวกันหัวใจ</Typography>

        <AvatarGroup max={3}>
          {members.map((m) => (
            <Avatar key={m.id} src={m.avatar} />
          ))}
        </AvatarGroup>

        <Button
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 20,
            px: 2,
            backgroundColor: '#16a34a',
            color: 'white',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': { backgroundColor: '#16a34a' },
          }}
        >
          เชิญ
        </Button>
      </Toolbar>
    </AppBar>
  );
}

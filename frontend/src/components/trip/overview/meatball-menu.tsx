'use client';

import { useState } from 'react';
import {
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { History, MoreVertical, Share2 } from 'lucide-react';

import { tokens } from '@/providers/theme/design-tokens';

type MeatballMenuProps = {
  onShareClick: () => void;
  onVersionClick: () => void;
};

const menuItems = [
  {
    id: 'share',
    label: 'เชิญเพื่อน',
    icon: Share2,
  },
  {
    id: 'versions',
    label: 'บันทึกเวอร์ชัน',
    icon: History,
  },
];

export const MeatballMenu = ({ onShareClick, onVersionClick }: MeatballMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleAction = (itemId: string) => {
    setAnchorEl(null);

    if (itemId === 'share') {
      onShareClick();
      return;
    }

    onVersionClick();
  };

  return (
    <>
      <Tooltip title="More">
        <Box
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 2,
            cursor: 'pointer',
            color: tokens.color.textSecondary,
            '&:hover': {
              bgcolor: tokens.color.lightBackground,
              color: tokens.color.primaryDark,
            },
          }}
        >
          <MoreVertical size={18} />
        </Box>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              borderRadius: 2,
              border: '1px solid #ECECEC',
              boxShadow: '0 8px 24px rgba(9, 9, 9, 0.08)',
            },
          },
          list: {
            sx: {
              py: 0.5,
            },
          },
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <MenuItem
              key={item.id}
              onClick={() => handleAction(item.id)}
              sx={{
                gap: 1,
                minWidth: 190,
                py: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: tokens.color.primary }}>
                <Icon size={16} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 500, color: tokens.color.textPrimary }}
                  >
                    {item.label}
                  </Typography>
                }
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default MeatballMenu;

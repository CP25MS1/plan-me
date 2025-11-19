'use client';

import { useState } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import AddItemButton from './AddItemButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface SectionCardProps {
  title: string;
  buttonLabel: string;
  onAdd?: () => void;
}

const SectionCard = ({ title, buttonLabel, onAdd }: SectionCardProps) => {
  const [open, setOpen] = useState(true); // ควบคุมเปิด/ปิด

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          mb: 1,
        }}
        onClick={() => setOpen(!open)}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
        <IconButton
          size="small"
          sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={open}>
        <Box
          sx={{
            border: '1.5px dashed #27AE60',
            borderRadius: 2,
            py: 2.5,
            textAlign: 'center',
          }}
        >
          <AddItemButton label={buttonLabel} onClick={onAdd} />
        </Box>
      </Collapse>
    </Box>
  );
};

export default SectionCard;

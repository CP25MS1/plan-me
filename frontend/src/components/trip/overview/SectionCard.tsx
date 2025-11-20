'use client';

import { useState } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddItemButton from './AddItemButton';

interface SectionCardProps {
  title: string;
  buttonLabel?: string;
  onAdd?: () => void;
  children?: React.ReactNode;
}

const SectionCard = ({ title, buttonLabel, onAdd, children }: SectionCardProps) => {
  const [open, setOpen] = useState(true);

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
            width: '100%',
            border: children ? 'none' : '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            py: children ? 0 : 2.5, // ลด padding สำหรับ map
            textAlign: 'center',
          }}
        >
          {children ? (
            children
          ) : buttonLabel && onAdd ? (
            <AddItemButton label={buttonLabel} onClick={onAdd} />
          ) : null}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SectionCard;

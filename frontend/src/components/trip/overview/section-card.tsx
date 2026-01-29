'use client';

import { useState, ReactNode } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface SectionCardProps {
  title: ReactNode;
  children?: ReactNode;
  asEmpty?: boolean;
}

const SectionCard = ({ title, children, asEmpty = false }: SectionCardProps) => {
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
            border: asEmpty ? '2px dashed' : 'none',
            borderColor: 'primary.main',
            borderRadius: 2,
            py: asEmpty ? 2.5 : 0,
            textAlign: 'center',
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SectionCard;

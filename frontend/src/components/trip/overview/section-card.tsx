'use client';

import { useState, ReactNode } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import { ChevronDown } from 'lucide-react';

interface SectionCardProps {
  title: ReactNode;
  titleEndAdornment?: ReactNode;
  children?: ReactNode;
  asEmpty?: boolean;
  headerEndAdornment?: ReactNode;
  defaultOpen?: boolean;
}

const SectionCard = ({
  title,
  titleEndAdornment,
  children,
  asEmpty = false,
  headerEndAdornment,
  defaultOpen = true,
}: SectionCardProps) => {
  const [open, setOpen] = useState(defaultOpen);

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {title}
          </Typography>
          {titleEndAdornment ? (
            <Box
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {titleEndAdornment}
            </Box>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {headerEndAdornment ? (
            <Box
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {headerEndAdornment}
            </Box>
          ) : null}

          <IconButton
            size="small"
            sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}
          >
            <ChevronDown size={18} />
          </IconButton>
        </Box>
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

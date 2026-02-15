'use client';

import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface SectionCardProps {
  title: ReactNode;
  children?: ReactNode;
  asEmpty?: boolean;
}

const SectionCardNoClose = ({ title, children, asEmpty = false }: SectionCardProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
      </Box>

      {/* Content (always open) */}
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
    </Box>
  );
};

export default SectionCardNoClose;

'use client';

import { Box, Typography } from '@mui/material';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';

type TemplateEmptyStateProps = {
  title: string;
  description: string;
  minHeight?: string | number;
};

const TemplateEmptyState = ({
  title,
  description,
  minHeight = '60vh',
}: TemplateEmptyStateProps) => {
  return (
    <Box
      sx={{
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 520 }}>
        <EventBusyOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />

        <Typography variant="h5" fontWeight={600} gutterBottom>
          {title}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
};

export default TemplateEmptyState;

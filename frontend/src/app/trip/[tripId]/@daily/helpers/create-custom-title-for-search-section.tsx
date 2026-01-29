import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

import { tokens } from '@/providers/theme/design-tokens';

type CreateCustomTitleProps = {
  startIcon: ReactNode;
  title: string;
  qty: number;
};

export const createCustomTitle = (props: CreateCustomTitleProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {props.startIcon}

      <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {props.title}
      </Typography>

      <Typography variant="h6" color='primary' sx={{ bgcolor: `${tokens.color.lightBackground}`, px: 1, borderRadius: 1 }}>
        {props.qty}
      </Typography>
    </Box>
  );
};

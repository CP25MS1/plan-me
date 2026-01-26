'use client';

import { ReactNode } from 'react';
import { Box } from '@mui/material';

interface TripTabPanelProps {
  children?: ReactNode;
  value: number;
  index: number;
}

const TripTabPanel = ({ children, value, index }: TripTabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

export default TripTabPanel;

import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

type Props = {
  value: 'category' | 'day';
  onChange: (v: 'category' | 'day') => void;
};

export const BudgetTabs: React.FC<Props> = ({ value, onChange }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Tabs
        value={value === 'category' ? 0 : 1}
        onChange={(_, v) => onChange(v === 0 ? 'category' : 'day')}
        variant="fullWidth"
      >
        <Tab label="ตามประเภท" />
        <Tab label="ตามวัน" />
      </Tabs>
    </Box>
  );
};

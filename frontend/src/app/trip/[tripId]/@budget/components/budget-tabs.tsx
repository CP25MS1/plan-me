import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SxProps, Theme } from '@mui/material/styles';

type Props = {
  value: 'category' | 'day';
  onChange: (v: 'category' | 'day') => void;
  sx?: SxProps<Theme>;
};

export const BudgetTabs: React.FC<Props> = ({ value, onChange, sx }) => {
  const { t } = useTranslation('trip_overview');

  return (
    <Box sx={{ mb: 2, ...(sx as object) }}>
      <Tabs
        value={value === 'category' ? 0 : 1}
        onChange={(_, v) => onChange(v === 0 ? 'category' : 'day')}
        variant="fullWidth"
      >
        <Tab label={t('budget.tabs.byCategory')} />
        <Tab label={t('budget.tabs.byDay')} />
      </Tabs>
    </Box>
  );
};

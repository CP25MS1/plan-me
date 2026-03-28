'use client';

import { Box, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface OverViewTabsProps {
  value: number;
  onChange: (val: number) => void;
  hiddenTabs?: number[];
}

const OverviewTabs = ({ value, onChange, hiddenTabs = [] }: OverViewTabsProps) => {
  const { t } = useTranslation('trip_overview');

  const labels = [
    t('tabHeader.overView'),
    t('tabHeader.daily'),
    t('tabHeader.budget'),
    t('tabHeader.checkList'),
  ];

  const visibleTabs = labels
    .map((label, idx) => ({ label, idx }))
    .filter((tab) => !hiddenTabs.includes(tab.idx));

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={value}
        onChange={(_, v) => onChange(v)}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            flex: 1,
            maxWidth: 'none',
            px: 1.5,
          },
          '& .MuiTab-wrapper': {
            whiteSpace: 'nowrap',
          },
        }}
      >
        {visibleTabs.map((tab) => (
          <Tab key={tab.idx} label={tab.label} value={tab.idx} />
        ))}
      </Tabs>
    </Box>
  );
};

export default OverviewTabs;

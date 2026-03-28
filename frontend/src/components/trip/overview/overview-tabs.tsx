'use client';

import { Tabs, Tab, Box } from '@mui/material';
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

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={value}
        onChange={(_, v) => onChange(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {labels.map((label, idx) => {
          if (hiddenTabs.includes(idx)) return null;
          return <Tab key={idx} label={label} value={idx} />;
        })}
      </Tabs>
    </Box>
  );
};

export default OverviewTabs;

'use client';

import { Tabs, Tab, Box } from '@mui/material';

interface OverViewTabsProps {
  value: number;
  onChange: (val: number) => void;
}

const OverviewTabs = ({ value, onChange }: OverViewTabsProps) => {
  const labels = ['ภาพรวม', 'รายละเอียด', 'งบประมาณ', 'เช็คลิสต์'];

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={value}
        onChange={(_, v) => onChange(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {labels.map((label, idx) => (
          <Tab key={idx} label={label} />
        ))}
      </Tabs>
    </Box>
  );
};

export default OverviewTabs;

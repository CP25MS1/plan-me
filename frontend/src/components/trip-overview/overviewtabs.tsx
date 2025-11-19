'use client';

import { Tabs, Tab, Divider } from '@mui/material';

export default function OverviewTabs({
  tab,
  setTab,
}: {
  tab: number;
  setTab: (v: number) => void;
}) {
  return (
    <>
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        centered
        sx={{
          mt: 2,
          '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' },
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: 2,
            backgroundColor: 'primary',
          },
        }}
      >
        <Tab label="ภาพรวม" />
        <Tab label="รายวัน" />
        <Tab label="งบประมาณ" />
        <Tab label="เช็คลิสต์" />
      </Tabs>

      <Divider sx={{ mt: 1 }} />
    </>
  );
}

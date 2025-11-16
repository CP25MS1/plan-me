'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

import {
  Header,
  DateRangePickerComponent,
  TagSelector,
  OverviewTabs,
  SectionCard,
} from '@/components/trip-overview';

export default function OverviewPage() {
  const [tab, setTab] = useState(0);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <Box>
      <Header members={[]} />

      <DateRangePickerComponent
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />

      <TagSelector
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={['ทั้งหมด', 'ทริปเล่น', 'กินเที่ยว']}
      />

      <OverviewTabs tab={tab} setTab={setTab} />

      <Box sx={{ px: 2, mt: 2 }}>
        <SectionCard title="ข้อมูลการจอง" label="เพิ่มข้อมูลการจอง" />
        <SectionCard title="สถานที่ที่อยากไป" label="เพิ่มสถานที่" />
        <SectionCard title="เช็คลิสต์" label="เพิ่มเช็คลิสต์" />
      </Box>
    </Box>
  );
}

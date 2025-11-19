'use client';

import { useState } from 'react';
import { Container, Box } from '@mui/material';

import OverviewHeader from '@/components/trip/overview/OverviewHeader';
import OverviewTabs from '@/components/trip/overview/OverviewTabs';
import SectionCard from '@/components/trip/overview/SectionCard';

const TripOverviewPage = () => {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <OverviewHeader
        tripName="หัวหินหัวใจ"
        members={['/avatar1.png', '/avatar2.png', '/avatar3.png']}
        onBack={() => history.back()}
      />

      {/* Date + objectives row placeholder */}
      <Box sx={{ mb: 3 }}>{/* สามารถนำ date range + objectives มาใส่ตรงนี้ */}</Box>

      <OverviewTabs value={tab} onChange={setTab} />

      {tab === 0 && (
        <Box sx={{ mt: 2 }}>
          <SectionCard
            title="ข้อมูลการจอง"
            buttonLabel="เพิ่มข้อมูลการจอง"
            onAdd={() => console.log('add booking')}
          />

          <SectionCard
            title="สถานที่ที่อยากไป"
            buttonLabel="เพิ่มสถานที่"
            onAdd={() => console.log('add place')}
          />

          <SectionCard
            title="เช็คลิสต์"
            buttonLabel="เพิ่มเช็คลิสต์"
            onAdd={() => console.log('add checklist')}
          />
        </Box>
      )}
    </Container>
  );
};

export default TripOverviewPage;

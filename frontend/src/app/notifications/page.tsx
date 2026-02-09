'use client';

import { Box, Container, IconButton, Tab, Tabs, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useNotificationsSelector } from '@/store/selectors';
import { NotificationItem } from './components/notification-item';
import { EmptyState } from './components/empty-state';
import { groupNotificationsByDate } from './helpers/group-notifications';

type Filter = 'ALL' | 'UNREAD';

const NotificationPage = () => {
  const router = useRouter();
  const { notifications } = useNotificationsSelector();
  const [filter, setFilter] = useState<Filter>('ALL');

  const filtered = useMemo(() => {
    const sorted = [...notifications].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );

    if (filter === 'UNREAD') return sorted.filter((n) => !n.isRead);
    return sorted;
  }, [notifications, filter]);

  const grouped = useMemo(() => groupNotificationsByDate(filtered), [filtered]);

  return (
    <Container disableGutters>
      {/* Header */}
      <Box
        sx={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          borderColor: 'divider',
        }}
      >
        <IconButton onClick={() => router.back()}>
          <ArrowLeft size={22} />
        </IconButton>

        <Typography
          sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
          fontWeight={600}
        >
          การแจ้งเตือน
        </Typography>
      </Box>

      {/* Filter */}
      <Tabs value={filter} onChange={(_, v) => setFilter(v)} variant="fullWidth">
        <Tab label="ทั้งหมด" value="ALL" />
        <Tab label="ยังไม่ได้อ่าน" value="UNREAD" />
      </Tabs>

      {/* Content */}
      {filtered.length === 0 && <EmptyState />}

      {Object.entries(grouped).map(([label, items]) => (
        <Box key={label}>
          <Typography sx={{ px: 2, py: 1 }} fontSize={12} color="text.secondary">
            {label}
          </Typography>
          {items.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </Box>
      ))}
    </Container>
  );
};

export default NotificationPage;

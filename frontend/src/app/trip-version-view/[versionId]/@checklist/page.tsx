// @checklist/page.tsx
'use client';

import { Box, List, ListItem, Typography } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import SectionCardNoClose from '@/components/trip/overview/section-card-no-close';
import TemplateEmptyState from '../components/template-empty-state';
import { useFullPageLoading } from '@/components/full-page-loading';
import { useVersionTrip } from '../hooks/use-version-trip';
const VersionChecklistPage = () => {
  const { t } = useTranslation('trip_overview');
  const params = useParams<{ versionId: string }>();
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get('tripId') || '';
  const tripId = Number(tripIdParam);
  const versionId = Number(params.versionId);

  const { checklistItems, isLoading } = useVersionTrip(tripId, versionId);
  const { FullPageLoading } = useFullPageLoading();

  if (isLoading) return <FullPageLoading />;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <SectionCardNoClose
        title={t('tabHeader.checkList')}
        asEmpty={!isLoading && checklistItems.length === 0}
      >
        {checklistItems.length === 0 ? (
          <TemplateEmptyState
            title={t('template.empty.checklist.title')}
            description={t('template.empty.checklist.body')}
            minHeight={240}
          />
        ) : (
          <List>
            {checklistItems.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 3,
                  p: 2,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
                }}
              >
                <CheckBoxOutlineBlankIcon color="disabled" />
                <Typography sx={{ wordBreak: 'break-word' }}>{item.name}</Typography>
              </ListItem>
            ))}
          </List>
        )}
      </SectionCardNoClose>
    </Box>
  );
};

export default VersionChecklistPage;

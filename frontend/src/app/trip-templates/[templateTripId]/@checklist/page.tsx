'use client';

import { Box, List, ListItem, Typography } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import SectionCardNoClose from '@/components/trip/overview/section-card-no-close';
import { useTemplateTrip } from '../hooks/use-template-trip';
import TemplateEmptyState from '../components/template-empty-state';
import { useFullPageLoading } from '@/components/full-page-loading';

const TemplateChecklistPage = () => {
  const { t } = useTranslation('trip_overview');
  const params = useParams<{ templateTripId: string }>();
  const templateTripId = Number(params.templateTripId);

  const { template, isLoading } = useTemplateTrip(templateTripId);
  const { FullPageLoading } = useFullPageLoading();

  if (isLoading) return <FullPageLoading />;

  const items = template?.checklistItems ?? [];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <SectionCardNoClose
        title={t('tabHeader.checkList')}
        asEmpty={!isLoading && items.length === 0}
      >
        {items.length === 0 ? (
          <TemplateEmptyState
            title={t('template.empty.checklist.title')}
            description={t('template.empty.checklist.body')}
            minHeight={240}
          />
        ) : (
          <List>
            {items.map((item, idx) => (
              <ListItem
                key={`${item.name}-${idx}`}
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

export default TemplateChecklistPage;

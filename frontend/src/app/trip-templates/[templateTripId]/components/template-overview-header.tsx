'use client';

import { useState } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { BackButton } from '@/components/button';
import { PublicTemplateObjective } from '@/api/trip-templates';
import ApplyTemplateDialog from './apply-template-dialog';

type TemplateOverviewHeaderProps = {
  templateTripId: number;
  tripName: string;
  objectives: PublicTemplateObjective[];
  dayCount: number;
};

const TemplateOverviewHeader = ({
  templateTripId,
  tripName,
  objectives,
  dayCount,
}: TemplateOverviewHeaderProps) => {
  const { t } = useTranslation('trip_overview');
  const [openApply, setOpenApply] = useState(false);

  const displayName = tripName?.trim() ? tripName : t('Header.defaultName');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
        <BackButton />

        <Box sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            noWrap
            title={displayName}
            sx={{ px: 1 }}
          >
            {displayName}
          </Typography>
        </Box>

        <Button variant="contained" onClick={() => setOpenApply(true)}>
          {t('template.apply.actions.open')}
        </Button>
      </Box>

      <Stack spacing={1.5} sx={{ mt: 2, width: '100%', px: 2 }}>
        <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ gap: '8px', rowGap: '6px' }}>
          {objectives.length === 0 ? (
            <Typography sx={{ color: 'text.secondary' }}>
              {t('template.header.objectives.empty')}
            </Typography>
          ) : (
            objectives.map((obj) => (
              <Chip
                key={`${obj.name}-${obj.badgeColor}`}
                label={obj.name}
                size="small"
                sx={{ bgcolor: obj.badgeColor }}
              />
            ))
          )}
        </Stack>
      </Stack>

      <ApplyTemplateDialog
        open={openApply}
        onClose={() => setOpenApply(false)}
        templateTripId={templateTripId}
        defaultTripName={tripName}
        dayCount={dayCount}
      />
    </Box>
  );
};

export default TemplateOverviewHeader;

'use client';

import React from 'react';
import { Box, Dialog, DialogContent, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';

import type { TripOverview } from '@/api/trips';

import { BudgetTabs } from './budget-tabs';
import NoSplitExpenseSection from './no-split-expense-section';

type Props = {
  open: boolean;
  tripId: number;
  currentUserId: number;
  tripOverview: TripOverview;
  onClose: () => void;
  onRequestAddNoSplit: () => void;
};

export const NoSplitExpensesDialog: React.FC<Props> = ({
  open,
  tripId,
  currentUserId,
  tripOverview,
  onClose,
  onRequestAddNoSplit,
}) => {
  const { t } = useTranslation('trip_overview');

  const [tab, setTab] = React.useState<'category' | 'day'>('category');

  React.useEffect(() => {
    if (!open) setTab('category');
  }, [open]);

  return (
    <Dialog open={open} fullScreen onClose={onClose}>
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" alignItems="center" sx={{ px: 1, py: 1 }}>
            <IconButton aria-label={t('budget.personalDialog.backAria')} onClick={onClose}>
              <ArrowBackIcon />
            </IconButton>

            <Typography variant="h6" fontWeight={750} sx={{ flex: 1, ml: 1 }}>
              {t('budget.personalDialog.title')}
            </Typography>
          </Stack>

          <Box sx={{ px: 2, pb: 1 }}>
            <BudgetTabs value={tab} onChange={setTab} sx={{ mb: 0 }} />
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          <NoSplitExpenseSection
            tripId={tripId}
            currentUserId={currentUserId}
            tripOverview={tripOverview}
            tab={tab}
            onRequestAddNoSplit={onRequestAddNoSplit}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NoSplitExpensesDialog;

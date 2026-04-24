import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const EmptyState = () => {
  const { t } = useTranslation('common');

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography fontSize={16} fontWeight={500}>
        {t('notification.empty.title')}
      </Typography>
      <Typography fontSize={14} color="text.secondary">
        {t('notification.empty.body')}
      </Typography>
    </Box>
  );
};

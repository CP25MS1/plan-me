import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

export const FloatingAddButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { t } = useTranslation('trip_overview');

  return (
    <Fab
      color="primary"
      aria-label={t('budget.aria.addExpense')}
      onClick={onClick}
      sx={{
        position: 'fixed',
        right: 20,
        bottom: 24,
        zIndex: 1400,
      }}
    >
      <AddIcon />
    </Fab>
  );
};

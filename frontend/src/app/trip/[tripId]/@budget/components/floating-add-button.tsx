import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export const FloatingAddButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <Fab
      color="primary"
      aria-label="add-expense"
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

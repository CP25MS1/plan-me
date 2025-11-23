'use client';

import { Button } from '@mui/material';
import { Plus } from 'lucide-react';

interface AddItemButtonProps {
  label: string;
  onClick?: () => void;
}

const AddItemButton = ({ label, onClick }: AddItemButtonProps) => {
  return (
    <Button
      onClick={onClick}
      fullWidth
      sx={{
        color: '#27AE60',
        fontWeight: 600,
        display: 'flex',
        gap: 1,
      }}
      startIcon={<Plus />}
    >
      {label}
    </Button>
  );
};

export default AddItemButton;

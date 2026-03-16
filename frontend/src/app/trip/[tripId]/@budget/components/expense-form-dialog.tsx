'use client';

import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  title: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: () => void;
  disableSave: boolean;
  saveLabel: string;
  children: React.ReactNode;
};

export const ExpenseFormDialog: React.FC<Props> = ({
  open,
  title,
  isPending,
  onClose,
  onSubmit,
  disableSave,
  saveLabel,
  children,
}) => {
  const { t } = useTranslation('common');

  return (
    <Dialog open={open} onClose={() => !isPending && onClose()} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {title}
        <IconButton size="small" onClick={onClose} disabled={isPending}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent>{children}</DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {t('cancel')}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          color="success"
          disabled={disableSave}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {saveLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseFormDialog;


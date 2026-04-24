'use client';

import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import InviteTabs from './invite-tabs';

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: number;
}

export default function InviteDialog({ open, onClose, tripId }: Props) {
  const { t } = useTranslation('trip_overview');

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            px: 2,
            pb: 2,
          },
        },
      }}
    >
      {/* ===== Title ===== */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          textAlign: 'center',
          pb: 1,
        }}
      >
        {t('inviteDialog.title')}
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
          }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      {/* ===== Content ===== */}
      <DialogContent
        sx={{
          borderTop: 'none',
          pt: 2,
        }}
      >
        <InviteTabs tripId={tripId} />
      </DialogContent>
    </Dialog>
  );
}

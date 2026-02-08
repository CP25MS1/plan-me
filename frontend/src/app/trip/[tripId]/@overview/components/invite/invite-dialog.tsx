'use client';

import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import InviteTabs from './invite-tabs';

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: number;
}

export default function InviteDialog({ open, onClose, tripId }: Props) {
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          px: 2,
          pb: 2,
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
        เชิญเพื่อนเข้าร่วมทริป
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
          }}
        >
          <CloseIcon />
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

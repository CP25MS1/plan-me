import { ReactNode } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import { Breakpoint } from '@mui/system';
import { useTranslation } from 'react-i18next';

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  content,
  confirmLabel = 'confirm',
  cancelLabel = 'cancel',
  confirmLoading = false,
  fullWidth = true,
  maxWidth = 'md',
  color = 'primary',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  content: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
  fullWidth?: boolean;
  maxWidth?: Breakpoint | false;
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}) => {
  const { t } = useTranslation('common');
  return (
    <Dialog open={open} onClose={onClose} fullWidth={fullWidth} maxWidth={maxWidth}>
      <DialogContent sx={{ position: 'relative', pt: 2, pb: 2, px: 3 }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
          aria-label="close"
        >
          <X size={16} />
        </IconButton>

        <Box sx={{ mt: 1 }}>{content}</Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={confirmLoading} color="secondary">
          {t(cancelLabel)}
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={confirmLoading} color={color}>
          {confirmLoading ? '...' : t(confirmLabel)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

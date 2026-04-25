'use client';

import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { TransitionProps } from '@mui/material/transitions';

interface AppSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  duration?: number; // default 4000 ms
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Slide transition from TOP
 */
const SlideDownTransition = (props: TransitionProps & { children: React.ReactElement }) => {
  return <Slide {...props} direction="down" />;
};

/**
 * Custom color mapping by severity
 */
const severityStyles: Record<AlertColor, { bg: string; progress: string }> = {
  success: {
    bg: '#00BC7D',
    progress: 'rgba(255,255,255,0.7)',
  },
  warning: {
    bg: '#FE9A00',
    progress: 'rgba(0,0,0,0.4)',
  },
  info: {
    bg: '#2B7FFF',
    progress: 'rgba(255,255,255,0.7)',
  },
  error: {
    bg: '#FB2C36',
    progress: 'rgba(255,255,255,0.7)',
  },
};

export const AppSnackbar: React.FC<AppSnackbarProps> = ({
  open,
  message,
  severity = 'success',
  onClose,
  duration = 4000,
  actionLabel,
  onAction,
}) => {
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    if (!open) return;

    setProgress(100);

    const interval = 40;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => Math.max(prev - step, 0));
    }, interval);

    return () => clearInterval(timer);
  }, [open, duration]);

  const styles = severityStyles[severity] || severityStyles.info;

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={duration}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideDownTransition}
    >
      <Alert
        severity={severity}
        variant="filled"
        sx={{
          minWidth: 320,
          position: 'relative',
          overflow: 'hidden',
          pr: 5,
          backgroundColor: styles.bg,

          display: 'flex',
          alignItems: 'center',

          '& .MuiAlert-message': {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            padding: 0,
          },

          '& .MuiAlert-action': {
            marginLeft: 'auto',
            paddingTop: 0,
            alignItems: 'center',
          },
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {actionLabel && onAction && (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  onAction();
                  onClose();
                }}
                sx={{ fontWeight: 700, textTransform: 'none' }}
              >
                {actionLabel}
              </Button>
            )}

            <IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        {message}

        {/* Progress bar */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 3,
            width: `${progress}%`,
            bgcolor: styles.progress,
            transition: 'width 40ms linear',
          }}
        />
      </Alert>
    </Snackbar>
  );
};

// --- Context & Provider ---

interface SnackbarOptions {
  message: string;
  severity?: AlertColor;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface SnackbarContextType {
  showSnackbar: (options: SnackbarOptions) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const SnackbarContext = React.createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<SnackbarOptions>({
    message: '',
    severity: 'success',
  });

  const showSnackbar = React.useCallback((newOptions: SnackbarOptions) => {
    setOptions(newOptions);
    setOpen(true);
  }, []);

  const showSuccess = React.useCallback(
    (message: string, duration?: number) => showSnackbar({ message, severity: 'success', duration }),
    [showSnackbar]
  );
  const showError = React.useCallback(
    (message: string, duration?: number) => showSnackbar({ message, severity: 'error', duration }),
    [showSnackbar]
  );
  const showInfo = React.useCallback(
    (message: string, duration?: number) => showSnackbar({ message, severity: 'info', duration }),
    [showSnackbar]
  );
  const showWarning = React.useCallback(
    (message: string, duration?: number) => showSnackbar({ message, severity: 'warning', duration }),
    [showSnackbar]
  );

  const handleClose = () => setOpen(false);

  return (
    <SnackbarContext.Provider
      value={{ showSnackbar, showSuccess, showError, showInfo, showWarning }}
    >
      {children}
      <AppSnackbar
        open={open}
        onClose={handleClose}
        message={options.message}
        severity={options.severity}
        duration={options.duration}
        actionLabel={options.actionLabel}
        onAction={options.onAction}
      />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = React.useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};


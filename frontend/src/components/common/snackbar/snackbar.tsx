'use client';

import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import { TransitionProps } from '@mui/material/transitions';

interface AppSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  duration?: number; // default 4000 ms
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

  const styles = severityStyles[severity];

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
          <IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
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

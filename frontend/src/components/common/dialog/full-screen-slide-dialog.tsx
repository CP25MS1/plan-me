import { ReactNode } from 'react';
import { Container, Dialog } from '@mui/material';
import { createSlideTransition, SlideDirection } from '@/components/common/transition';

type SlideDialogProps = {
  isOpened: boolean;
  onClose: () => void;
  slideDirection?: SlideDirection;

  children: (props: { onClose: () => void }) => ReactNode;
};

export const FullScreenSlideDialog = ({
  isOpened,
  onClose,
  slideDirection = 'up',
  children,
}: SlideDialogProps) => {
  const SlideTransition = createSlideTransition(slideDirection);

  return (
    <Dialog
      fullScreen
      open={isOpened}
      onClose={onClose}
      slots={{
        transition: SlideTransition,
      }}
    >
      <Container maxWidth="md">
        {children({ onClose })}
      </Container>
    </Dialog>
  );
};

export default FullScreenSlideDialog;

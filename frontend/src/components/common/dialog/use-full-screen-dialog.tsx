import React, { JSX, useState, cloneElement } from 'react';
import { Dialog, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type FullScreenDialogProps<T = object> = {
  EntryElement?: JSX.Element;
  Content: (props: T & { onCloseAction: () => void }) => JSX.Element;
  contentProps?: T;
};

export const useFullScreenDialog = <T = object,>({
  EntryElement,
  Content,
  contentProps: initialContentProps,
}: FullScreenDialogProps<T>) => {
  const [open, setOpen] = useState(false);
  const [contentProps, setContentProps] = useState<T | undefined>(initialContentProps);

  const openWithProps = (props?: T) => {
    if (props) setContentProps(props);
    setOpen(true);
  };
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const DialogEl = (
    <>
      {EntryElement && cloneElement(EntryElement, { onClick: handleClickOpen })}
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        slots={{
          transition: Transition,
        }}
      >
        {Content && <Content {...(contentProps as T)} onCloseAction={handleClose} />}
      </Dialog>
    </>
  );

  return {
    open,
    openWithProps,
    handleClickOpen,
    handleClose,
    Dialog: DialogEl,
  };
};

export default useFullScreenDialog;

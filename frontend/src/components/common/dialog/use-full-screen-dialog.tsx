import React, { cloneElement, JSX, useState } from 'react';
import { Dialog } from '@mui/material';
import { createSlideTransition } from '@/components/common/transition';

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
  const SlideUpTransition = createSlideTransition('up');

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
          transition: SlideUpTransition,
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

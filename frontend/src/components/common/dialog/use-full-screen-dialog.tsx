import { JSX, useState, cloneElement } from 'react';
import { Dialog } from '@mui/material';

type FullScreenDialogProps<T = object> = {
  EntryElement: JSX.Element;
  Content: (props: T & { onCloseAction: () => void }) => JSX.Element;
  contentProps?: T;
};

export const useFullScreenDialog = <T = object,>({
  EntryElement,
  Content,
  contentProps,
}: FullScreenDialogProps<T>) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const DialogEl = (
    <>
      {cloneElement(EntryElement, { onClick: handleClickOpen })}
      <Dialog fullScreen open={open} onClose={handleClose}>
        <Content {...(contentProps as T)} onCloseAction={handleClose} />
      </Dialog>
    </>
  );

  return {
    open,
    handleClickOpen,
    handleClose,
    Dialog: DialogEl,
  };
};

export default useFullScreenDialog;

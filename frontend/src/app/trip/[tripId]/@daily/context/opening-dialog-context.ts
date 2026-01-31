import { createContext, useContext } from 'react';

type DialogContextValue = {
  isSearchDialogOpened: boolean;
  openSearchDialog: () => void;
  closeSearchDialog: () => void;
  isDetailsDialogOpened: boolean;
  selectedGgmpId: string | null;
  openDetailsDialog: (ggmpId: string) => void;
  closeDetailsDialog: () => void;
};

export const OpeningDialogContext = createContext<DialogContextValue | null>(null);

export const useOpeningDialogContext = () => {
  const ctx = useContext(OpeningDialogContext);
  if (!ctx) {
    throw new Error('useOpeningDialogContext must be used inside Provider');
  }
  return ctx;
};

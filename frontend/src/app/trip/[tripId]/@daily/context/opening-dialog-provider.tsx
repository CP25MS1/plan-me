'use client';

import { useMemo, useState } from 'react';
import { OpeningDialogContext } from './opening-dialog-context';

export const OpeningDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSearchDialogOpened, setIsSearchDialogOpened] = useState(false);
  const [isDetailsDialogOpened, setIsDetailsDialogOpened] = useState(false);

  const value = useMemo(
    () => ({
      isSearchDialogOpened,
      isDetailsDialogOpened,
      openSearchDialog: () => setIsSearchDialogOpened(true),
      closeSearchDialog: () => setIsSearchDialogOpened(false),
      openDetailsDialog: () => setIsDetailsDialogOpened(true),
      closeDetailsDialog: () => setIsDetailsDialogOpened(false),
    }),
    [isSearchDialogOpened, isDetailsDialogOpened]
  );

  return <OpeningDialogContext.Provider value={value}>{children}</OpeningDialogContext.Provider>;
};

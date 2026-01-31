'use client';

import { useMemo, useState } from 'react';
import { OpeningDialogContext } from './opening-dialog-context';

export const OpeningDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSearchDialogOpened, setIsSearchDialogOpened] = useState(false);
  const [isDetailsDialogOpened, setIsDetailsDialogOpened] = useState(false);
  const [selectedGgmpId, setSelectedGgmpId] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      isSearchDialogOpened,
      isDetailsDialogOpened,
      openSearchDialog: () => setIsSearchDialogOpened(true),
      closeSearchDialog: () => setIsSearchDialogOpened(false),
      openDetailsDialog: (ggmpId: string) => {
        setSelectedGgmpId(ggmpId);
        setIsDetailsDialogOpened(true);
      },
      closeDetailsDialog: () => {
        setIsDetailsDialogOpened(false);
        setSelectedGgmpId(null);
      },
      selectedGgmpId,
    }),
    [isSearchDialogOpened, isDetailsDialogOpened, selectedGgmpId]
  );

  return <OpeningDialogContext.Provider value={value}>{children}</OpeningDialogContext.Provider>;
};

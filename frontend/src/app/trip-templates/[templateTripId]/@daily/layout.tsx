'use client';

import { ReactNode } from 'react';
import { OpeningDialogProvider } from '@/app/trip/[tripId]/@daily/context/opening-dialog-provider';

const TemplateDailyLayout = ({ children }: { children: ReactNode }) => {
  return <OpeningDialogProvider>{children}</OpeningDialogProvider>;
};

export default TemplateDailyLayout;

import { ReactNode } from 'react';
import { OpeningDialogProvider } from './context/opening-dialog-provider';

const DailyPlanLayout = ({ children }: { children: ReactNode }) => {
  return <OpeningDialogProvider>{children}</OpeningDialogProvider>;
};

export default DailyPlanLayout;

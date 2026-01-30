import { createContext, useContext } from 'react';

type DailyPlanContextValue = {
  planId: number;
};

export const DailyPlanContext = createContext<DailyPlanContextValue | null>(null);

export const useDailyPlanContext = () => {
  const ctx = useContext(DailyPlanContext);
  if (!ctx) throw new Error('useDailyPlanContext must be used inside Provider');
  return ctx;
};

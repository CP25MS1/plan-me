export const TRIP_TABS = ['overview', 'daily', 'budget', 'checklist'] as const;

export type TripTabKey = (typeof TRIP_TABS)[number];

export const tabKeyToIndex = (key: string | null): number => {
  const idx = TRIP_TABS.indexOf(key as TripTabKey);
  return idx === -1 ? 0 : idx;
};

export const indexToTabKey = (index: number): TripTabKey => TRIP_TABS[index] ?? 'overview';

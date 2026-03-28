'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { sortByDateAsc } from '@/lib/date';
import { TripVersion, TripOverview } from '@/api/trips/type';
import { apiClient } from '@/api/client';

const fetchTripVersion = async (
  tripId: number
): Promise<(TripVersion & { snapshot?: TripOverview })[]> => {
  const { data } = await apiClient.get(`/trips/${tripId}/versions`, {
    params: { includeSnapshot: true },
  });
  return data;
};

export const useVersionTrip = (tripId: number, versionId: number) => {
  const {
    data: versions,
    isLoading: versionLoading,
    isError: versionError,
  } = useQuery({
    queryKey: ['trip-version', tripId],
    queryFn: () => fetchTripVersion(tripId),
    enabled: Number.isFinite(tripId) && tripId > 0,
  });

  const version = versions?.find((v) => v.id === versionId) ?? null;
  const snapshot = version?.snapshot;

  const dailyPlans = useMemo(() => {
    if (!snapshot?.dailyPlans?.length) return [];
    const startDate = snapshot.startDate ? dayjs(snapshot.startDate) : null;
    const sorted = sortByDateAsc([...snapshot.dailyPlans]);
    return sorted.map((plan) => ({
      ...plan,
      dayIndex: startDate ? dayjs(plan.date).diff(startDate, 'day') + 1 : 0,
    }));
  }, [snapshot]);

  return {
    version,
    snapshot,
    tripName: snapshot?.name ?? '',
    objectives: snapshot?.objectives ?? [],
    wishlistPlaces: snapshot?.wishlistPlaces ?? [],
    checklistItems:
      snapshot?.checklist?.map((name, index) => ({
        id: index,
        name,
      })) ?? [],
    dailyPlans,
    mapPlans: dailyPlans,
    dayCount: dailyPlans.length,
    isLoading: versionLoading,
    isError: versionError,
  };
};

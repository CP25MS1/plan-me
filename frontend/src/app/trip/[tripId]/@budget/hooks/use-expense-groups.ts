import React from 'react';
import dayjs from '@/lib/dayjs';

import type { ExpenseType, TripExpenseDto } from '@/api/budget/type';
import { EXPENSE_TYPE_ORDER } from '../components/expense-type-options';
import { getExpenseTotal, getExpensesTotal } from '../utils/expense-money';
import { toDayKey } from '../utils/format-date';

export type ExpenseGroup =
  | {
      key: `type:${ExpenseType}`;
      kind: 'category';
      type: ExpenseType;
      expenses: TripExpenseDto[];
      total: number;
    }
  | {
      key: `day:${string}`;
      kind: 'day';
      dayKey: string;
      expenses: TripExpenseDto[];
      total: number;
    };

type Args = {
  expenses: TripExpenseDto[];
  tab: 'category' | 'day';
  showMineOnly: boolean;
  currentUserId: number;
};

export const useExpenseGroups = ({ expenses, tab, showMineOnly, currentUserId }: Args) => {
  return React.useMemo(() => {
    const sorted = [...expenses].sort(
      (a, b) => dayjs(b.spentAt).valueOf() - dayjs(a.spentAt).valueOf()
    );

    const filtered = showMineOnly
      ? sorted.filter((e) => e.splits.some((s) => s.participant.id === currentUserId))
      : sorted;

    const groups: ExpenseGroup[] = [];

    if (tab === 'category') {
      const byType = new Map<ExpenseType, TripExpenseDto[]>();
      for (const e of filtered) {
        const list = byType.get(e.type) ?? [];
        list.push(e);
        byType.set(e.type, list);
      }

      for (const type of EXPENSE_TYPE_ORDER) {
        const list = byType.get(type) ?? [];
        if (list.length === 0) continue;
        groups.push({
          key: `type:${type}`,
          kind: 'category',
          type,
          expenses: list,
          total: getExpensesTotal(list),
        });
      }

      return {
        groups,
        counts: { total: expenses.length, filtered: filtered.length },
      };
    }

    const byDay = new Map<string, TripExpenseDto[]>();
    for (const e of filtered) {
      const dayKey = toDayKey(e.spentAt);
      const list = byDay.get(dayKey) ?? [];
      list.push(e);
      byDay.set(dayKey, list);
    }

    const dayKeys = [...byDay.keys()].toSorted((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
    for (const dayKey of dayKeys) {
      const list = (byDay.get(dayKey) ?? []).toSorted(
        (a, b) => dayjs(b.spentAt).valueOf() - dayjs(a.spentAt).valueOf()
      );
      if (list.length === 0) continue;
      groups.push({
        key: `day:${dayKey}`,
        kind: 'day',
        dayKey,
        expenses: list,
        total: getExpensesTotal(list),
      });
    }

    return {
      groups,
      counts: { total: expenses.length, filtered: filtered.length },
    };
  }, [currentUserId, expenses, showMineOnly, tab]);
};

export const getExpenseTotalAmount = (expense: Pick<TripExpenseDto, 'splits'>) => {
  return getExpenseTotal(expense);
};

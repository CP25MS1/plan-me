import { ExpenseType } from '@/api/budget/type';
import { Car, BedDouble, Utensils, ShoppingBag, Ticket, CircleEllipsis } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Box } from '@mui/material';
import { tokens } from '@/providers/theme/design-tokens';

export type ExpenseTypeOption = {
  value: ExpenseType;
  labelKey: string;
  Icon: LucideIcon;
};

export const EXPENSE_TYPE_ORDER: ExpenseType[] = [
  'TRAVEL',
  'LODGING',
  'FOOD',
  'ACTIVITY',
  'SHOPPING',
  'OTHER',
];

export const EXPENSE_TYPE_OPTIONS: ExpenseTypeOption[] = [
  { value: 'TRAVEL', labelKey: 'budget.expenseType.travel', Icon: Car },
  { value: 'LODGING', labelKey: 'budget.expenseType.lodging', Icon: BedDouble },
  { value: 'FOOD', labelKey: 'budget.expenseType.food', Icon: Utensils },
  { value: 'ACTIVITY', labelKey: 'budget.expenseType.activity', Icon: Ticket },
  { value: 'SHOPPING', labelKey: 'budget.expenseType.shopping', Icon: ShoppingBag },
  { value: 'OTHER', labelKey: 'budget.expenseType.other', Icon: CircleEllipsis },
];

export const ExpenseTypeIcon = ({ type, size = 18 }: { type: ExpenseType; size?: number }) => {
  const meta = EXPENSE_TYPE_OPTIONS.find((o) => o.value === type);
  const Icon = meta?.Icon ?? CircleEllipsis;

  return (
    <Box
      sx={{
        width: size + 6,
        height: size + 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size} color={tokens.color.primary} />
    </Box>
  );
};

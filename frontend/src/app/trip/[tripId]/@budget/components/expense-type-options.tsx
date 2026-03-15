import { ExpenseType } from '@/api/budget/type';
import { Car, BedDouble, Utensils, ShoppingBag, Ticket, CircleEllipsis } from 'lucide-react';
import { tokens } from '@/providers/theme/design-tokens';

export const EXPENSE_TYPE_OPTIONS: {
  value: ExpenseType;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'TRAVEL',
    label: 'การเดินทาง',
    icon: <Car size={18} color={tokens.color.primary} />,
  },
  {
    value: 'LODGING',
    label: 'ที่พัก',
    icon: <BedDouble size={18} color={tokens.color.primary} />,
  },
  {
    value: 'FOOD',
    label: 'อาหาร',
    icon: <Utensils size={18} color={tokens.color.primary} />,
  },
  {
    value: 'SHOPPING',
    label: 'ช็อปปิ้ง',
    icon: <ShoppingBag size={18} color={tokens.color.primary} />,
  },
  {
    value: 'ACTIVITY',
    label: 'กิจกรรม',
    icon: <Ticket size={18} color={tokens.color.primary} />,
  },
  {
    value: 'OTHER',
    label: 'อื่น ๆ',
    icon: <CircleEllipsis size={18} color={tokens.color.primary} />,
  },
];

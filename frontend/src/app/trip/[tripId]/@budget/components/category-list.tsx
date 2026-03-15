'use client';

import React from 'react';
import {
  Typography,
  Stack,
  Card,
  Box,
  Avatar,
  AvatarGroup,
  IconButton,
  Collapse,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HotelIcon from '@mui/icons-material/Hotel';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import { tokens } from '@/providers/theme/design-tokens';
import { formatCurrencyTH } from '../utils/format-number';
import { formatDate } from '../utils/format-date';

import { useGetTripExpenses } from '../hooks/use-get-trip-expenses';
import { TripExpenseDto, ExpenseType } from '@/api/budget/type';

/* ---------------- ICON ---------------- */

const IconByType = ({ type }: { type: ExpenseType }) => {
  const style = { fontSize: 20, color: tokens.color.primary };

  switch (type) {
    case 'TRAVEL':
      return <DirectionsCarIcon sx={style} />;
    case 'LODGING':
      return <HotelIcon sx={style} />;
    case 'FOOD':
      return <LocalDiningIcon sx={style} />;
    case 'ACTIVITY':
      return <EventAvailableIcon sx={style} />;
    case 'SHOPPING':
      return <ShoppingBagIcon sx={style} />;
    default:
      return <MoreHorizIcon sx={style} />;
  }
};

/* ---------------- CARD ---------------- */

const ExpenseCard: React.FC<{ e: TripExpenseDto }> = ({ e }) => {
  const participants = e.splits.map((s) => s.participant);
  const total = e.splits.reduce((s, it) => s + it.amount, 0);

  return (
    <Card
      sx={{
        mb: 1,
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
      elevation={0}
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography fontWeight={500}>{e.name}</Typography>

        <Typography fontWeight={700}>{formatCurrencyTH(total)}</Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
        <Typography variant="body2" color="text.secondary">
          {formatDate(e.spentAt)}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          •
        </Typography>

        <Typography variant="body2" color="text.secondary">
          จ่ายโดย {e.payer.username}
        </Typography>

        <AvatarGroup max={4}>
          {participants.map((p) => (
            <Avatar key={p.id} src={p.profilePicUrl} sx={{ width: 24, height: 24, fontSize: 12 }}>
              {p.username[0]}
            </Avatar>
          ))}
        </AvatarGroup>
      </Stack>
    </Card>
  );
};

/* ---------------- CATEGORY LIST ---------------- */

export const CategoryList: React.FC<{ tripId: number }> = ({ tripId }) => {
  const { data: expenses = [] } = useGetTripExpenses(tripId);

  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setOpen((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  const { data: expensesRaw } = useGetTripExpenses(tripId);
  React.useEffect(() => {
    console.log('tripExpenses raw ->', expensesRaw);
  }, [expensesRaw]);

  const categories = React.useMemo(() => {
    const map: Record<ExpenseType, TripExpenseDto[]> = {
      FOOD: [],
      TRAVEL: [],
      LODGING: [],
      ACTIVITY: [],
      SHOPPING: [],
      OTHER: [],
    };

    expenses.forEach((e) => {
      map[e.type].push(e);
    });

    return [
      { id: 'food', title: 'อาหารและเครื่องดื่ม', type: 'FOOD' as ExpenseType, items: map.FOOD },
      {
        id: 'transport',
        title: 'การเดินทาง',
        type: 'TRANSPORT' as ExpenseType,
        items: map.TRAVEL,
      },
      {
        id: 'hotel',
        title: 'ที่พัก',
        type: 'ACCOMMODATION' as ExpenseType,
        items: map.LODGING,
      },
      { id: 'activity', title: 'กิจกรรม', type: 'ACTIVITY' as ExpenseType, items: map.ACTIVITY },
      { id: 'shopping', title: 'ช็อปปิ้ง', type: 'SHOPPING' as ExpenseType, items: map.SHOPPING },
      { id: 'other', title: 'อื่น ๆ', type: 'OTHER' as ExpenseType, items: map.OTHER },
    ].filter((c) => c.items.length > 0);
  }, [expenses]);

  return (
    <>
      {categories.map((cat) => {
        const isOpen = open[cat.id] ?? true;

        const total = cat.items.reduce(
          (s, it) => s + it.splits.reduce((ss, sp) => ss + sp.amount, 0),
          0
        );

        return (
          <Box key={cat.id} sx={{ mb: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ cursor: 'pointer', mb: 1 }}
              onClick={() => toggle(cat.id)}
            >
              <IconByType type={cat.type} />

              <Typography fontWeight={600}>{cat.title}</Typography>

              <Box sx={{ flex: 1 }} />

              <Typography fontWeight={700}>{formatCurrencyTH(total)}</Typography>

              <IconButton size="small">
                <ExpandMoreIcon
                  sx={{
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: '0.2s',
                  }}
                />
              </IconButton>
            </Stack>

            <Collapse in={isOpen}>
              {cat.items.map((it) => (
                <ExpenseCard key={it.expenseId} e={it} />
              ))}
            </Collapse>
          </Box>
        );
      })}
    </>
  );
};

export default CategoryList;

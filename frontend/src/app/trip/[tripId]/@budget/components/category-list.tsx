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

type PublicUserInfo = {
  id: number;
  username: string;
  profilePicUrl?: string | null;
};
// MOCK DATA //
type SplitDto = {
  participant: PublicUserInfo;
  amount: number;
};
// MOCK DATA //
type ExpenseDto = {
  expenseId: number;
  tripId: number;
  name: string;
  type: 'TRANSPORT' | 'ACCOMMODATION' | 'FOOD' | 'ACTIVITY' | 'SHOPPING' | 'OTHER';
  splitType: 'SPLIT' | 'FULL';
  payer: PublicUserInfo;
  createdBy: PublicUserInfo;
  spentAt: string;
  splits: SplitDto[];
};
// MOCK DATA //
type Category = {
  id: string;
  title: string;
  type: ExpenseDto['type'];
  items: ExpenseDto[];
};

/* ---------------- ICON ---------------- */

const IconByType = ({ type }: { type: ExpenseDto['type'] }) => {
  const style = { fontSize: 20, color: tokens.color.primary };

  switch (type) {
    case 'TRANSPORT':
      return <DirectionsCarIcon sx={style} />;
    case 'ACCOMMODATION':
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

/* ---------------- MOCK DATA ---------------- */
const ENABLE_MOCK = false;
const mockCategories: Category[] = [
  {
    id: 'food',
    title: 'อาหารและเครื่องดื่ม',
    type: 'FOOD',
    items: [
      {
        expenseId: 1,
        tripId: 1,
        name: 'ข้าวกลางวัน',
        type: 'FOOD',
        splitType: 'SPLIT',
        payer: { id: 1, username: 'ปุ๊' },
        createdBy: { id: 1, username: 'ปุ๊' },
        spentAt: '2026-03-13T09:02:22.325Z',
        splits: [
          { participant: { id: 1, username: 'ปุ๊' }, amount: 170 },
          { participant: { id: 2, username: 'บี' }, amount: 170 },
        ],
      },
      {
        expenseId: 2,
        tripId: 1,
        name: 'ขนมหวาน',
        type: 'FOOD',
        splitType: 'SPLIT',
        payer: { id: 2, username: 'บี' },
        createdBy: { id: 2, username: 'บี' },
        spentAt: '2026-03-13T11:00:00.000Z',
        splits: [{ participant: { id: 2, username: 'บี' }, amount: 80 }],
      },
    ],
  },
  {
    id: 'transport',
    title: 'การเดินทาง',
    type: 'TRANSPORT',
    items: [
      {
        expenseId: 3,
        tripId: 1,
        name: 'เติมน้ำมัน',
        type: 'TRANSPORT',
        splitType: 'FULL',
        payer: { id: 3, username: 'Owner' },
        createdBy: { id: 3, username: 'Owner' },
        spentAt: '2026-03-12T08:00:00.000Z',
        splits: [{ participant: { id: 3, username: 'Owner' }, amount: 600 }],
      },
    ],
  },
  {
    id: 'hotel',
    title: 'ที่พัก',
    type: 'ACCOMMODATION',
    items: [
      {
        expenseId: 4,
        tripId: 1,
        name: 'โรงแรมเชียงใหม่',
        type: 'ACCOMMODATION',
        splitType: 'SPLIT',
        payer: { id: 1, username: 'ปุ๊' },
        createdBy: { id: 1, username: 'ปุ๊' },
        spentAt: '2026-03-11T15:00:00.000Z',
        splits: [
          { participant: { id: 1, username: 'ปุ๊' }, amount: 500 },
          { participant: { id: 2, username: 'บี' }, amount: 500 },
        ],
      },
    ],
  },
  {
    id: 'activity',
    title: 'กิจกรรม',
    type: 'ACTIVITY',
    items: [
      {
        expenseId: 5,
        tripId: 1,
        name: 'ค่าเข้าดอยอินทนนท์',
        type: 'ACTIVITY',
        splitType: 'SPLIT',
        payer: { id: 2, username: 'บี' },
        createdBy: { id: 2, username: 'บี' },
        spentAt: '2026-03-12T10:00:00.000Z',
        splits: [
          { participant: { id: 1, username: 'ปุ๊' }, amount: 50 },
          { participant: { id: 2, username: 'บี' }, amount: 50 },
        ],
      },
    ],
  },
  {
    id: 'shopping',
    title: 'ช็อปปิ้ง',
    type: 'SHOPPING',
    items: [
      {
        expenseId: 6,
        tripId: 1,
        name: 'ของฝาก',
        type: 'SHOPPING',
        splitType: 'FULL',
        payer: { id: 1, username: 'ปุ๊' },
        createdBy: { id: 1, username: 'ปุ๊' },
        spentAt: '2026-03-13T18:00:00.000Z',
        splits: [{ participant: { id: 1, username: 'ปุ๊' }, amount: 300 }],
      },
    ],
  },
];

/* ---------------- CARD ---------------- */

const ExpenseCard: React.FC<{ e: ExpenseDto }> = ({ e }) => {
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
            <Avatar
              key={p.id}
              src={p.profilePicUrl ?? undefined}
              sx={{ width: 24, height: 24, fontSize: 12 }}
            >
              {p.username[0]}
            </Avatar>
          ))}
        </AvatarGroup>
      </Stack>
    </Card>
  );
};

/* ---------------- CATEGORY LIST ---------------- */

export const CategoryList: React.FC<{ categories?: Category[] }> = ({ categories }) => {
  const data = categories?.length ? categories : ENABLE_MOCK ? mockCategories : [];
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setOpen((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  return (
    <>
      {data.map((cat) => {
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

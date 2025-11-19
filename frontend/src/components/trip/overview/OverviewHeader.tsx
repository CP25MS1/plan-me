'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  AvatarGroup,
  Avatar,
  IconButton,
  Button,
  Stack,
  Popover,
} from '@mui/material';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import DateRangePicker from '@/components/common/date-time/date-range-picker';
import ObjectivePickerDialog, {
  MAX_OBJECTIVES,
  useDefaultObjectives,
  getKey,
} from '@/components/trip/objective-picker-dialog';
import { Objective, DefaultObjective } from '@/api/trips';

type DateRange = [Dayjs | null, Dayjs | null];

interface OverviewHeaderProps {
  tripName: string;
  members?: string[];
  onBack?: () => void;
}

const OverviewHeader = ({ tripName, members = [], onBack }: OverviewHeaderProps) => {
  const defaultObjectives = useDefaultObjectives();
  const [dateRange, setDateRange] = useState<DateRange>([null, null]);
  const [selectedObjectives, setSelectedObjectives] = useState<Objective[]>([]);
  const [openObjectiveModal, setOpenObjectiveModal] = useState(false);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleCalendarClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleCalendarClose = () => setAnchorEl(null);
  const openCalendar = Boolean(anchorEl);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* ==== Header Row ==== */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <IconButton onClick={onBack}>
          <ArrowLeft />
        </IconButton>

        <Typography variant="h5" sx={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>
          {tripName}
        </Typography>

        {/* AvatarGroup + Invite button vertically stacked */}
        <Stack direction="column" alignItems="center" spacing={0.5}>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
            {members.map((m, i) => (
              <Avatar key={i} src={m} />
            ))}
          </AvatarGroup>

          <Button
            sx={{
              bgcolor: '#00C46A',
              color: 'white',
              fontWeight: 600,
              px: 2,
              py: 0.5,
              fontSize: 13,
              borderRadius: '10px',
              minWidth: '56px',
              '&:hover': { bgcolor: '#00A85C' },
            }}
          >
            เชิญ
          </Button>
        </Stack>
      </Box>

      {/* ==== Calendar + Tag Section ==== */}
      <Stack spacing={1.5} sx={{ mt: 2, width: '100%', px: 2 }}>
        {/* Row 1: Calendar */}
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handleCalendarClick}>
            <Calendar />
          </IconButton>

          {dateRange[0] && dateRange[1] && (
            <Typography sx={{ fontSize: 16 }}>
              {dayjs(dateRange[0]).format('DD/MM')} - {dayjs(dateRange[1]).format('DD/MM')}
            </Typography>
          )}
        </Stack>

        <Popover
          open={openCalendar}
          anchorEl={anchorEl}
          onClose={handleCalendarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ p: 2 }}>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </Box>
        </Popover>

        {/* Row 2: Tags */}
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <IconButton onClick={() => setOpenObjectiveModal(true)}>
            <Tag />
          </IconButton>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {selectedObjectives.map((obj, i) => (
              <Box
                key={i}
                sx={{
                  bgcolor: '#C8F7D8',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '12px',
                  fontSize: 14,
                }}
              >
                {obj.name} ✕
              </Box>
            ))}
          </Stack>
        </Stack>

        <ObjectivePickerDialog
          open={openObjectiveModal}
          selected={selectedObjectives}
          defaultObjectives={defaultObjectives}
          onClose={() => setOpenObjectiveModal(false)}
          onChange={(next) => {
            const unique: Objective[] = [];
            for (const it of next) {
              if (unique.length >= MAX_OBJECTIVES) break;
              const key = getKey(it);
              if (
                !unique.some(
                  (u) =>
                    ((u as DefaultObjective).boId
                      ? `bo:${(u as DefaultObjective).boId}`
                      : `c:${u.name}`) === key
                )
              ) {
                unique.push(it);
              }
            }
            setSelectedObjectives(unique);
          }}
        />
      </Stack>
    </Box>
  );
};

export default OverviewHeader;

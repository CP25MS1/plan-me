'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  AvatarGroup,
  Avatar,
  IconButton,
  Button,
  Stack,
  Popover,
  Chip,
  Tooltip,
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
import { BackButton } from '@/components/button';
import { useRouter } from 'next/navigation';
import { X as XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type DateRange = [Dayjs | null, Dayjs | null];

interface OverviewHeaderProps {
  tripName: string;
  members?: string[];
  objectives?: Objective[];
  startDate?: string;
  endDate?: string;
  onBack?: () => void;
}

const OverviewHeader = ({
  tripName,
  members = [],
  objectives = [],
  startDate,
  endDate,
  onBack,
}: OverviewHeaderProps) => {
  const { t } = useTranslation('trip_overview');
  const router = useRouter();
  const defaultObjectives = useDefaultObjectives();

  const [dateRange, setDateRange] = useState<DateRange>([
    startDate ? dayjs(startDate) : null,
    endDate ? dayjs(endDate) : null,
  ]);

  const [selectedObjectives, setSelectedObjectives] = useState<Objective[]>(objectives);
  const [openObjectiveModal, setOpenObjectiveModal] = useState(false);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleCalendarClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleCalendarClose = () => setAnchorEl(null);
  const openCalendar = Boolean(anchorEl);

  useEffect(() => {
    setDateRange([startDate ? dayjs(startDate) : null, endDate ? dayjs(endDate) : null]);
  }, [startDate, endDate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* ==== Header Row ==== */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <IconButton>
          <BackButton onBack={() => router.push('/home')} />
        </IconButton>

        <Tooltip title={tripName} placement="top" arrow>
          <Typography
            variant="h5"
            sx={{
              flex: 1,
              textAlign: 'center',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'default',
            }}
          >
            {tripName}
          </Typography>
        </Tooltip>

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
            {t('shareButton')}
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

          <Stack
            direction="row"
            flexWrap="wrap"
            spacing={1}
            sx={{
              gap: '8px', // เว้นระยะแนวนอน
              rowGap: '6px', // เว้นระยะแนวตั้งเวลาลงบรรทัดใหม่
            }}
          >
            {selectedObjectives.map((obj) => (
              <Chip
                key={obj.id ?? obj.name}
                label={obj.name}
                size="small"
                sx={{ bgcolor: obj.badgeColor ?? '#C8F7D8' }}
                onDelete={() =>
                  setSelectedObjectives((prev) =>
                    prev.filter((o) => (o.id ?? o.name) !== (obj.id ?? obj.name))
                  )
                }
                deleteIcon={<XIcon size={14} />}
              />
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

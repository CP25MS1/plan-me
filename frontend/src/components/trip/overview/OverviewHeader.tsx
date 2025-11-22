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
  InputBase,
  Tooltip,
} from '@mui/material';
import { ArrowLeft, Calendar, Tag, X as XIcon } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import DateRangePicker from '@/components/common/date-time/date-range-picker';
import ObjectivePickerDialog, {
  MAX_OBJECTIVES,
  useDefaultObjectives,
  getKey,
} from '@/components/trip/objective-picker-dialog';
import { Objective } from '@/api/trips';
import { BackButton } from '@/components/button';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

type DateRange = [Dayjs | null, Dayjs | null];

interface OverviewHeaderProps {
  tripName: string;
  members?: string[];
  objectives?: Objective[];
  startDate?: string;
  endDate?: string;
  canEdit?: boolean;

  onUpdateTripName?: (name: string) => Promise<void>;
  onUpdateDates?: (start: string | null, end: string | null) => Promise<void>;
  onUpdateObjectives?: (objectives: Objective[]) => Promise<void>;
}

const OverviewHeader = ({
  tripName,
  members = [],
  objectives = [],
  startDate,
  endDate,
  canEdit = true,
  onUpdateTripName,
  onUpdateDates,
  onUpdateObjectives,
}: OverviewHeaderProps) => {
  const { t } = useTranslation('trip_overview');
  const router = useRouter();
  const defaultObjectives = useDefaultObjectives();

  // ----------------------------
  // TRIP NAME
  // ----------------------------
  const [editingName, setEditingName] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);

  // ตั้งค่าเริ่มต้นเมื่อโหลดหน้า
  useEffect(() => {
    setEditingName(tripName === '' ? t('Header.defaultName') : tripName);
  }, [tripName, t]);

  // แยก displayName สำหรับ UI และ InputBase
  const displayName =
    !isNameFocused && editingName.trim() === '' ? t('Header.defaultName') : editingName;

  const handleFocus = () => {
    setIsNameFocused(true);
    if (editingName === t('Header.defaultName')) setEditingName('');
  };

  const handleNameBlur = () => {
    if (!canEdit) return;

    const trimmed = editingName.trim();
    const valueToSave = trimmed; // save "" ถ้า user ไม่ใส่
    setEditingName(trimmed === '' ? t('Header.defaultName') : trimmed);
    onUpdateTripName?.(valueToSave);
    setIsNameFocused(false);
  };

  // ----------------------------
  // DATE PICKER
  // ----------------------------
  const [dateRange, setDateRange] = useState<DateRange>([
    startDate ? dayjs(startDate) : null,
    endDate ? dayjs(endDate) : null,
  ]);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const openCalendar = Boolean(anchorEl);

  const handleCalendarClick = (e: React.MouseEvent<HTMLElement>) =>
    canEdit ? setAnchorEl(e.currentTarget) : null;

  const handleCalendarClose = async () => {
    setAnchorEl(null);
    if (!onUpdateDates) return;

    const [start, end] = dateRange;
    await onUpdateDates(
      start ? start.startOf('day').format('YYYY-MM-DD') : null,
      end ? end.startOf('day').format('YYYY-MM-DD') : null
    );
  };

  // ----------------------------
  // OBJECTIVES
  // ----------------------------
  const [selectedObjectives, setSelectedObjectives] = useState<Objective[]>(objectives);
  const [openObjectiveModal, setOpenObjectiveModal] = useState(false);

  const handleObjectiveModalClose = () => {
    setOpenObjectiveModal(false);
    if (!canEdit) return;

    const valid = selectedObjectives.slice(0, MAX_OBJECTIVES).map((o) => ({
      ...o,
      name: o.name.slice(0, 25),
      badgeColor: o.badgeColor ?? '#C8F7D8',
    }));

    onUpdateObjectives?.(valid);
  };

  useEffect(
    () => setEditingName(tripName === '' ? t('Header.defaultName') : tripName),
    [tripName, t]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <IconButton>
          <BackButton onBack={() => router.push('/home')} />
        </IconButton>

        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Tooltip title={editingName} arrow disableInteractive>
            <InputBase
              value={displayName}
              onChange={(e) => setEditingName(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleNameBlur}
              disabled={!canEdit}
              placeholder={t('Header.placeholderName')}
              inputProps={{
                maxLength: 50,
                style: {
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
              sx={{
                width: '100%',
                color: !canEdit ? 'gray' : 'inherit',
                '&::placeholder': { color: '#999' },
              }}
            />
          </Tooltip>
        </Box>

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
              '&:hover': { bgcolor: '#00A85C' },
            }}
          >
            {t('shareButton')}
          </Button>
        </Stack>
      </Box>

      {/* DATE + OBJECTIVES */}
      <Stack spacing={1.5} sx={{ mt: 2, width: '100%', px: 2 }}>
        {/* DATE RANGE */}
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handleCalendarClick} disabled={!canEdit}>
            <Calendar />
          </IconButton>

          {dateRange[0] && dateRange[1] ? (
            <Typography sx={{ fontSize: 16 }}>
              {dayjs(dateRange[0]).format('DD/MM')} - {dayjs(dateRange[1]).format('DD/MM')}
            </Typography>
          ) : (
            <Typography sx={{ color: '#999' }}>{t('Header.placeholderTime')}</Typography>
          )}
        </Stack>

        {/* POPUP CALENDAR */}
        <Popover open={openCalendar} anchorEl={anchorEl} onClose={handleCalendarClose}>
          <Box sx={{ p: 2 }}>
            <DateRangePicker
              value={dateRange}
              onChange={(newValue) => {
                setDateRange(newValue);

                const [start, end] = newValue;
                if (start && end && !end.isBefore(start)) {
                  onUpdateDates?.(
                    start ? dayjs(start).format('YYYY-MM-DD') : null,
                    end ? dayjs(end).format('YYYY-MM-DD') : null
                  );
                }
              }}
            />
          </Box>
        </Popover>

        {/* OBJECTIVES SECTION */}
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <IconButton onClick={() => canEdit && setOpenObjectiveModal(true)} disabled={!canEdit}>
            <Tag />
          </IconButton>

          <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ gap: '8px', rowGap: '6px' }}>
            {selectedObjectives.length === 0 && (
              <Typography sx={{ color: '#999' }}>{t('Header.placeholderObjective')}</Typography>
            )}

            {selectedObjectives.map((obj) => (
              <Chip
                key={obj.id ?? obj.name}
                label={obj.name}
                size="small"
                sx={{ bgcolor: obj.badgeColor ?? '#C8F7D8' }}
                onDelete={
                  !canEdit
                    ? undefined
                    : () =>
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
          onClose={handleObjectiveModalClose}
          onChange={(next) => {
            const unique: Objective[] = [];
            for (const it of next) {
              if (unique.length >= MAX_OBJECTIVES) break;
              const key = getKey(it);
              if (!unique.some((u) => getKey(u) === key)) unique.push(it);
            }
            setSelectedObjectives(unique);
          }}
        />
      </Stack>
    </Box>
  );
};

export default OverviewHeader;

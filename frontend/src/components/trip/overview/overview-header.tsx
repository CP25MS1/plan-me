'use client';

import { useEffect, useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  IconButton,
  InputBase,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Tag, X as XIcon } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import DateRangePicker from '@/components/common/date-time/date-range-picker';
import ObjectivePickerDialog, {
  getDefaultObjectiveName,
  getKey,
  MAX_OBJECTIVES,
  useDefaultObjectives,
} from '@/components/trip/objective-picker-dialog';
import { Objective } from '@/api/trips';
import { BackButton } from '@/components/button';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import InviteDialog from '@/app/trip/[tripId]/@overview/components/invite/invite-dialog';
import MembersModal from '@/app/trip/[tripId]/@overview/components/member/members-modal';
import { useParams } from 'next/navigation';
import TripOverviewPage from '@/app/trip/[tripId]/@overview/page';

type DateRange = [Dayjs | null, Dayjs | null];

export interface OverviewHeaderProps {
  tripOverview: {
    tripName: string;
    members?: {
      id: number;
      username: string;
      profilePicUrl?: string;
    }[];
    objectives?: Objective[];
    startDate?: string;
    endDate?: string;
    canEdit?: boolean;

    onUpdateTripName?: (name: string) => void;
    onUpdateDates?: (start?: string, end?: string) => void;
    onUpdateObjectives?: (objectives: Objective[]) => void;
  };
}

const OverviewHeader = ({
  tripOverview: {
    tripName,
    members = [],
    objectives = [],
    startDate,
    endDate,
    canEdit = true,
    onUpdateTripName,
    onUpdateDates,
    onUpdateObjectives,
  },
}: OverviewHeaderProps) => {
  const locale = useSelector((s: RootState) => s.i18n.locale);
  const { t } = useTranslation('trip_overview');
  const router = useRouter();
  const defaultObjectives = useDefaultObjectives();

  const { tripId } = useParams<{ tripId: string }>();
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openMembers, setOpenMembers] = useState(false);

  const { tripId } = useParams<{ tripId: string }>();
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openMembers, setOpenMembers] = useState(false);

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
        <BackButton onBack={() => router.push('/home')} />

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
                color: canEdit ? 'inherit' : 'gray',
                '&::placeholder': { color: '#999' },
              }}
            />
          </Tooltip>
        </Box>

        <Stack direction="column" alignItems="center" spacing={0.5}>
          <AvatarGroup
            max={3}
            sx={{
              cursor: 'pointer',
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                fontSize: 12,
              },
            }}
            onClick={() => setOpenMembers(true)}
          >
            {members.map((m) => (
              <Avatar key={m.id} src={m.profilePicUrl}>
                {m.username?.[0]}
              </Avatar>
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
            onClick={() => setOpenShareDialog(true)}
          >
            {t('shareButton')}
          </Button>
        </Stack>
      </Box>

      {/* DATE + OBJECTIVES */}
      <Stack spacing={1.5} sx={{ mt: 2, width: '100%', px: 2 }}>
        {/* DATE RANGE */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ cursor: 'pointer', maxWidth: 'fit-content' }}
        >
          <DateRangePicker
            noOutline={true}
            value={dateRange}
            onChange={(newValue) => {
              setDateRange(newValue);
              const [start, end] = newValue;
              onUpdateDates?.(
                start ? dayjs(start).format('YYYY-MM-DD') : undefined,
                end ? dayjs(end).format('YYYY-MM-DD') : undefined
              );
            }}
          />
        </Stack>

        {/* OBJECTIVES SECTION */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          onClick={() => canEdit && setOpenObjectiveModal(true)}
          sx={{ cursor: 'pointer', maxWidth: 'fit-content' }}
        >
          <IconButton sx={{ paddingX: '0' }}>
            <Tag />
          </IconButton>

          <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ gap: '8px', rowGap: '6px' }}>
            {selectedObjectives.length === 0 && (
              <Typography sx={{ color: '#999' }}>{t('Header.placeholderObjective')}</Typography>
            )}

            {selectedObjectives.map((obj) => (
              <Chip
                key={obj.id ?? obj.name}
                label={'boId' in obj ? getDefaultObjectiveName(locale, obj) : obj.name}
                size="small"
                sx={{ bgcolor: obj.badgeColor ?? '#C8F7D8' }}
                onDelete={(e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  setSelectedObjectives((prev) => {
                    const updated = prev.filter((o) => (o.id ?? o.name) !== (obj.id ?? obj.name));
                    onUpdateObjectives?.(updated);
                    return updated;
                  });
                }}
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
        <InviteDialog
          open={openShareDialog}
          onClose={() => setOpenShareDialog(false)}
          tripId={Number(tripId)}
        />
        <MembersModal
          open={openMembers}
          onClose={() => setOpenMembers(false)}
          tripId={Number(tripId)}
        />
      </Stack>
    </Box>
  );
};

export default OverviewHeader;

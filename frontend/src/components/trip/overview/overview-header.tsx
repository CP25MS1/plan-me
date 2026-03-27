'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  AvatarGroup,
  Box,
  Chip,
  IconButton,
  InputBase,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Globe, Lock, Tag, X as XIcon } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import DateRangePicker from '@/components/common/date-time/date-range-picker';
import ObjectivePickerDialog, {
  getDefaultObjectiveName,
  getKey,
  MAX_OBJECTIVES,
  useDefaultObjectives,
} from '@/components/trip/objective-picker-dialog';
import { useCreateTripVersion, useDeleteTripVersion, useTripVersions } from '@/api/trips/hooks';
import type { Objective, TripVersion, TripVisibility } from '@/api/trips/type';
import { BackButton } from '@/components/button';
import { RootState } from '@/store';
import InviteDialog from '@/app/trip/[tripId]/@overview/components/invite/invite-dialog';
import MembersModal from '@/app/trip/[tripId]/@overview/components/member/members-modal';
import MeatballMenu from './meatball-menu';
import VersionModal from './version-modal';
import CreateVersionDialog from './create-version-dialog';

type DateRange = [Dayjs | null, Dayjs | null];

export interface OverviewHeaderProps {
  tripOverview: {
    tripName: string;
    ownerId: number;
    visibility?: TripVisibility;
    members?: {
      id: number;
      username: string;
      profilePicUrl?: string;
    }[];
    objectives?: Objective[];
    startDate?: string;
    endDate?: string;
    onUpdateTripName?: (name: string) => void;
    onUpdateDates?: (start?: string, end?: string) => void;
    onUpdateObjectives?: (objectives: Objective[]) => void;
  };
}

const sanitizeObjectives = (objectives: Objective[]) => {
  const uniqueObjectives: Objective[] = [];

  for (const objective of objectives) {
    if (uniqueObjectives.length >= MAX_OBJECTIVES) {
      break;
    }

    if (!uniqueObjectives.some((item) => getKey(item) === getKey(objective))) {
      uniqueObjectives.push({
        ...objective,
        name: objective.name.slice(0, 25),
        badgeColor: objective.badgeColor ?? '#C8F7D8',
      });
    }
  }

  return uniqueObjectives;
};

const OverviewHeader = ({
  tripOverview: {
    tripName,
    ownerId,
    visibility,
    members = [],
    objectives = [],
    startDate,
    endDate,
    onUpdateTripName,
    onUpdateDates,
    onUpdateObjectives,
  },
}: OverviewHeaderProps) => {
  const locale = useSelector((state: RootState) => state.i18n.locale);
  const currentUser = useSelector((state: RootState) => state.profile.currentUser);
  const { t } = useTranslation('trip_overview');
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();
  const queryClient = useQueryClient();
  const defaultObjectives = useDefaultObjectives();

  const { tripId } = useParams<{ tripId: string }>();
  const tripIdAsNumber = Number(tripId);

  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openMembers, setOpenMembers] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [createVersionDialogOpen, setCreateVersionDialogOpen] = useState(false);

  const isTripOwner = useMemo(
    () => Boolean(currentUser && ownerId && currentUser.id === ownerId),
    [currentUser, ownerId]
  );

  const {
    data: allVersions = [],
    isLoading: isVersionsLoading,
    isFetching: isVersionsFetching,
  } = useTripVersions(tripIdAsNumber);
  const createVersionMutation = useCreateTripVersion();
  const deleteVersionMutation = useDeleteTripVersion();

  const versions = allVersions.sort(
    (left, right) => dayjs(right.createdAt).valueOf() - dayjs(left.createdAt).valueOf()
  );

  const resolvedVisibility: TripVisibility = visibility ?? 'PRIVATE';
  const isPublicVisibility = resolvedVisibility === 'PUBLIC';

  const [editingName, setEditingName] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);

  useEffect(() => {
    setEditingName(tripName === '' ? t('Header.defaultName') : tripName);
  }, [tripName, t]);

  const displayName =
    !isNameFocused && editingName.trim() === '' ? t('Header.defaultName') : editingName;

  const handleFocus = () => {
    setIsNameFocused(true);
    if (editingName === t('Header.defaultName')) {
      setEditingName('');
    }
  };

  const handleNameBlur = () => {
    if (!isTripOwner) {
      return;
    }

    const trimmedName = editingName.trim();
    setEditingName(trimmedName === '' ? t('Header.defaultName') : trimmedName);
    onUpdateTripName?.(trimmedName);
    setIsNameFocused(false);
  };

  const [dateRange, setDateRange] = useState<DateRange>([null, null]);

  useEffect(() => {
    setDateRange([startDate ? dayjs(startDate) : null, endDate ? dayjs(endDate) : null]);
  }, [startDate, endDate]);

  const [selectedObjectives, setSelectedObjectives] = useState<Objective[]>([]);
  const [openObjectiveModal, setOpenObjectiveModal] = useState(false);

  useEffect(() => {
    setSelectedObjectives(objectives ?? []);
  }, [objectives]);

  const handleObjectiveModalClose = () => {
    setOpenObjectiveModal(false);

    if (!isTripOwner) {
      return;
    }

    onUpdateObjectives?.(sanitizeObjectives(selectedObjectives));
  };

  const updateVersionCache = (updater: (currentVersions: TripVersion[]) => TripVersion[]) => {
    queryClient.setQueryData(
      ['trip-versions', tripIdAsNumber, false],
      (currentVersions: TripVersion[] = []) => updater(currentVersions)
    );
  };

  const handleCreateVersion = async (versionName: string) => {
    const createdVersion = await createVersionMutation.mutateAsync({
      tripId: tripIdAsNumber,
      versionName,
    });

    updateVersionCache((currentVersions) => [
      createdVersion,
      ...currentVersions.filter((version) => version.id !== createdVersion.id),
    ]);

    setCreateVersionDialogOpen(false);
    setVersionModalOpen(true);
  };

  const handleDeleteVersion = async (versionId: number) => {
    await deleteVersionMutation.mutateAsync({
      tripId: tripIdAsNumber,
      versionId,
    });

    updateVersionCache((currentVersions) =>
      currentVersions.filter((version) => version.id !== versionId)
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {currentUser ? <BackButton onBack={() => router.push('/profile')} /> : null}

        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Tooltip title={editingName} arrow disableInteractive>
            <InputBase
              value={displayName}
              onChange={(event) => setEditingName(event.target.value)}
              onFocus={handleFocus}
              onBlur={handleNameBlur}
              disabled={!isTripOwner}
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
            {members.map((member) => (
              <Avatar key={member.id} src={member.profilePicUrl}>
                {member.username?.[0]}
              </Avatar>
            ))}
          </AvatarGroup>
        </Stack>
      </Box>

      <Stack spacing={1.5} sx={{ mt: 2, width: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Chip
            size="small"
            icon={isPublicVisibility ? <Globe size={14} /> : <Lock size={14} />}
            label={tCommon(
              isPublicVisibility ? 'trip.visibility.public' : 'trip.visibility.private'
            )}
            sx={{
              width: 'fit-content',
              height: 24,
              borderRadius: '999px',
              bgcolor: isPublicVisibility ? '#E8F5FF' : '#F5F5F5',
              color: isPublicVisibility ? '#0D47A1' : 'text.secondary',
              '& .MuiChip-icon': {
                color: 'inherit',
                ml: 0.75,
              },
              '& .MuiChip-label': {
                px: 1,
                fontSize: 11,
                fontWeight: 600,
              },
            }}
          />

          <MeatballMenu
            isOwner={isTripOwner}
            onShareClick={() => setOpenShareDialog(true)}
            onVersionClick={() => setVersionModalOpen(true)}
          />
        </Stack>

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
            disabled={!isTripOwner}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          onClick={() => isTripOwner && setOpenObjectiveModal(true)}
          sx={{ cursor: 'pointer', maxWidth: 'fit-content' }}
        >
          <IconButton sx={{ paddingX: '0' }}>
            <Tag />
          </IconButton>

          <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ gap: '8px', rowGap: '6px' }}>
            {selectedObjectives.length === 0 ? (
              <Typography sx={{ color: '#999' }}>{t('Header.placeholderObjective')}</Typography>
            ) : null}

            {selectedObjectives.map((objective) => (
              <Chip
                key={objective.id ?? objective.name}
                label={
                  'boId' in objective ? getDefaultObjectiveName(locale, objective) : objective.name
                }
                size="small"
                sx={{ bgcolor: objective.badgeColor ?? '#C8F7D8' }}
                disabled={!isTripOwner}
                onDelete={(event) => {
                  event.stopPropagation();
                  event.preventDefault();

                  setSelectedObjectives((prev) => {
                    const updated = prev.filter(
                      (item) => (item.id ?? item.name) !== (objective.id ?? objective.name)
                    );
                    onUpdateObjectives?.(sanitizeObjectives(updated));
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
          onChange={(nextObjectives) => {
            setSelectedObjectives(sanitizeObjectives(nextObjectives));
          }}
        />

        <InviteDialog
          open={openShareDialog}
          onClose={() => setOpenShareDialog(false)}
          tripId={tripIdAsNumber}
        />

        <MembersModal
          open={openMembers}
          onCloseAction={() => setOpenMembers(false)}
          tripId={tripIdAsNumber}
        />

        <VersionModal
          open={versionModalOpen}
          onClose={() => setVersionModalOpen(false)}
          versions={versions}
          onAddVersion={() => {
            setVersionModalOpen(false);
            setCreateVersionDialogOpen(true);
          }}
          onDeleteVersion={handleDeleteVersion}
          isLoading={isVersionsLoading || isVersionsFetching}
          isOwner={isTripOwner}
        />

        <CreateVersionDialog
          open={createVersionDialogOpen}
          onClose={() => {
            if (!createVersionMutation.isPending) {
              setCreateVersionDialogOpen(false);
              setVersionModalOpen(true);
            }
          }}
          onConfirm={handleCreateVersion}
          isLoading={createVersionMutation.isPending}
        />
      </Stack>
    </Box>
  );
};

export default OverviewHeader;

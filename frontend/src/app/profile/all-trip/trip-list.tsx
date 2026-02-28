'use client';

import React from 'react';
import {
  Box,
  Card,
  Typography,
  Skeleton,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { EllipsisVertical, Globe, Lock, Share2, Trash2 } from 'lucide-react';

import { TripSummary } from '@/api/all';
import { TripVisibility } from '@/api/trips';
import { TruncatedTooltip } from '@/components/atoms';
import { ConfirmDialog } from '@/components/common/dialog';
import { useDeleteTrip, useToggleTripVisibility } from '@/app/hooks';
import { useAppSelector } from '@/store';

interface TripListProps {
  trips?: TripSummary[];
  title?: string;
  loading?: boolean;
  error?: boolean;
  onTripClick?: (tripId: number) => void;
  t?: (key: string) => string;
  currentUserId?: number;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
  });
};

export const TripList: React.FC<TripListProps> = ({
  trips,
  title,
  loading,
  error,
  onTripClick,
  t,
  currentUserId,
}) => {
  const tripVisibilityById = useAppSelector((s) => s.tripDetail.tripVisibilityById);
  const { mutate: mutateVisibility, isPending: isUpdatingVisibility } = useToggleTripVisibility();
  const { mutate: mutateDeleteTrip, isPending: isDeletingTrip } = useDeleteTrip();

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLElement | null>(null);
  const [selectedTrip, setSelectedTrip] = React.useState<TripSummary | null>(null);
  const [openShareConfirm, setOpenShareConfirm] = React.useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false);

  const resolveVisibility = React.useCallback(
    (trip: TripSummary): TripVisibility =>
      tripVisibilityById[trip.id] ?? trip.visibility ?? 'PRIVATE',
    [tripVisibilityById]
  );

  const translate = React.useCallback((key: string) => t?.(key) ?? key, [t]);

  const selectedTripVisibility: TripVisibility = selectedTrip
    ? resolveVisibility(selectedTrip)
    : 'PRIVATE';
  const selectedTripName = selectedTrip?.name ?? '-';
  const isSelectedTripPublic = selectedTripVisibility === 'PUBLIC';
  const isMenuOpen = Boolean(menuAnchorEl);

  const closeMenu = () => {
    setMenuAnchorEl(null);
  };

  const openMenuForTrip = (event: React.MouseEvent<HTMLElement>, trip: TripSummary) => {
    event.stopPropagation();
    setSelectedTrip(trip);
    setMenuAnchorEl(event.currentTarget);
  };

  const openShareDialog = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    closeMenu();
    setOpenShareConfirm(true);
  };

  const openDeleteDialog = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    closeMenu();
    setOpenDeleteConfirm(true);
  };

  const handleConfirmShare = () => {
    if (!selectedTrip) return;
    const nextVisibility: TripVisibility = isSelectedTripPublic ? 'PRIVATE' : 'PUBLIC';
    mutateVisibility(
      { tripId: selectedTrip.id, visibility: nextVisibility },
      {
        onSuccess: () => {
          setOpenShareConfirm(false);
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!selectedTrip) return;
    mutateDeleteTrip(
      { tripId: selectedTrip.id },
      {
        onSuccess: () => {
          setOpenDeleteConfirm(false);
          setSelectedTrip(null);
        },
      }
    );
  };

  const sharedDataKeys = [
    'trip.confirm.data_items.trip_name',
    'trip.confirm.data_items.objectives',
    'trip.confirm.data_items.wishlist_places',
    'trip.confirm.data_items.daily_plans',
    'trip.confirm.data_items.checklist_items',
  ];

  if (!loading && !error && (!trips || trips.length === 0)) {
    return (
      <Box
        sx={{
          p: 8,
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          {t?.('noTrip') ?? 'คุณยังไม่มีทริป'}
        </Typography>

        <Typography variant="body2" color="text.secondary" mt={1}>
          เริ่มสร้างทริปแรกของคุณได้เลย
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          p: 4,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2.5,
        }}
      >
        {title && (
          <Typography variant="h4" fontWeight={700} gridColumn="span 2">
            {title}
          </Typography>
        )}

        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            sx={{
              p: 2.5,
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <Stack spacing={1}>
              <Skeleton variant="text" width="70%" height={28} />
              <Skeleton variant="text" width="50%" height={20} />
              <Stack direction="row" spacing={1} mt={1}>
                <Skeleton variant="rounded" width={50} height={22} />
                <Skeleton variant="rounded" width={60} height={22} />
                <Skeleton variant="rounded" width={45} height={22} />
              </Stack>
            </Stack>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 4,
        width: '100%',
        maxWidth: '100%',
        display: 'grid',
        gap: 2.5,
      }}
    >
      {title && (
        <Typography variant="h4" fontWeight={700} gridColumn="span 2">
          {title}
        </Typography>
      )}

      {trips
        ?.slice()
        .sort((a, b) => b.id - a.id)
        .map((trip) => {
          const visibility = resolveVisibility(trip);
          const isPublic = visibility === 'PUBLIC';
          const canShowActions = Boolean(currentUserId && trip.owner?.id === currentUserId);

          return (
            <Card
              key={trip.id}
              onClick={() => onTripClick?.(trip.id)}
              sx={{
                p: 2.5,
                borderRadius: 3,
                cursor: onTripClick ? 'pointer' : 'default',
                transition: '0.25s ease',
                boxShadow: 2,
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={0.5}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <TruncatedTooltip text={trip.name} className="text-base font-semibold" />
                  </Box>

                  {canShowActions && (
                    <IconButton
                      size="small"
                      onClick={(event) => openMenuForTrip(event, trip)}
                      sx={{ borderRadius: 2, bgcolor: '#F3F4F6', flexShrink: 0 }}
                    >
                      <EllipsisVertical size={16} />
                    </IconButton>
                  )}
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ minWidth: 0, flex: 1, flexWrap: 'nowrap' }}
                  >
                    <CalendarMonthIcon sx={{ fontSize: 16, flexShrink: 0 }} color="action" />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </Typography>
                  </Stack>

                  <Chip
                    size="small"
                    icon={isPublic ? <Globe size={14} /> : <Lock size={14} />}
                    label={translate(
                      isPublic ? 'trip.visibility.public' : 'trip.visibility.private'
                    )}
                    sx={{
                      height: 24,
                      borderRadius: '999px',
                      bgcolor: isPublic ? '#E8F5FF' : '#F5F5F5',
                      color: isPublic ? '#0D47A1' : 'text.secondary',
                      flexShrink: 0,
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
                </Stack>
              </Stack>

              {trip.objectives && trip.objectives.length > 0 && (
                <Stack direction="row" flexWrap="wrap">
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    sx={{
                      mt: 0.5,
                      columnGap: 1,
                      rowGap: 1,
                    }}
                  >
                    {trip.objectives.slice(0, 4).map((obj) => (
                      <Chip
                        key={obj.id ?? obj.name}
                        label={obj.name}
                        size="small"
                        clickable={false}
                        sx={{
                          bgcolor: obj.badgeColor ?? '#C8F7D8',
                          pointerEvents: 'none',
                          fontSize: 11,
                          height: 22,
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              )}
            </Card>
          );
        })}

      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={openShareDialog}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Share2 size={16} />
            <Typography variant="body2">
              {translate(isSelectedTripPublic ? 'trip.actions.unshare' : 'trip.actions.share')}
            </Typography>
          </Stack>
        </MenuItem>
        <MenuItem onClick={openDeleteDialog}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Trash2 size={16} />
            <Typography variant="body2">{translate('trip.actions.delete')}</Typography>
          </Stack>
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={openShareConfirm}
        onClose={() => setOpenShareConfirm(false)}
        onConfirm={handleConfirmShare}
        confirmLabel={isSelectedTripPublic ? 'trip.actions.unshare' : 'trip.actions.share'}
        confirmLoading={isUpdatingVisibility}
        content={
          <Stack spacing={1}>
            <Typography variant="body1" fontWeight={600}>
              {translate(
                isSelectedTripPublic ? 'trip.confirm.unshare.title' : 'trip.confirm.share.title'
              )}{' '}
              ({selectedTripName})
            </Typography>

            <Typography variant="body2">
              {translate(
                isSelectedTripPublic ? 'trip.confirm.unshare.body' : 'trip.confirm.share.body'
              )}
            </Typography>

            <Box
              component="ul"
              sx={{ m: 0, pl: 2.5, listStyleType: 'disc', listStylePosition: 'outside' }}
            >
              {sharedDataKeys.map((key) => (
                <Typography component="li" variant="body2" key={key} sx={{ display: 'list-item' }}>
                  {translate(key)}
                </Typography>
              ))}
            </Box>
          </Stack>
        }
      />

      <ConfirmDialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        confirmLabel="trip.actions.delete"
        color="error"
        confirmLoading={isDeletingTrip}
        content={
          <Stack spacing={1}>
            <Typography variant="body1" fontWeight={600}>
              {translate('trip.confirm.delete.title')} ({selectedTripName})
            </Typography>

            <Box component="ul">
              <Typography component="li" variant="body2">
                {translate('trip.confirm.delete.body')} ({translate('trip.confirm.delete_warning')})
              </Typography>
            </Box>
          </Stack>
        }
      />
    </Box>
  );
};

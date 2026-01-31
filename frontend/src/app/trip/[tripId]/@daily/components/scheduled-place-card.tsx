'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { Menu, Send, Star, Trash2 as Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Draggable } from '@hello-pangea/dnd';

import { SwipeReveal } from '@/components/common/card';
import { ScheduledPlace } from '@/api/trips';

import { sanitizeStyle } from '@/app/trip/[tripId]/@daily/helpers/sanitize-transform';
import { tokens } from '@/providers/theme/design-tokens';
import { PLACEHOLDER_IMAGE } from '@/constants/link';
import { Locale } from '@/store/i18n-slice';
import { ConfirmDialog } from '@/components/common/dialog';
import { useRemoveScheduledPlace } from '@/app/trip/[tripId]/@daily/hooks/use-scheduled-place-mutation';
import { useDispatch } from 'react-redux';
import { removeScheduledPlace } from '@/store/trip-detail-slice';

type ScheduledPlaceCardProps = {
  planId: number;
  scheduledPlace: ScheduledPlace;
  locale: Locale;
  index: number;
};

const ScheduledPlaceCard = ({ planId, scheduledPlace, locale, index }: ScheduledPlaceCardProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('trip_overview');
  const params = useParams<{ tripId: string }>();

  const tripId = Number(params.tripId);
  const place = scheduledPlace.ggmp;
  const { name, desc } =
    locale === 'en'
      ? { name: place.enName, desc: place.enDescription }
      : { name: place.thName, desc: place.thDescription };

  const [isRemoveDialogOpened, setIsRemoveDialogOpened] = useState(false);
  const { mutate: remove, isPending: isRemoving } = useRemoveScheduledPlace();

  const openDeleteDialogButton = (
    <IconButton
      aria-label="delete place"
      onClick={() => setIsRemoveDialogOpened(true)}
      size="large"
      sx={{ color: 'common.white' }}
    >
      <Trash size={20} />
    </IconButton>
  );

  const confirmRemove = () => {
    remove(
      { tripId, placeId: scheduledPlace.id },
      {
        onSuccess: () => {
          dispatch(removeScheduledPlace({ planId, placeId: scheduledPlace.id }));
        },
      }
    );
  };

  return (
    <>
      <Draggable draggableId={String(scheduledPlace.id)} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={sanitizeStyle(provided.draggableProps.style)}
          >
            <SwipeReveal
              actionNode={openDeleteDialogButton}
              actionWidth={80}
              actionSide="right"
              actionSx={{ bgcolor: 'error.main' }}
              cardSx={{ py: 2, pl: 2, pr: 0 }}
            >
              <Box
                onClick={() => {}}
                sx={{
                  display: 'flex',
                  gap: 1,
                  flex: 1,
                  minWidth: 0,
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                    mr: 1,
                    flexShrink: 0,
                  }}
                  {...provided.dragHandleProps}
                >
                  <Menu size={21} color={tokens.color.textSecondary} />
                </Box>

                <Box
                  sx={{
                    width: 75,
                    height: 65,
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                    mr: 0.5,
                  }}
                >
                  <Image
                    src={place.defaultPicUrl ?? PLACEHOLDER_IMAGE}
                    alt={name || 'place image'}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="75px"
                    unoptimized
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', pr: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        flex: 1,
                        minWidth: 0,

                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',

                        overflow: 'hidden',
                        wordBreak: 'break-word',
                      }}
                    >
                      {name}
                    </Typography>

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Send size={14} />}
                      sx={{
                        flexShrink: 0,
                        height: 24,
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        borderRadius: '0.25rem',
                      }}
                    >
                      เปิดแผนที่
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                    <Star size={14} fill={tokens.color.warning} strokeWidth={0} />
                    <Typography variant="subtitle2" color="warning" sx={{ ml: 0.5 }}>
                      {Number(place.rating).toFixed(1)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex' }}>
                    <Typography variant="caption" align="left" sx={{ display: 'block' }}>
                      {desc}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </SwipeReveal>
          </div>
        )}
      </Draggable>

      <ConfirmDialog
        open={isRemoveDialogOpened}
        onClose={() => setIsRemoveDialogOpened(false)}
        onConfirm={confirmRemove}
        content={<Typography>{t('sectionCard.dailyPlan.remove.confirm_message')}</Typography>}
        confirmLabel={t('sectionCard.dailyPlan.remove.confirm_label')}
        confirmLoading={isRemoving}
        color="error"
      />
    </>
  );
};

export default ScheduledPlaceCard;

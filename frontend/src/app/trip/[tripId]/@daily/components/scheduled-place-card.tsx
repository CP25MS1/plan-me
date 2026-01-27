import Image from 'next/image';
import { Box, IconButton, Typography, Button } from '@mui/material';
import { Menu, Star, Trash2 as Trash, Send } from 'lucide-react';

import { SwipeReveal } from '@/components/common/card';
import { ScheduledPlace } from '@/api/trips';

import { tokens } from '@/providers/theme/design-tokens';
import { PLACEHOLDER_IMAGE } from '@/constants/link';
import { Locale } from '@/store/i18n-slice';
import React from 'react';

type ScheduledPlaceCardProps = {
  scheduledPlace: ScheduledPlace;
  locale: Locale;
};

const ScheduledPlaceCard = ({ scheduledPlace, locale }: ScheduledPlaceCardProps) => {
  const place = scheduledPlace.ggmp;
  const { name, desc } =
    locale === 'en'
      ? { name: place.enName, desc: place.enDescription }
      : { name: place.thName, desc: place.thDescription };

  const openDeleteDialogButton = (
    <IconButton
      aria-label="delete place"
      onClick={() => {}}
      size="large"
      sx={{ color: 'common.white' }}
    >
      <Trash size={20} />
    </IconButton>
  );

  return (
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography noWrap variant="subtitle1">
              {name}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Send size={14} />}
              size="small"
              sx={{
                minHeight: 24,
                height: 24,
                px: 1,
                py: 0,
                fontSize: 12,
                lineHeight: 1,
                borderRadius: '0.7rem',
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
  );
};

export default ScheduledPlaceCard;

'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { Map, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PublicTemplateWishlistPlace } from '@/api/trip-templates';
import { useI18nSelector } from '@/store/selectors';
import { tokens } from '@/providers/theme/design-tokens';

type TemplateWishlistPlaceCardProps = {
  data: PublicTemplateWishlistPlace;
  onOpenDetailAction: () => void;
};

const TemplateWishlistPlaceCard = ({
  data,
  onOpenDetailAction,
}: TemplateWishlistPlaceCardProps) => {
  const { locale } = useI18nSelector();
  const { t: tCommon } = useTranslation('common');

  const placeName =
    locale === 'th' ? data.place.thName : data.place.enName || data.place.thName;

  const rating = data.place.rating;
  const showRating = rating >= 1;

  return (
    <Box
      onClick={onOpenDetailAction}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flex: 1,
        minWidth: 0,
        width: '100%',
        cursor: 'pointer',
        bgcolor: '#fff',
        borderRadius: 1,
        boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
        py: 2,
        pl: 3,
        pr: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
        <Map size={20} color={tokens.color.primary} />
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap variant="subtitle1">
            {placeName}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showRating ? (
          <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
            <Star size={16} fill={tokens.color.warning} strokeWidth={0} />
            <Typography variant="body2" color="warning" sx={{ ml: 0.5 }}>
              {Number(rating).toFixed(1)}
            </Typography>
          </Box>
        ) : null}

        <Box
          sx={{
            width: 72,
            height: 56,
            borderRadius: 1,
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0,
            mr: 0.5,
          }}
        >
          {data.place.defaultPicUrl ? (
            <Image
              src={data.place.defaultPicUrl}
              alt={placeName || 'place image'}
              fill
              style={{ objectFit: 'cover' }}
              sizes="72px"
              unoptimized
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.200',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {tCommon('empty.image')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TemplateWishlistPlaceCard;

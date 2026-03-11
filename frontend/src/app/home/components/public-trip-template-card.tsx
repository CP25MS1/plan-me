'use client';

import React from 'react';
import { Card, CardMedia, Box, Typography, Chip, Button } from '@mui/material';
import { PublicTripTemplateListItem } from '@/api/trip-templates/type';
import { useRouter } from 'next/navigation';
import { TruncatedTooltip } from '@/components/atoms';
interface Props {
  template: PublicTripTemplateListItem;
}

const PublicTripTemplateCard = ({ template }: Props) => {
  const router = useRouter();
  const truncatedTripName =
    template.tripName.length > 30 ? template.tripName.slice(0, 30) + '...' : template.tripName;
  return (
    <Card
      onClick={() => router.push('/home')}
      sx={{
        width: '100%',
        height: 170,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {/* background image */}
      <CardMedia
        component="img"
        image={template.coverImageUrl}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.0))',
        }}
      />

      {/* trip name (top-left) */}
      <Box
        sx={{
          position: 'absolute',
          top: 2,
          left: 12,
          maxWidth: '70%',
          color: 'white',
          fontWeight: 700,
          fontSize: 24,
          textShadow: '0 2px 6px rgba(0,0,0,0.6)',
        }}
      >
        <TruncatedTooltip text={truncatedTripName} />
      </Box>

      {/* days badge (top-right) */}
      <Chip
        label={`${template.dayCount} วัน`}
        size="small"
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          bgcolor: 'rgba(255,255,255,0.60)',
          color: 'black',
          fontWeight: 800,
          height: 28,
          fontSize: 12,
        }}
      />

      {/* bottom content */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 0.9,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.6,
          color: 'white',
        }}
      >
        {/* objectives */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {template.objectives?.map((obj, idx) => {
            const truncated = obj.name.length > 25 ? obj.name.slice(0, 25) + '...' : obj.name;

            return (
              <Chip
                key={idx}
                label={<TruncatedTooltip text={truncated} />}
                size="small"
                sx={{
                  bgcolor: obj.badgeColor ?? 'rgba(255,255,255,0.2)',
                  color: '#000',
                  fontWeight: 600,
                  height: 24,
                  fontSize: 12,
                  maxWidth: 140,
                }}
              />
            );
          })}
        </Box>

        {/* bottom row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2">เเชร์โดย {template.owner?.username ?? 'Unknown'}</Typography>
          <Button
            size="small"
            sx={{
              color: 'black',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: 'rgba(255,255,255,0.60)',
              height: 28,
              fontSize: 12,
              px: 1.5,
              borderRadius: 4,
              minWidth: 0,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.60)',
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              router.push('/home');
            }}
          >
            สำรวจทริป
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default PublicTripTemplateCard;

import { Box, Divider, Grid, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import Image from 'next/image';

import { FullScreenSlideDialog } from '@/components/common/dialog';
import { PLACEHOLDER_IMAGE } from '@/constants/link';
import { useGetPlaceById } from '@/app/trip/[tripId]/hooks/use-search-for-places';
import PlaceOverview from './place-overview';
import React, { ReactNode } from 'react';
import PlaceLocationInfo from '@/app/trip/[tripId]/components/place-details/place-location-info';
import PlaceNoteAction from '@/app/trip/[tripId]/components/place-details/place-note-action';

type DialogProps = {
  isOpened: boolean;
  onClose: () => void;
};

type PlaceDetailsProps = {
  ggmpId: string;
  notableProps?: {
    notes: string;
    onSave: (notes: string) => void;
  };
  cta?: ReactNode;
};

const PlaceDetailsDialog = ({
  isOpened,
  onClose,
  ggmpId,
  notableProps,
  cta,
}: DialogProps & PlaceDetailsProps) => {
  const { data: place } = useGetPlaceById(ggmpId);

  if (!place) return <></>;

  return (
    <FullScreenSlideDialog isOpened={isOpened} onClose={onClose}>
      {({ onClose }) => (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'end' }}>
            <IconButton size="small" onClick={onClose} aria-label="Close" sx={{ paddingX: 0 }}>
              <X size={21} />
            </IconButton>
          </Box>

          <Grid container spacing={2} alignItems="flex-start" paddingTop="0.5rem">
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 220, md: 320 },
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={place.defaultPicUrl ?? PLACEHOLDER_IMAGE}
                  alt={place.thName || place.enName}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <PlaceOverview place={place} />

              <Divider sx={{ my: 2 }} />

              <PlaceLocationInfo place={place} />

              <Divider sx={{ my: 2 }} />

              {notableProps && (
                <PlaceNoteAction notes={notableProps.notes} onSave={notableProps.onSave} />
              )}
            </Grid>
          </Grid>

          <Box sx={{ mt: 'auto' }}>{cta}</Box>
        </Box>
      )}
    </FullScreenSlideDialog>
  );
};

export default PlaceDetailsDialog;

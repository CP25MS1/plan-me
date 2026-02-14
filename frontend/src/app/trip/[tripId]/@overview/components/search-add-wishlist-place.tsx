'use client';

import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { MapPin, PlusIcon, Search } from 'lucide-react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { BackButton } from '@/components/button';
import { useAddWishlistPlace, useSearchForPlaces } from '../hooks';
import { tokens } from '@/providers/theme/design-tokens';
import { addWishlistPlace } from '@/store/trip-detail-slice';
import PlaceDetailsDialog from '../../components/place-details/place-details-dialog';

type SearchAddWishlistPlaceProps = {
  tripId: number;
  onCloseAction: () => void;
};

export const SearchAddWishlistPlace = ({ tripId, onCloseAction }: SearchAddWishlistPlaceProps) => {
  const dispatch = useDispatch();
  const [value, setValue] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation('trip_overview');
  const { t: tCommon } = useTranslation('common');

  const [selectedGgmpId, setSelectedGgmpId] = useState<string | null>(null);

  useEffect(() => {
    if (timerRef.current) globalThis.clearTimeout(timerRef.current);
    timerRef.current = globalThis.setTimeout(() => setDebouncedQ(value), 1000);
    return () => {
      if (timerRef.current) globalThis.clearTimeout(timerRef.current);
    };
  }, [value]);

  const { data: places = [], isFetching, isLoading } = useSearchForPlaces(debouncedQ.trim());

  const mutation = useAddWishlistPlace();

  const handleAdd = (ggmpId: string | null) => {
    if (mutation.isPending || !ggmpId) return;
    mutation.mutate(
      { tripId, ggmpId },
      {
        onSuccess: (data) => {
          dispatch(addWishlistPlace(data));
          onCloseAction();
        },
      }
    );
  };

  const content = (() => {
    if (isFetching || isLoading) {
      return (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      );
    }

    if (places.length === 0 && debouncedQ.length >= 3) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={220}
          py={6}
          gap={1}
        >
          <MapPin size={56} style={{ opacity: 0.12 }} />
          <Typography variant="h6" color="text.primary">
            {tCommon('empty.no_results')}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {tCommon('empty.no_results_cta_text')}
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {places.map((p) => (
          <Fragment key={p.ggmpId}>
            <ListItem
              onClick={() => setSelectedGgmpId(p.ggmpId)}
              alignItems="center"
              sx={{ gap: 2, '& .MuiListItem-root': { padding: '0' } }}
            >
              <ListItemIcon sx={{ minWidth: '0' }}>
                <MapPin color={tokens.color.primary} />
              </ListItemIcon>

              <ListItemText
                primary={p.name}
                secondary={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {p.province ?? '-'}
                    </Typography>
                  </Box>
                }
              />

              {p.defaultPicUrl ? (
                <Box sx={{ width: 56, height: 56, position: 'relative', flex: '0 0 56px' }}>
                  <Image
                    src={p.defaultPicUrl}
                    alt={p.name ?? ''}
                    fill
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                </Box>
              ) : null}

              {mutation.isPending ? <CircularProgress size={18} /> : null}
            </ListItem>
            <Divider />

            {p.ggmpId && selectedGgmpId === p.ggmpId && (
              <PlaceDetailsDialog
                isOpened={!!selectedGgmpId}
                onClose={() => setSelectedGgmpId(null)}
                ggmpId={p.ggmpId}
                cta={
                  <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                    <Button
                      variant="contained"
                      startIcon={<PlusIcon />}
                      onClick={() => handleAdd(p.ggmpId)}
                    >
                      เพิ่มสถานที่
                    </Button>
                  </Box>
                }
              />
            )}
          </Fragment>
        ))}
      </List>
    );
  })();

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'background.paper',
          py: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1} px={0.5}>
          <BackButton className="px-0!" onBack={onCloseAction} />

          <Box flex={1}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('sectionCard.wishlistPlace.search.placeholder')}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box>{content}</Box>
    </Container>
  );
};

export default SearchAddWishlistPlace;

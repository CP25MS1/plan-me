'use client';

import { useEffect, useRef, useState, Fragment } from 'react';
import {
  Container,
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Search, MapPin } from 'lucide-react';
import Image from 'next/image';

import { BackButton } from '@/components/button';
import { useSearchForPlaces, useAddWishlistPlace } from '../hooks';
import { tokens } from '@/providers/theme/design-tokens';

type SearchAddWishlistPlaceProps = {
  tripId: number;
  onCloseAction: () => void;
};

export const SearchAddWishlistPlace = ({ tripId, onCloseAction }: SearchAddWishlistPlaceProps) => {
  const [value, setValue] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        onSuccess: () => onCloseAction(),
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
            No results
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Try a different keyword or check your spelling.
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {places.map((p) => (
          <Fragment key={p.ggmpId}>
            <ListItem
              onClick={() => {
                if (mutation.isPending) return;
                handleAdd(p.ggmpId);
              }}
              alignItems="center"
              sx={{ gap: 2 }}
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
              placeholder="Search places..."
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

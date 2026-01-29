'use client';

import { useEffect, useRef, useState } from 'react';

import { Box, Container, Dialog, InputAdornment, TextField } from '@mui/material';
import { BackButton } from '@/components/button';
import { Search } from 'lucide-react';

import useSearchForPlaces from '@/app/trip/[tripId]/hooks/use-search-for-places';
import SuggestionFromWishlistSection from './suggestion-from-wishlist-section';
import { createSlideTransition } from '@/components/common/transition';
import SuggestionFromReservationSection from './suggestion-from-reservation-section';
import SearchResultSection from './search-result-section';

type DialogProps = {
  isOpened: boolean;
  onClose: () => void;
};

const SearchForScheduledPlacesDialog = ({ isOpened, onClose }: DialogProps) => {
  const SlideUpTransition = createSlideTransition('up');

  const [value, setValue] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: searchResult = [], isFetching, isLoading } = useSearchForPlaces(debouncedQ.trim());
  const isSearching = isFetching || isLoading;

  useEffect(() => {
    if (timerRef.current) globalThis.clearTimeout(timerRef.current);
    timerRef.current = globalThis.setTimeout(() => setDebouncedQ(value), 1000);
    return () => {
      if (timerRef.current) globalThis.clearTimeout(timerRef.current);
    };
  }, [value]);

  return (
    <Dialog
      fullScreen
      open={isOpened}
      onClose={onClose}
      slots={{
        transition: SlideUpTransition,
      }}
    >
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
            <BackButton className="px-0!" onBack={onClose} />

            <Box flex={1}>
              <TextField
                fullWidth
                size="small"
                placeholder={''}
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          <SuggestionFromWishlistSection title={'สถานที่ที่อยากไป'} />
          <SuggestionFromReservationSection title={'ข้อมูลการจอง'} />
          <SearchResultSection
            title={'สถานที่อื่น ๆ'}
            debouncedQ={debouncedQ}
            result={searchResult.map((detail) => ({
              ggmpId: detail.ggmpId ?? '',
              name: detail.name ?? '',
              address: detail.address ?? '',
              defaultPicUrl: detail.defaultPicUrl ?? '',
            }))}
          />
        </Box>
      </Container>
    </Dialog>
  );
};

export default SearchForScheduledPlacesDialog;

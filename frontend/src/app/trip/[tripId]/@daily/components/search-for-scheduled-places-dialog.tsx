'use client';

import { useEffect, useRef, useState } from 'react';

import { Box, InputAdornment, TextField } from '@mui/material';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import useSearchForPlaces from '@/app/trip/[tripId]/hooks/use-search-for-places';
import SuggestionFromWishlistSection from './suggestion-from-wishlist-section';
import SuggestionFromReservationSection from './suggestion-from-reservation-section';
import SearchResultSection from './search-result-section';
import { BackButton } from '@/components/button';
import { FullScreenSlideDialog } from '@/components/common/dialog';

type DialogProps = {
  isOpened: boolean;
  onClose: () => void;
};

const SearchForScheduledPlacesDialog = ({ isOpened, onClose }: DialogProps) => {
  const { t } = useTranslation('trip_overview');

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

  useEffect(() => {
    if (!isOpened) {
      setValue('');
      setDebouncedQ('');
    }
  }, [isOpened]);

  return (
    <FullScreenSlideDialog isOpened={isOpened} onClose={onClose}>
      {({ onClose }) => (
        <Box sx={{ py: 3 }}>
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <SuggestionFromWishlistSection title={'สถานที่ที่อยากไป'} q={debouncedQ} />
            <SuggestionFromReservationSection title={'ข้อมูลการจอง'} q={debouncedQ} />
            <SearchResultSection
              title={'สถานที่อื่น ๆ'}
              debouncedQ={debouncedQ}
              isSearching={isSearching}
              result={searchResult.map((detail) => ({
                ggmpId: detail.ggmpId ?? '',
                name: detail.name ?? '',
                address: detail.address ?? '',
                defaultPicUrl: detail.defaultPicUrl ?? '',
              }))}
            />
          </Box>
        </Box>
      )}
    </FullScreenSlideDialog>
  );
};

export default SearchForScheduledPlacesDialog;

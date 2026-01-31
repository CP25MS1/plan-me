import { Fragment } from 'react';
import { Box, CircularProgress, List, Typography } from '@mui/material';
import { MapPin } from 'lucide-react';

import { tokens } from '@/providers/theme/design-tokens';
import { createCustomTitle } from '../helpers/create-custom-title-for-search-section';
import SectionCard from '@/components/trip/overview/section-card';
import AddibleWishlistCard from './addible-wishlist-card';
import { useTranslation } from 'react-i18next';
import { useTripSelector } from '@/store/selectors';

type SectionProps = {
  title: string;
  debouncedQ: string;
  isSearching: boolean;
  result: {
    ggmpId: string;
    name: string;
    address: string;
    defaultPicUrl: string;
  }[];
};

const SearchResultSection = ({ title, debouncedQ, isSearching, result }: SectionProps) => {
  const { t } = useTranslation('common');
  const qty = result.length;

  const { tripOverview } = useTripSelector();
  const wishlistPlaces = tripOverview?.wishlistPlaces ?? [];

  const CustomTitle = createCustomTitle({
    startIcon: <MapPin size={25} color={tokens.color.primary} />,
    title,
    qty,
  });

  if (isSearching)
    return (
      <SectionCard title={CustomTitle}>
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      </SectionCard>
    );

  return qty === 0 && debouncedQ.length >= 3 && !isSearching ? (
    <>
      {CustomTitle}
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
          {t('empty.no_results')}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {t('empty.no_results_cta_text')}
        </Typography>
      </Box>
    </>
  ) : (
    <SectionCard title={CustomTitle}>
      <List>
        {result.map((detail) => {
          if (!detail.ggmpId) return <></>;
          const wishlistResult = wishlistPlaces.find((wp) => wp.place.ggmpId === detail.ggmpId);
          const inWishlist = !!wishlistResult;
          return (
            <Fragment key={detail.ggmpId}>
              <AddibleWishlistCard
                ggmpId={detail.ggmpId}
                {...(inWishlist ? { placeId: wishlistResult.id } : {})}
                name={detail.name}
                address={detail.address}
                defaultPicUrl={detail.defaultPicUrl}
                inWishlist={inWishlist}
              />
            </Fragment>
          );
        })}
      </List>
    </SectionCard>
  );
};

export default SearchResultSection;

import { Fragment } from 'react';
import { Box, List, Typography } from '@mui/material';
import { MapPin } from 'lucide-react';

import { tokens } from '@/providers/theme/design-tokens';
import { createCustomTitle } from '../helpers/create-custom-title-for-search-section';
import SectionCard from '@/components/trip/overview/section-card';
import AddibleWishlistCard from './addible-wishlist-card';

type SectionProps = {
  title: string;
  debouncedQ: string;
  result: {
    ggmpId: string;
    name: string;
    address: string;
    defaultPicUrl: string;
  }[];
};

const SearchResultSection = ({ title, debouncedQ, result }: SectionProps) => {
  const qty = result.length;

  const CustomTitle = createCustomTitle({
    startIcon: <MapPin size={25} color={tokens.color.primary} />,
    title,
    qty,
  });

  return qty === 0 && debouncedQ.length >= 3 ? (
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
          {'Not Found'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {'Not Found'}
        </Typography>
      </Box>
    </>
  ) : (
    <SectionCard title={CustomTitle}>
      <List>
        {result.map((detail) => {
          if (!detail.ggmpId) return <></>;

          return (
            <Fragment key={detail.ggmpId}>
              <AddibleWishlistCard
                ggmpId={detail.ggmpId}
                name={detail.name}
                address={detail.address}
                defaultPicUrl={detail.defaultPicUrl}
              />
            </Fragment>
          );
        })}
      </List>
    </SectionCard>
  );
};

export default SearchResultSection;

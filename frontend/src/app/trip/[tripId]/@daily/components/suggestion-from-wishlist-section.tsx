import { Heart } from 'lucide-react';

import SectionCard from '@/components/trip/overview/section-card';
import { tokens } from '@/providers/theme/design-tokens';
import { useI18nSelector, useTripSelector } from '@/store/selectors';
import { createCustomTitle } from '../helpers/create-custom-title-for-search-section';
import { List } from '@mui/material';
import { Fragment } from 'react';
import AddibleWishlistCard from './addible-wishlist-card';
import { filterWishlistPlacesByName } from '@/app/trip/[tripId]/@daily/helpers/search-filter';

type SectionProps = {
  title: string;
  q: string;
};

const SuggestionFromWishlistSection = ({ title, q }: SectionProps) => {
  const { locale } = useI18nSelector();
  const { tripOverview } = useTripSelector();
  const wishlistPlaces = tripOverview?.wishlistPlaces ?? [];
  const searchResult = filterWishlistPlacesByName(wishlistPlaces, q);
  const qty = searchResult.length;

  const CustomTitle = createCustomTitle({
    startIcon: <Heart size={25} color={tokens.color.primary} fill={tokens.color.primary} />,
    title,
    qty,
  });

  return (
    qty > 0 && (
      <SectionCard title={CustomTitle}>
        <List>
          {searchResult.map((wp) => {
            const place = wp.place;
            const name = locale === 'en' ? place.en.name : place.th.name;
            return (
              <Fragment key={wp.id}>
                <AddibleWishlistCard
                  ggmpId={place.ggmpId}
                  placeId={wp.id}
                  name={name}
                  address={place.en.address}
                  defaultPicUrl={place.defaultPicUrl}
                  inWishlist
                />
              </Fragment>
            );
          })}
        </List>
      </SectionCard>
    )
  );
};

export default SuggestionFromWishlistSection;

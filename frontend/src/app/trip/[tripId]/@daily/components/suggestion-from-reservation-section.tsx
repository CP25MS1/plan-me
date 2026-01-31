import { Fragment } from 'react';
import { List } from '@mui/material';
import { BookMarked } from 'lucide-react';

import SectionCard from '@/components/trip/overview/section-card';
import { tokens } from '@/providers/theme/design-tokens';
import { useI18nSelector, useTripSelector } from '@/store/selectors';
import { createCustomTitle } from '../helpers/create-custom-title-for-search-section';
import AddibleWishlistCard from './addible-wishlist-card';
import { useGetReservationPlaces } from '@/app/trip/[tripId]/hooks/use-get-reservation-places';
import { PLACEHOLDER_IMAGE } from '@/constants/link';
import { filterGoogleMapPlacesByName } from '@/app/trip/[tripId]/@daily/helpers/search-filter';

type SectionProps = {
  title: string;
  q: string;
};

const SuggestionFromReservationSection = ({ title, q }: SectionProps) => {
  const { locale } = useI18nSelector();
  const { tripOverview } = useTripSelector();

  const { data: reservationPlaces } = useGetReservationPlaces(tripOverview?.id ?? 0);
  const wishlistPlaces = tripOverview?.wishlistPlaces ?? [];
  const searchResult = filterGoogleMapPlacesByName(reservationPlaces ?? [], q);
  const qty = searchResult.length;

  const CustomTitle = createCustomTitle({
    startIcon: <BookMarked size={25} color={tokens.color.primary} />,
    title,
    qty,
  });

  return (
    qty > 0 && (
      <SectionCard title={CustomTitle}>
        <List>
          {searchResult.map((place) => {
            const name = locale === 'en' ? place.enName : place.thName;
            const wishlistReservation = wishlistPlaces.find(
              (wp) => wp.place.ggmpId === place.ggmpId
            );
            const inWishlist = !!wishlistReservation;
            return (
              <Fragment key={place.ggmpId}>
                <AddibleWishlistCard
                  ggmpId={place.ggmpId}
                  {...(inWishlist ? { placeId: wishlistReservation.id } : {})}
                  name={name}
                  address={place.enAddress}
                  defaultPicUrl={place.defaultPicUrl ?? PLACEHOLDER_IMAGE}
                  inWishlist={inWishlist}
                />
              </Fragment>
            );
          })}
        </List>
      </SectionCard>
    )
  );
};

export default SuggestionFromReservationSection;

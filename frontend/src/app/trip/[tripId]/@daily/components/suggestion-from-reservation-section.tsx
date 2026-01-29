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

type SectionProps = {
  title: string;
};

const SuggestionFromReservationSection = ({ title }: SectionProps) => {
  const { locale } = useI18nSelector();
  const { tripOverview } = useTripSelector();

  const { data: reservationPlaces } = useGetReservationPlaces(tripOverview?.id ?? 0);

  const qty = reservationPlaces?.length ?? 0;

  const CustomTitle = createCustomTitle({
    startIcon: <BookMarked size={25} color={tokens.color.primary} />,
    title,
    qty,
  });

  return (
    qty > 0 && (
      <SectionCard title={CustomTitle}>
        <List>
          {(reservationPlaces ?? []).map((place) => {
            const name = locale === 'en' ? place.enName : place.thName;
            return (
              <Fragment key={place.ggmpId}>
                <AddibleWishlistCard
                  ggmpId={place.ggmpId}
                  name={name}
                  address={place.enAddress}
                  defaultPicUrl={place.defaultPicUrl ?? PLACEHOLDER_IMAGE}
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

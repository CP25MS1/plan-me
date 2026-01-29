import { Fragment } from 'react';
import { List } from '@mui/material';
import { BookMarked } from 'lucide-react';

import SectionCard from '@/components/trip/overview/section-card';
import { tokens } from '@/providers/theme/design-tokens';
import { useI18nSelector, useTripSelector } from '@/store/selectors';
import { createCustomTitle } from '../helpers/create-custom-title-for-search-section';
import AddibleWishlistCard from './addible-wishlist-card';
import { useGetReservationPlaces } from '@/app/trip/[tripId]/hooks/use-get-reservation-places';
import { ReservationDto } from '@/api/reservations';
import { GoogleMapPlace } from '@/api/places';
import { PLACEHOLDER_IMAGE } from '@/constants/link';

const buildGoogleMapPlaceMap = (
  reservations: ReservationDto[],
  places: GoogleMapPlace[]
): Map<string, GoogleMapPlace> => {
  const ggmpIdSet = new Set(
    reservations.map((r) => r.ggmpId).filter((id): id is string => Boolean(id))
  );

  const placeMap = new Map<string, GoogleMapPlace>();

  for (const place of places) {
    if (ggmpIdSet.has(place.ggmpId)) {
      placeMap.set(place.ggmpId, place);
    }
  }

  return placeMap;
};

type SectionProps = {
  title: string;
};

const SuggestionFromReservationSection = ({ title }: SectionProps) => {
  const { locale } = useI18nSelector();
  const { tripOverview } = useTripSelector();
  const reservations = tripOverview?.reservations ?? [];
  const qty = reservations.length;

  const CustomTitle = createCustomTitle({
    startIcon: <BookMarked size={25} color={tokens.color.primary} />,
    title,
    qty,
  });

  const { data: reservationPlaces } = useGetReservationPlaces(tripOverview?.id ?? 0);
  const ggmpMap = buildGoogleMapPlaceMap(reservations, reservationPlaces ?? []);

  return (
    qty > 0 && (
      <SectionCard title={CustomTitle}>
        <List>
          {reservations.map((reservation) => {
            const place = ggmpMap.get(reservation.ggmpId ?? '');

            if (!place) return <></>;

            const name = locale === 'en' ? place.enName : place.thName;
            return (
              <Fragment key={reservation.id}>
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

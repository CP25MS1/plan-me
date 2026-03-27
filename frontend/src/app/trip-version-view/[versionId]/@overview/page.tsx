'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Box, List, ListItem, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SectionCard from '@/components/trip/overview/section-card';
import MiniMap from '@/app/trip/[tripId]/components/maps/mini-map';
import PlaceDetailsDialog from '@/app/trip/[tripId]/components/place-details/place-details-dialog';
import TemplateWishlistPlaceCard from '../components/version-wishlist-place-card';
import { useFullPageLoading } from '@/components/full-page-loading';
import { useVersionTrip } from '../hooks/use-version-trip';
import { PublicTemplateWishlistPlace } from '@/api/trip-templates';

import { FlightDetails } from '@/api/reservations/type';
import LodgingCard from '@/app/trip/[tripId]/@overview/components/cards/lodging';
import RestaurantCard from '@/app/trip/[tripId]/@overview/components/cards/restaurant';
import FlightCard from '@/app/trip/[tripId]/@overview/components/cards/flight';
import TrainCard from '@/app/trip/[tripId]/@overview/components/cards/train';
import BusCard from '@/app/trip/[tripId]/@overview/components/cards/bus';
import FerryCard from '@/app/trip/[tripId]/@overview/components/cards/ferry';
import CarRentalCard from '@/app/trip/[tripId]/@overview/components/cards/carrental';

const VersionOverviewPage = () => {
  const { t } = useTranslation('trip_overview');
  const params = useParams<{ versionId: string }>();
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get('tripId') || '';
  const tripId = Number(tripIdParam);
  const versionId = Number(params.versionId);
  const { snapshot, mapPlans, wishlistPlaces, isLoading } = useVersionTrip(tripId, versionId);
  const reservations = snapshot?.reservations ?? [];
  const hasReservation = reservations.length > 0;
  const { FullPageLoading } = useFullPageLoading();

  const [selectedGgmpId, setSelectedGgmpId] = useState<string | null>(null);

  const hasWishlist = wishlistPlaces.length > 0;

  if (isLoading || !snapshot) return <FullPageLoading />;

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <SectionCard title={t('sectionCard.map')}>
          <Box>
            <MiniMap selectedDay="ALL" viewOnly dailyPlans={mapPlans} />
          </Box>
        </SectionCard>

        <SectionCard title={t('sectionCard.reservation.title')} asEmpty={!hasReservation}>
          {hasReservation ? (
            <List>
              {reservations
                .slice()
                .sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0))
                .map((res) => (
                  <ListItem key={res.id} sx={{ p: 0, mb: 2 }}>
                    <Box sx={{ width: '100%' }}>
                      {res.type === 'LODGING' && <LodgingCard data={{ ...res.details, ...res }} />}
                      {res.type === 'RESTAURANT' && (
                        <RestaurantCard data={{ ...res.details, ...res }} />
                      )}
                      {res.type === 'TRAIN' && <TrainCard data={{ ...res.details, ...res }} />}
                      {res.type === 'BUS' && <BusCard data={{ ...res.details, ...res }} />}
                      {res.type === 'FERRY' && <FerryCard data={{ ...res.details, ...res }} />}
                      {res.type === 'CAR_RENTAL' && (
                        <CarRentalCard data={{ ...res.details, ...res }} />
                      )}

                      {res.type === 'FLIGHT' && (
                        <FlightCard
                          data={{ ...(res.details as FlightDetails), ...res }}
                          passengerIndex={0}
                        />
                      )}
                    </Box>
                  </ListItem>
                ))}
            </List>
          ) : (
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีข้มูลการจองในเวอร์ชันนี้
              </Typography>
            </Box>
          )}
        </SectionCard>

        <SectionCard title={t('sectionCard.wishlistPlace.title')} asEmpty={!hasWishlist}>
          {hasWishlist ? (
            <List>
              {wishlistPlaces.map((wp) => {
                const publicWp: PublicTemplateWishlistPlace = {
                  placeId: wp.id,
                  place: {
                    ggmpId: wp.place.ggmpId,
                    rating: wp.place.rating,
                    thName: wp.place.th.name,
                    thDescription: wp.place.th.description,
                    thAddress: wp.place.th.address,
                    enName: wp.place.en.name,
                    enDescription: wp.place.en.description,
                    enAddress: wp.place.en.address,
                    openingHours: wp.place.openingHours,
                    defaultPicUrl: wp.place.defaultPicUrl,
                  },
                };

                return (
                  <ListItem key={wp.place.ggmpId} sx={{ p: 0, mb: 2 }}>
                    <TemplateWishlistPlaceCard
                      data={publicWp}
                      onOpenDetailAction={() => setSelectedGgmpId(wp.place.ggmpId)}
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('template.empty.wishlist')}
              </Typography>
            </Box>
          )}
        </SectionCard>
      </Box>

      {selectedGgmpId && (
        <PlaceDetailsDialog
          isOpened={!!selectedGgmpId}
          onClose={() => setSelectedGgmpId(null)}
          ggmpId={selectedGgmpId}
        />
      )}
    </>
  );
};

export default VersionOverviewPage;

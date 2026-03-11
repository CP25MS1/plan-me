'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, List, ListItem, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SectionCard from '@/components/trip/overview/section-card';
import MiniMap from '@/app/trip/[tripId]/components/maps/mini-map';
import PlaceDetailsDialog from '@/app/trip/[tripId]/components/place-details/place-details-dialog';
import { useTemplateTrip } from '../hooks/use-template-trip';
import TemplateWishlistPlaceCard from '../components/template-wishlist-place-card';
import { useFullPageLoading } from '@/components/full-page-loading';

const TemplateOverviewPage = () => {
  const router = useRouter();
  const { t } = useTranslation('trip_overview');
  const params = useParams<{ templateTripId: string }>();
  const templateTripId = Number(params.templateTripId);

  const { template, mapPlans, isLoading } = useTemplateTrip(templateTripId);
  const { FullPageLoading } = useFullPageLoading();

  const [selectedGgmpId, setSelectedGgmpId] = useState<string | null>(null);

  const wishlistPlaces = useMemo(() => template?.wishlistPlaces ?? [], [template]);
  const hasWishlist = wishlistPlaces.length > 0;

  if (isLoading || !template) return <FullPageLoading />;

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <SectionCard title={t('sectionCard.map')}>
          <Box onClick={() => router.push(`/trip-templates/${templateTripId}?tab=map`)}>
            <MiniMap selectedDay="ALL" viewOnly dailyPlans={mapPlans} />
          </Box>
        </SectionCard>

        <SectionCard
          title={t('sectionCard.wishlistPlace.title')}
          asEmpty={!hasWishlist}
        >
          {hasWishlist ? (
            <List>
              {wishlistPlaces.map((wp) => (
                <ListItem key={wp.placeId} sx={{ p: 0, mb: 2 }}>
                  <TemplateWishlistPlaceCard
                    data={wp}
                    onOpenDetailAction={() => setSelectedGgmpId(wp.place.ggmpId)}
                  />
                </ListItem>
              ))}
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

export default TemplateOverviewPage;

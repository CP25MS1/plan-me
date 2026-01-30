import { Box, Typography } from '@mui/material';
import { Clock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useI18nSelector } from '@/store/selectors';
import { GoogleMapPlace } from '@/api/places';
import { formatOpeningHours } from '@/app/trip/[tripId]/components/place-details/helpers/place-details-formatter';

const PlaceLocationInfo = ({ place }: { place: GoogleMapPlace }) => {
  const { locale } = useI18nSelector();
  const { t } = useTranslation('trip_overview');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box
          sx={{
            flex: '0 0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MapPin size={18} aria-hidden />
        </Box>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', ml: 1, flex: 1, wordBreak: 'break-word' }}
        >
          {locale === 'th' ? place.thAddress : place.enAddress}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box
          sx={{
            flex: '0 0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Clock size={18} aria-hidden />
        </Box>
        <Box sx={{ ml: 1, flex: 1 }}>
          {formatOpeningHours({ rawText: place.openingHours ?? '', locale, translate: t }).map(
            (line) => (
              <Typography
                key={line}
                variant="body2"
                sx={{ color: 'text.secondary', wordBreak: 'break-word' }}
              >
                {line}
              </Typography>
            )
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PlaceLocationInfo;

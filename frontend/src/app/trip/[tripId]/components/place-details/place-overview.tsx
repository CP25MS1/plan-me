import { Box, Typography } from '@mui/material';
import { Star } from 'lucide-react';
import { tokens } from '@/providers/theme/design-tokens';
import { useI18nSelector } from '@/store/selectors';
import { GoogleMapPlace } from '@/api/places';

const PlaceOverview = ({ place }: { place: GoogleMapPlace }) => {
  const { locale } = useI18nSelector();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, marginRight: '0.5rem' }}>
            {locale === 'th' ? place.thName : place.enName}
          </Typography>

          <Star size={21} fill={tokens.color.warning} strokeWidth={0} />
          <Typography variant="body1">{place.rating}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {locale === 'th' ? place.thDescription : place.enDescription}
        </Typography>
      </Box>
    </Box>
  );
};

export default PlaceOverview;

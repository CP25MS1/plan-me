'use client';

import { Box, Typography, keyframes } from '@mui/material';
import { Sparkles, FileSearch, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const scanAnimation = keyframes`
  0% { transform: translateY(0); opacity: 0.2; }
  50% { transform: translateY(40px); opacity: 1; }
  100% { transform: translateY(0); opacity: 0.2; }
`;

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.5; }
`;

export default function ExtractionLoading() {
  const { t } = useTranslation('trip_overview');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        py: 6,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box sx={{ position: 'relative', width: 80, height: 80 }}>
        {/* Main Icon Container */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            animation: `${bounceAnimation} 2s infinite ease-in-out`,
          }}
        >
          <FileSearch size={60} color="#25CF7A" strokeWidth={1.5} />
          
          {/* Scanning Line */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 5,
              right: 5,
              height: '3px',
              bgcolor: '#25CF7A',
              boxShadow: '0 0 10px #25CF7A',
              borderRadius: '2px',
              animation: `${scanAnimation} 2.5s infinite ease-in-out`,
            }}
          />
        </Box>

        {/* Decorative Sparkles */}
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            animation: `${rotateAnimation} 4s infinite linear`,
          }}
        >
          <Sparkles size={24} color="#FFD700" fill="#FFD700" />
        </Box>
      </Box>

      <Box>
        <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
          {t('Reservation.extractionLoading.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
          {t('Reservation.extractionLoading.description')}
        </Typography>
      </Box>
      
      {/* Mini Progress Indicator */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#25CF7A',
              animation: `${pulseAnimation} 1.2s infinite ease-in-out`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

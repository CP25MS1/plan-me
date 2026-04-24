'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';

interface FullPageErrorProps {
  code: number | string;
  message?: string;
  onBackHome?: () => void;
}

const FullPageError: React.FC<FullPageErrorProps> = ({ code, message, onBackHome }) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const defaultMessages: Record<number, string> = {
    404: t('errorPage.default.404'),
    403: t('errorPage.default.403'),
  };

  const handleBackHome = () => {
    if (onBackHome) {
      onBackHome();
    } else {
      router.push('/home');
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        px: 2,
      }}
    >
      <Card
        sx={{
          width: { xs: '90%', sm: 400 },
          borderRadius: 3,
          p: 3,
          textAlign: 'center',
          boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent>
          {/* Error Icon */}
          <Box sx={{ mb: 3 }}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />
          </Box>

          {/* Error Code */}
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            {code}
          </Typography>

          {/* Error Message */}
          <Typography variant="h3" sx={{ mb: 3, color: 'text.secondary' }}>
            {message || defaultMessages[Number(code)] || t('errorPage.default.generic')}
          </Typography>

          {/* Back Home Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              borderRadius: 2,
              py: 1.5,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: 16,
            }}
            onClick={handleBackHome}
          >
            {t('errorPage.backHome')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FullPageError;

{
  /* <FullPageError
  code={404}
  message="คุณถูกปฏิเสธการเข้าถึงหน้านี้"
  onBackHome={() => router.push('/home')}
/>; */
}

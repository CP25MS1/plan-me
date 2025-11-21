'use client';

import { useRouter } from 'next/navigation';
import { Container, Box, ButtonBase, TextField, InputAdornment } from '@mui/material';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <Container sx={{ paddingRight: '0rem' }}>
      <Box component={'header'} sx={{ paddingTop: '3rem', paddingRight: '1rem' }}>
        <ButtonBase
          onClick={() => router.push('/search')}
          sx={{
            display: 'block',
            width: '80%',
            borderRadius: '1.75rem',
          }}
        >
          <TextField
            fullWidth
            placeholder={t('placeholder.search')}
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'inherit',
              },
            }}
            slotProps={{
              input: {
                readOnly: true,
                startAdornment: (
                  <InputAdornment position={'start'}>
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
        </ButtonBase>
      </Box>
    </Container>
  );
};

export default HomePage;

'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useRouter } from 'next/navigation';

const TripForbiddenPage = () => {
  const router = useRouter();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
      px={2}
    >
      <Stack spacing={3} alignItems="center" maxWidth={420} textAlign="center">
        <Box
          width={72}
          height={72}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="50%"
          color="error.main"
        >
          <LockOutlinedIcon fontSize="large" />
        </Box>

        <Typography variant="h5" fontWeight={600}>
          ไม่สามารถเข้าถึงทริปนี้ได้
        </Typography>

        <Typography color="text.secondary">
          คุณยังไม่มีสิทธิ์เข้าดูทริปนี้ กรุณาติดต่อเจ้าของทริปเพื่อขอเป็นผู้ร่วมทริปก่อน
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => router.push('/home')}
          sx={{ mt: 1 }}
        >
          กลับไปหน้า Home
        </Button>
      </Stack>
    </Box>
  );
};

export default TripForbiddenPage;

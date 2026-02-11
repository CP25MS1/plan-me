'use client';

import { Avatar, Box, Button, Container, IconButton, Typography } from '@mui/material';
import { ArrowLeft, Check, X } from 'lucide-react';
import { PublicUserInfo } from '@/api/users';
import { useRouter } from 'next/navigation';

type InvitationActionPageProps = {
  inviter?: PublicUserInfo;
  tripName: string;
  isLoading?: boolean;
  onAccept: () => void;
  onReject: () => void;
  onBack?: () => void;
};

const InvitationActionPage = ({
  inviter,
  tripName,
  isLoading = false,
  onAccept,
  onReject,
  onBack,
}: InvitationActionPageProps) => {
  const router = useRouter();

  if (!inviter) return null;

  return (
    <Container>
      {/* Header */}
      <Box sx={{ height: 64, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onBack ? () => onBack() : () => router.back()}>
          <ArrowLeft size={22} />
        </IconButton>

        <Typography
          fontWeight={600}
          sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
        >
          คำเชิญเข้าร่วมทริป
        </Typography>
      </Box>

      {/* Inviter */}
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Avatar src={inviter.profilePicUrl} alt={inviter.username} sx={{ width: 96, height: 96 }} />

        <Typography fontSize={18} fontWeight={600} sx={{ mt: 2 }}>
          {inviter.username}
        </Typography>

        <Typography fontSize={14} color="text.secondary">
          {inviter.email}
        </Typography>
      </Box>

      {/* Message */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography fontSize={16} fontWeight={500}>
          เชิญคุณเข้าร่วมทริป {tripName}
        </Typography>
        <Typography fontSize={14} color="text.secondary" sx={{ mt: 0.5 }}>
          คุณสามารถตอบรับหรือปฏิเสธคำเชิญนี้ได้
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          size="large"
          startIcon={<X size={18} />}
          disabled={isLoading}
          onClick={onReject}
        >
          ปฏิเสธ
        </Button>

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<Check size={18} />}
          disabled={isLoading}
          onClick={onAccept}
        >
          ตอบรับ
        </Button>
      </Box>
    </Container>
  );
};

export default InvitationActionPage;

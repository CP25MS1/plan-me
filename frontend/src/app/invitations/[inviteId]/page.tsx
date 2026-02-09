'use client';

import { Avatar, Box, Button, Container, IconButton, Typography } from '@mui/material';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@/store';
import { useAcceptTripInvite, useRejectTripInvite } from '@/app/hooks';
import { removeInvitation } from '@/store/profile-slice';

const InvitationActionPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { inviteId } = useParams<{ inviteId: string }>();

  const tripId = Number(searchParams.get('tripId'));
  const tripName = searchParams.get('tripName');

  const pendingInvitations = useSelector((s: RootState) => s.profile.invitations);
  const invitation = pendingInvitations.find((i) => i.invitationId === Number(inviteId));

  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptTripInvite(tripId);
  const { mutate: rejectInvite, isPending: isRejecting } = useRejectTripInvite(tripId);

  if (!invitation) return null;

  const { inviter } = invitation;
  const isLoading = isAccepting || isRejecting;

  const handleSuccess = () => {
    dispatch(removeInvitation({ invitationId: invitation.invitationId }));
  };

  return (
    <Container>
      {/* Header */}
      <Box sx={{ height: 64, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => router.back()}>
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
          เชิญคุณเข้าร่วมทริป {tripName ?? ''}
        </Typography>
        <Typography fontSize={14} color="text.secondary" sx={{ mt: 0.5 }}>
          คุณสามารถตอบรับหรือปฏิเสธคำเชิญนี้ได้
        </Typography>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          mt: 5,
          display: 'flex',
          gap: 2,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          color="error"
          size="large"
          startIcon={<X size={18} />}
          disabled={isLoading}
          onClick={() =>
            rejectInvite(
              { inviteId: invitation.invitationId },
              {
                onSuccess: () => {
                  handleSuccess();
                  router.replace('/notifications');
                },
              }
            )
          }
        >
          ปฏิเสธ
        </Button>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Check size={18} />}
          disabled={isLoading}
          onClick={() =>
            acceptInvite(
              { inviteId: invitation.invitationId },
              {
                onSuccess: () => {
                  handleSuccess();
                  router.replace(`/trip/${tripId}`);
                },
              }
            )
          }
        >
          ตอบรับ
        </Button>
      </Box>
    </Container>
  );
};

export default InvitationActionPage;

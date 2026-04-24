'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { TruncatedTooltip } from '@/components/atoms';
import { encodeBase64Json } from '@/lib/base64-json';
import { InvitationByCodeParams } from '@/app/invitations/invitation-by-code-client';
import { useGetTripInvitationCode } from '@/app/trip/[tripId]/hooks/use-get-trip-invitation-code';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useTripHeader } from '@/api/trips';
import { useTranslation } from 'react-i18next';

export default function InviteTripModal({ tripId }: { tripId: number }) {
  const { t } = useTranslation('trip_overview');
  const currentUser = useSelector((s: RootState) => s.profile.currentUser);
  const { data: tripHeader } = useTripHeader(tripId);
  const { data: invitationCode } = useGetTripInvitationCode(tripId);

  const { showSuccess } = useSnackbar();
  const copy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    showSuccess(t('inviteDialog.byLink.copied'));
  };

  if (!tripHeader || !currentUser || !invitationCode) return null;

  const ref = encodeBase64Json({
    tripId,
    tripName: tripHeader.name,
    invitationCode,
    inviter: {
      id: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      profilePicUrl: currentUser.profilePicUrl,
    },
  } as InvitationByCodeParams);
  const inviteLink = `https://bscit.sit.kmutt.ac.th/capstone25/cp25ms1/invitations?ref=${ref}`;

  return (
    <div className="w-full flex flex-col items-center">
      <Tabs defaultValue="link" className="w-full">
        <TabsContent value="link">
          {/* ===== Link box ===== */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 520,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              border: '1px solid #d0d0d0',
              px: 2,
              py: 1.2,
            }}
          >
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <TruncatedTooltip text={inviteLink} className="text-[14px] text-gray-700 truncate" />
            </Box>

            <Tooltip title={t('inviteDialog.byLink.copyTooltip')}>
              <IconButton onClick={copy} size="small">
                <Copy size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </TabsContent>
      </Tabs>

    </div>
  );
}

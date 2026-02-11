'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Box, IconButton, Tooltip } from '@mui/material';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { TruncatedTooltip } from '@/components/atoms';
import { encodeBase64Json } from '@/lib/base64-json';
import { InvitationByCodeParams } from '@/app/invitations/invitation-by-code-client';
import { useTripSelector } from '@/store/selectors';
import { useGetTripInvitationCode } from '@/app/trip/[tripId]/hooks/use-get-trip-invitation-code';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function InviteTripModal({ tripId }: { tripId: number }) {
  const { tripOverview } = useTripSelector();
  const currentUser = useSelector((s: RootState) => s.profile.currentUser);
  const { data: invitationCode } = useGetTripInvitationCode(tripId);

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
  };

  if (!tripOverview || !currentUser || !invitationCode) return null;

  const ref = encodeBase64Json({
    tripId,
    tripName: tripOverview.name,
    invitationCode,
    inviter: {
      id: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      profilePicUrl: currentUser.profilePicUrl,
    },
  } as InvitationByCodeParams);
  const inviteLink = `http://localhost:3000/invitations?ref=${ref}`;

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

            <Tooltip title="คัดลอกลิงก์">
              <IconButton onClick={copy} size="small">
                <Copy size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </TabsContent>
      </Tabs>

      {/* Snackbar */}
      <AppSnackbar
        open={copied}
        message="คัดลอกลิงก์เชิญแล้ว"
        severity="success"
        onClose={() => setCopied(false)}
      />
    </div>
  );
}

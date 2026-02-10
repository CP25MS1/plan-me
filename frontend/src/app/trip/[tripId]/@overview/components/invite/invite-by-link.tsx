'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Box, IconButton, Tooltip } from '@mui/material';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { TruncatedTooltip } from '@/components/atoms';

export default function InviteTripModal({ tripId }: { tripId: number }) {
  // const inviteLink = `localhost:3000/invite/trip/${tripId}`;
  const inviteLink = `https://cp25ms1.sit.kmutt.th/invite/trip/${tripId}`;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
  };

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

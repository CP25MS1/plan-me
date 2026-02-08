'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';

import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { Typography } from '@mui/material';

import { tokens } from '@/providers/theme/design-tokens';

export default function InviteTripModal({ tripId }: { tripId: number }) {
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
          <Typography
            sx={{
              mb: 4,
              textAlign: 'left',
              fontWeight: 500,
              color: tokens.color.textPrimary,
            }}
          >
            ลิ้งก์คำเชิญ
          </Typography>

          <div className="space-y-6 flex flex-col items-center">
            {/* ===== Link box ===== */}
            <div
              className="w-full max-w-md flex items-center rounded-full px-5 py-3"
              style={{
                border: '1.5px solid #000',
                boxShadow: '0 6px 14px rgba(0,0,0,0.15)',
              }}
            >
              <span
                className="flex-1 truncate text-sm"
                style={{ color: tokens.color.textSecondary }}
              >
                {inviteLink}
              </span>
            </div>

            {/* ===== Copy Button ===== */}
            <Button
              onClick={copy}
              className="w-[120px] flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-medium text-white shadow-md"
              style={{
                backgroundColor: tokens.color.primary,
              }}
            >
              <Copy size={18} />
              คัดลอก
            </Button>
          </div>
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

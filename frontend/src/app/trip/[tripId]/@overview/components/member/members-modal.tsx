'use client';

import { Box, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect } from 'react';

import { useGetTripmates } from '@/app/trip/[tripId]/@overview/hooks/invite/use-get-tripmates';
import TripMembers from './members-list';
import { useTripSelector } from '@/store/selectors';

export default function MembersModal({
  open,
  onCloseAction,
  tripId,
}: {
  open: boolean;
  onCloseAction: () => void;
  tripId: number;
}) {
  const { data: tripmate, refetch } = useGetTripmates(tripId);
  const { tripOverview } = useTripSelector();

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  if (!tripmate || !tripOverview) return null;

  const tripOwner = tripOverview.owner;
  const joined = [...tripmate.joined.map((t) => t.user), tripOwner];

  const pending = tripmate.pending.map((t) => t.user);

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        onCloseAction();
      }}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            px: 2,
            pb: 2,
            overflow: 'visible',
          },
        },
      }}
    >
      {/* ===== Header ===== */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          textAlign: 'center',
          pb: 1,
        }}
      >
        สมาชิก
        <IconButton onClick={onCloseAction} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* ===== Content ===== */}
      <DialogContent
        sx={{
          borderTop: 'none',
          pt: 2,

          overflow: 'visible',
        }}
      >
        {/* !NOTE: We won't use components from shadCN anymore */}
        <Tabs defaultValue="joined" variant="underline" fullWidth>
          <TabsList className="justify-center">
            <TabsTrigger value="joined">อยู่ในทริปแล้ว ({joined.length})</TabsTrigger>

            <TabsTrigger value="pending">
              กำลังถูกเชิญ ({tripmate?.pending.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <Box mt={3} sx={{ minHeight: 0 }}>
            <TabsContent
              value="joined"
              className="w-full flex justify-center"
              style={{ minHeight: 0 }}
            >
              <TripMembers members={joined} emptyText="ยังไม่มีสมาชิก" />
            </TabsContent>

            <TabsContent value="pending" className="w-full flex justify-center">
              <TripMembers members={pending} emptyText="ไม่มีคำเชิญค้างอยู่" />
            </TabsContent>
          </Box>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { Box, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useGetTripmates } from '@/app/trip/[tripId]/@overview/hooks/invite/use-get-tripmates';
import TripMembers from './members-list';
import { useTripSelector } from '@/store/selectors';

export default function MembersModal({
  open,
  onClose,
  tripId,
}: {
  open: boolean;
  onClose: () => void;
  tripId: number;
}) {
  const { data } = useGetTripmates(tripId);
  const { tripOverview } = useTripSelector();

  if (!data || !tripOverview) return null;

  const tripOwner = tripOverview.owner;
  const joined = [...data.joined, tripOwner];

  const pending = data.pending;

  console.log('joined: ', joined);
  console.log('pending: ', pending);

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          px: 2,
          pb: 2,
          overflow: 'visible',
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
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
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
        <Tabs defaultValue="joined" variant="underline" fullWidth>
          <TabsList className="justify-center">
            <TabsTrigger value="joined">อยู่ในทริปแล้ว ({joined.length})</TabsTrigger>

            <TabsTrigger value="pending">กำลังถูกเชิญ ({data?.pending.length ?? 0})</TabsTrigger>
          </TabsList>

          <Box mt={3} sx={{ minHeight: 0 }}>
            <TabsContent
              value="joined"
              className="w-full flex justify-center"
              style={{ minHeight: 0 }}
            >
              <TripMembers data={joined} emptyText="ยังไม่มีสมาชิก" />
            </TabsContent>

            <TabsContent value="pending" className="w-full flex justify-center">
              <TripMembers data={pending} emptyText="ไม่มีคำเชิญค้างอยู่" />
            </TabsContent>
          </Box>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

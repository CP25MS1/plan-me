'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TruncatedTooltip } from '@/components/atoms';
import { useUnfollowUser } from '@/app/profile/hooks';
import { useAppDispatch } from '@/store';
import { unfollowUser as unfollowUserAction } from '@/store/profile-slice';

type Props = {
  id: number;
  username: string;
  className?: string;
};

/**
 * ConfirmUnfollow
 * - Self-contained confirm dialog + mutation + redux update.
 * - Reusable wherever you need a "ยกเลิกติดตาม" flow.
 */
export const ConfirmUnfollow: React.FC<Props> = ({ id, username, className }) => {
  const dispatch = useAppDispatch();
  const unfollowMutation = useUnfollowUser();

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = React.useCallback(() => {
    setLoading(true);
    unfollowMutation.mutate(id, {
      onSuccess: () => {
        dispatch(unfollowUserAction(id));
        setLoading(false);
      },
      onError: () => {
        // add toast/error handling here if needed
        setLoading(false);
      },
    });
    setOpen(false);
  }, [id, unfollowMutation, dispatch]);

  return (
    <>
      <Button
        variant="outline"
        radius="2xl"
        compact="md"
        className={className ?? 'px-5'}
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        {loading ? 'กำลังยกเลิก...' : 'ยกเลิกติดตาม'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการยกเลิกติดตาม</DialogTitle>
          </DialogHeader>

          <p className="my-4 text-center">
            คุณต้องการยกเลิกติดตาม{' '}
            <strong>
              <TruncatedTooltip text={username} className="max-w-1/2!" />
            </strong>{' '}
            หรือไม่
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" radius="md" onClick={() => setOpen(false)} disabled={loading}>
              ยกเลิก
            </Button>

            <Button variant="destructive" radius="md" onClick={handleConfirm} disabled={loading}>
              {loading ? 'กำลังยกเลิก...' : 'ยกเลิกติดตาม'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConfirmUnfollow;

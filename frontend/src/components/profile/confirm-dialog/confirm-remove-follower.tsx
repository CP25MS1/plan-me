'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TruncatedTooltip } from '@/components/atoms';
import useRemoveFollower from '@/app/profile/hooks/use-remove-follower';
import { useAppDispatch } from '@/store';
import { removeFollower as removeFollowerAction } from '@/store/profile-slice';
import type { PublicUserInfo } from '@/api/users';

type Props = {
  follower: PublicUserInfo;
  triggerClassName?: string;
};

/**
 * ConfirmRemoveFollower
 * - Dropdown trigger "กำลังติดตาม" -> menu item "ลบผู้ติดตาม" -> confirm dialog
 * - Handles mutation + redux dispatch
 */
export const ConfirmRemoveFollower: React.FC<Props> = ({ follower, triggerClassName }) => {
  const dispatch = useAppDispatch();
  const removeMutation = useRemoveFollower();

  const [openDialog, setOpenDialog] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleRemove = React.useCallback(() => {
    setLoading(true);
    removeMutation.mutate(follower.id, {
      onSuccess: () => {
        dispatch(removeFollowerAction(follower.id));
        setLoading(false);
      },
      onError: () => {
        // show error/toast if you use one
        setLoading(false);
      },
    });
    setOpenDialog(false);
  }, [follower.id, removeMutation, dispatch]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            radius="2xl"
            compact="md"
            className={triggerClassName ?? 'px-5'}
            disabled={loading}
          >
            {loading ? 'กำลังดำเนินการ...' : 'กำลังติดตาม'}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpenDialog(true);
            }}
          >
            <span className="text-danger">ลบผู้ติดตาม</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDialog} onOpenChange={(val) => !val && setOpenDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
          </DialogHeader>

          <p className="my-4 text-center">
            คุณต้องการลบ{' '}
            <strong>
              <TruncatedTooltip text={follower.username} className="max-w-1/2!" />
            </strong>{' '}
            ออกจากผู้ติดตามหรือไม่
          </p>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              radius="md"
              onClick={() => setOpenDialog(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>

            <Button variant="destructive" radius="md" onClick={handleRemove} disabled={loading}>
              {loading ? 'กำลังลบ...' : 'ลบผู้ติดตาม'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConfirmRemoveFollower;

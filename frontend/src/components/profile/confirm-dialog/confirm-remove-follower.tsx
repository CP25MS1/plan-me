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
import { Trans, useTranslation } from 'react-i18next';

type Props = {
  follower: PublicUserInfo;
  triggerClassName?: string;
};

export const ConfirmRemoveFollower: React.FC<Props> = ({ follower, triggerClassName }) => {
  const { t } = useTranslation('common');
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
      onError: () => setLoading(false),
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
            {loading ? t('profile.follower.loading') : t('profile.follower.following')}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpenDialog(true);
            }}
          >
            <span className="text-danger">{t('profile.follower.removeAction')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDialog} onOpenChange={(val) => !val && setOpenDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('profile.follower.removeTitle')}</DialogTitle>
          </DialogHeader>

          <p className="my-4 text-center">
            <Trans
              i18nKey="profile.follower.confirmText"
              values={{ username: follower.username }}
              components={{
                strong: <strong />,
                tooltip: <TruncatedTooltip text={follower.username} className="max-w-1/2!" />,
              }}
            />
          </p>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              radius="md"
              onClick={() => setOpenDialog(false)}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>

            <Button variant="destructive" radius="md" onClick={handleRemove} disabled={loading}>
              {loading ? t('profile.follower.removing') : t('profile.follower.removeAction')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConfirmRemoveFollower;

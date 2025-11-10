'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TruncatedTooltip } from '@/components/atoms';
import { useUnfollowUser } from '@/app/profile/hooks';
import { useAppDispatch } from '@/store';
import { unfollowUser as unfollowUserAction } from '@/store/profile-slice';
import { Trans, useTranslation } from 'react-i18next';

type Props = {
  id: number;
  username: string;
  className?: string;
};

export const ConfirmUnfollow: React.FC<Props> = ({ id, username, className }) => {
  const { t } = useTranslation('common');
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
      onError: () => setLoading(false),
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
        {loading ? t('profile.unfollow.loading') : t('profile.unfollow.action')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('profile.unfollow.title')}</DialogTitle>
          </DialogHeader>

          <p className="my-4 text-center">
            <Trans
              i18nKey="profile.unfollow.confirmText"
              values={{ username }}
              components={{
                strong: <strong />,
                tooltip: <TruncatedTooltip text={username} className="max-w-1/2!" />,
              }}
            />
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" radius="md" onClick={() => setOpen(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>

            <Button variant="destructive" radius="md" onClick={handleConfirm} disabled={loading}>
              {loading ? t('profile.unfollow.loading') : t('profile.unfollow.action')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConfirmUnfollow;

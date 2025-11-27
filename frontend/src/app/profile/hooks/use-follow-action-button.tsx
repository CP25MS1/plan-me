import React, { ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Button } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';

import useFollowUser from './use-follow-user';
import useRemoveFollower from './use-remove-follower';
import useUnfollowUser from './use-unfollow-user';
import { PublicUserInfo, UserProfile } from '@/api/users';
import { SplitButton } from '@/components/button';
import { ConfirmDialog } from '@/components/common/dialog';
import { TruncatedTooltip } from '@/components/atoms';

export type FollowState = 'NO_RELATION' | 'FOLLOWING' | 'FOLLOWED' | 'MUTUAL_FOLLOW';

const getFollowState = ({
  userId,
  followers,
  following,
}: {
  userId: number;
  followers: PublicUserInfo[];
  following: PublicUserInfo[];
}): FollowState => {
  const isFollower = followers.some((u) => u.id === userId);
  const isFollowing = following.some((u) => u.id === userId);

  if (isFollowing && isFollower) return 'MUTUAL_FOLLOW';
  if (isFollowing && !isFollower) return 'FOLLOWING';
  if (!isFollowing && isFollower) return 'FOLLOWED';
  return 'NO_RELATION';
};

type FollowCount = {
  followers: number;
  following: number;
};

type UseFollowAction = {
  actionBtn: ReactNode | null;
  count: FollowCount;
  removeConfirmDialog: ReactNode | null;
  unFollowConfirmDialog: ReactNode | null;
};

export const useFollowActionButton = (targetUser: UserProfile | null): UseFollowAction => {
  const { t } = useTranslation('profile');
  const currentUser = useSelector((s: RootState) => s.profile.currentUser);
  const followers = currentUser?.followers ?? [];
  const following = currentUser?.following ?? [];

  const initialState: FollowState = targetUser
    ? getFollowState({ userId: targetUser.id, followers, following })
    : 'NO_RELATION';

  const [followState, setFollowState] = useState<FollowState>(initialState);
  const [count, setCount] = useState<FollowCount>({
    followers: targetUser?.followers.length ?? 0,
    following: targetUser?.following.length ?? 0,
  });

  useEffect(() => {
    if (!targetUser) {
      setFollowState('NO_RELATION');
      setCount({ followers: 0, following: 0 });
      return;
    }

    setFollowState(getFollowState({ userId: targetUser.id, followers, following }));
    setCount({
      followers: targetUser.followers.length,
      following: targetUser.following.length,
    });
  }, [
    currentUser?.followers,
    currentUser?.following,
    targetUser?.id,
    targetUser?.followers.length,
    targetUser?.following.length,
  ]);

  const { mutate: doFollow, isPending: isFollowing } = useFollowUser();
  const { mutate: doUnfollow, isPending: isUnfollowing } = useUnfollowUser();
  const { mutate: doRemoveFollower, isPending: isRemoving } = useRemoveFollower();
  const isPending = Boolean(isFollowing || isUnfollowing || isRemoving);

  const [confirmUnfollowOpen, setConfirmUnfollowOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const handleFollow = () => {
    if (!targetUser) return;
    doFollow(targetUser.id, {
      onSuccess: () => {
        setCount((c) => ({ ...c, followers: c.followers + 1 }));
        setFollowState((prev) => (prev === 'FOLLOWED' ? 'MUTUAL_FOLLOW' : 'FOLLOWING'));
      },
    });
  };

  const handleUnfollowConfirm = () => {
    if (!targetUser) return;
    setConfirmUnfollowOpen(false);
    doUnfollow(targetUser.id, {
      onSuccess: () => {
        setCount((c) => ({ ...c, followers: Math.max(0, c.followers - 1) }));
        setFollowState((prev) => (prev === 'MUTUAL_FOLLOW' ? 'FOLLOWED' : 'NO_RELATION'));
      },
    });
  };

  const handleRemoveFollowerConfirm = () => {
    if (!targetUser) return;
    setConfirmRemoveOpen(false);
    doRemoveFollower(targetUser.id, {
      onSuccess: () => {
        setCount((c) => ({ ...c, following: Math.max(0, c.following - 1) }));

        setFollowState((prev) => {
          if (prev === 'MUTUAL_FOLLOW') return 'FOLLOWING';
          if (prev === 'FOLLOWED') return 'NO_RELATION';
          return prev;
        });
      },
    });
  };

  let actionBtn: ReactNode | null = null;

  if (targetUser) {
    if (followState === 'NO_RELATION') {
      actionBtn = (
        <Button
          variant="contained"
          onClick={handleFollow}
          disabled={isPending}
          sx={{ minWidth: '60%' }}
        >
          {t('follow')}
        </Button>
      );
    } else if (followState === 'FOLLOWED') {
      actionBtn = (
        <SplitButton
          sx={{ minWidth: '60%' }}
          variant="contained"
          mainBtn={
            <Button variant="contained" onClick={handleFollow} disabled={isPending} fullWidth>
              {t('follow_back')}
            </Button>
          }
          options={[
            {
              key: 'remove-follower',
              content: t('remove_follower'),
              onClick: () => setConfirmRemoveOpen(true),
            },
          ]}
        />
      );
    } else if (followState === 'FOLLOWING') {
      actionBtn = (
        <SplitButton
          sx={{ minWidth: '60%' }}
          mainBtn={<Button fullWidth>{t('following')}</Button>}
          options={[
            {
              key: 'unfollow',
              content: t('unfollow'),
              onClick: () => setConfirmUnfollowOpen(true),
            },
          ]}
        />
      );
    } else if (followState === 'MUTUAL_FOLLOW') {
      actionBtn = (
        <SplitButton
          sx={{ minWidth: '60%' }}
          mainBtn={<Button fullWidth>{t('following')}</Button>}
          options={[
            {
              key: 'unfollow',
              content: t('unfollow'),
              onClick: () => setConfirmUnfollowOpen(true),
            },
            {
              key: 'remove-follower',
              content: t('remove_follower'),
              onClick: () => setConfirmRemoveOpen(true),
            },
          ]}
        />
      );
    }
  }

  const removeConfirmDialog = targetUser ? (
    <ConfirmDialog
      open={confirmRemoveOpen}
      onClose={() => setConfirmRemoveOpen(false)}
      onConfirm={handleRemoveFollowerConfirm}
      content={
        <p className="text-center">
          <Trans
            t={t}
            i18nKey="remove_confirm"
            values={{ username: targetUser.username }}
            components={{
              strong: <strong />,
              tooltip: <TruncatedTooltip text={targetUser.username} className="max-w-1/2!" />,
            }}
          />
        </p>
      }
      color="error"
    />
  ) : null;

  const unFollowConfirmDialog = targetUser ? (
    <ConfirmDialog
      open={confirmUnfollowOpen}
      onClose={() => setConfirmUnfollowOpen(false)}
      onConfirm={handleUnfollowConfirm}
      content={
        <p className="text-center">
          <Trans
            t={t}
            i18nKey="unfollow_confirm"
            values={{ username: targetUser.username }}
            components={{
              strong: <strong />,
              tooltip: <TruncatedTooltip text={targetUser.username} className="max-w-1/2!" />,
            }}
          />
        </p>
      }
      color="error"
    />
  ) : null;

  return {
    actionBtn,
    count,
    removeConfirmDialog,
    unFollowConfirmDialog,
  };
};

export default useFollowActionButton;

import React from 'react';
import { Button } from '@/components/ui/button';
import type { UserProfile, PublicUserInfo } from '@/api/users';
import useFollowUser from '@/app/profile/hooks/use-follow-user';
import { useAppDispatch } from '@/store';
import { followUser as followUserAction } from '@/store/profile-slice';
import { ConfirmRemoveFollower } from '@/components/profile';

export type FollowerWithCta = PublicUserInfo & { cta: React.JSX.Element };

/**
 * useFollowersWithCta
 * - builds followers list with CTA element per item
 * - uses useFollowUser mutation internally and dispatches redux on success
 */
export const useFollowersWithCta = (currentUser: UserProfile | null): FollowerWithCta[] => {
  const dispatch = useAppDispatch();
  const followMutation = useFollowUser();

  const [followingBackId, setFollowingBackId] = React.useState<number | null>(null);

  const handleFollowBack = React.useCallback(
    (user: PublicUserInfo) => {
      setFollowingBackId(user.id);
      followMutation.mutate(user.id, {
        onSuccess: () => {
          // optimistic: dispatch the public user info we already have
          dispatch(followUserAction(user));
          setFollowingBackId(null);
        },
        onError: () => {
          setFollowingBackId(null);
        },
      });
    },
    [dispatch, followMutation]
  );

  return React.useMemo(() => {
    if (!currentUser) return [];

    const followingIds = new Set(currentUser.following.map((f) => f.id));

    return currentUser.followers.map((follower) => {
      const isFollowingBack = followingIds.has(follower.id);

      if (isFollowingBack) {
        const cta = <ConfirmRemoveFollower key={`confirm-${follower.id}`} follower={follower} />;

        return { ...follower, cta };
      }

      const isFollowingBackLoading = followingBackId === follower.id;
      const cta = (
        <Button
          key={`followback-${follower.id}`}
          radius="2xl"
          compact="md"
          className="px-5"
          onClick={() => handleFollowBack(follower)}
          disabled={isFollowingBackLoading}
        >
          {isFollowingBackLoading ? 'กำลังติดตาม...' : 'ติดตามกลับ'}
        </Button>
      );

      return { ...follower, cta };
    });
  }, [currentUser, followingBackId, handleFollowBack]);
};

export default useFollowersWithCta;

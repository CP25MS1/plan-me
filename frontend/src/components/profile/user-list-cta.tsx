import Image from 'next/image';
import React, { memo, useMemo } from 'react';

import { TruncatedTooltip } from '../atoms';

export type User = {
  id: string | number;
  username: string;
  email?: string;
  profilePicUrl?: string | null;
  // cta can be a React node or a function that returns a node for a given user
  cta?: React.ReactNode | ((user: User) => React.ReactNode);
};

type Props = {
  users: User[];
  className?: string;
  empty?: React.ReactElement;
};

const Avatar: React.FC<{ src?: string | null; name: string; size?: number }> = ({
  src,
  name,
  size = 48,
}) => {
  const initials = useMemo(() => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  return (
    <div
      className="shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800"
      style={{ width: size, height: size }}
      aria-hidden={!!src}
    >
      {src ? (
        <Image
          src={src}
          alt={`${name} profile`}
          width={20}
          height={20}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
          {initials}
        </div>
      )}
    </div>
  );
};

const UserRow: React.FC<{ user: User }> = memo(({ user }) => {
  const renderCta = () => {
    if (!user.cta) return null;
    if (typeof user.cta === 'function') return user.cta(user);
    return user.cta;
  };

  return (
    <li className="flex items-center gap-4 py-3 px-4 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={user.profilePicUrl} name={user.username} size={48} />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            <TruncatedTooltip text={user.username} className="max-w-3/4!" />
          </div>
          {user.email && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              <TruncatedTooltip text={user.email} className="max-w-3/4!" />
            </div>
          )}
        </div>
      </div>

      <div className="ml-auto shrink-0">{renderCta()}</div>
    </li>
  );
});
UserRow.displayName = 'UserRow';

const NoMemoUserListCta: React.FC<Props> = ({ users, className = '', empty = null }) => {
  const list = useMemo(() => users ?? [], [users]);

  if (!list.length) {
    return <div className="h-full min-h-0 flex items-center">{empty}</div>;
  }

  return (
    <ul
      className={`w-full bg-white divide-y divide-transparent overflow-hidden ${className}`}
      role="list"
    >
      {list.map((u) => (
        <UserRow key={u.id} user={u} />
      ))}
    </ul>
  );
};

export const UserListCta = memo(NoMemoUserListCta);

export default UserListCta;

'use client';

import { Avatar, Box, Checkbox, Typography } from '@mui/material';
import { TruncatedTooltip } from '@/components/atoms';
import { PublicUserInfo } from '@/api/users';

interface Props {
  members?: PublicUserInfo[];
  emptyText: string;
  selectable?: boolean;
  selectedIds?: number[];
  onToggle?: (id: number, checked: boolean) => void;
}
export default function TripMembers({
  members,
  emptyText,
  selectable = false,
  selectedIds = [],
  onToggle,
}: Props) {
  const hasData = members && members.length > 0;

  return (
    <Box
      sx={{
        height: 280,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,

        maxWidth: 520,
        width: '100%',
        mx: 'auto',

        px: 1,
      }}
    >
      {hasData ? (
        members.map((m) => (
          <Box
            key={m.id}
            display="flex"
            alignItems="center"
            gap={2}
            borderRadius={3}
            p={2}
            sx={{
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              backgroundColor: '#fff',
            }}
          >
            {selectable && (
              <Checkbox
                checked={selectedIds.includes(m.id)}
                onChange={(e, checked) => onToggle?.(m.id, checked)}
              />
            )}

            {/* Avatar */}
            <Avatar src={m.profilePicUrl} sx={{ width: 40, height: 40 }}>
              {m.username?.[0]?.toUpperCase()}
            </Avatar>

            {/* Name + Email */}
            <Box minWidth={0}>
              <Box sx={{ minWidth: 0, maxWidth: 200 }}>
                <Typography
                  fontWeight={500}
                  noWrap
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <TruncatedTooltip text={m.username} />
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <TruncatedTooltip text={m.email} />
                </Typography>
              </Box>
            </Box>
          </Box>
        ))
      ) : (
        <Typography textAlign="center" color="text.secondary" sx={{ py: 6 }}>
          {emptyText}
        </Typography>
      )}
    </Box>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Route } from 'next';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Typography,
  Divider,
} from '@mui/material';
import { Search } from 'lucide-react';

import { PublicUserInfo } from '@/api/users';
import useSearchUsers from '@/app/search/hooks/use-search-users';

const SearchPage = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState<number>(0);
  const [users, setUsers] = useState<PublicUserInfo[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isFetching } = useSearchUsers(page, debouncedQ);

  useEffect(() => {
    const time = setTimeout(() => {
      setDebouncedQ(query.trim());
      setPage(0);
      setUsers([]);
      setHasMore(true);
    }, 1000);
    return () => clearTimeout(time);
  }, [query]);

  useEffect(() => {
    if (!data) return;

    if (page === 0) {
      setUsers(data.content ?? []);
    } else {
      setUsers((prev) => [...prev, ...(data.content ?? [])]);
    }

    setHasMore(page < (data.totalPages ?? 0));
  }, [data, page]);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!loaderRef.current) return;
    const node = loaderRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isFetching && !isLoading) {
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: '400px', threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isFetching, isLoading]);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('placeholder.search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box>
        <List disablePadding>
          {users.map((u) => (
            <React.Fragment key={u.id}>
              <ListItem
                component="div"
                sx={{ alignItems: 'center', py: 1.25 }}
                onClick={() => router.push(`/profile/${u.id}` as Route)}
              >
                <ListItemAvatar>
                  <Avatar alt={u.username} src={u.profilePicUrl} />
                </ListItemAvatar>

                <ListItemText primary={u.username} secondary={u.email} />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>

        {query && users.length === 0 && !isLoading && (
          <Box mt={4} textAlign="center">
            <Typography>{t('empty.no_users_found')}</Typography>
          </Box>
        )}

        {isLoading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        <Box
          ref={loaderRef}
          sx={{
            height: 24,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '1rem',
          }}
        >
          {isFetching && !isLoading && <CircularProgress size={20} />}
        </Box>
      </Box>
    </Container>
  );
};

export default SearchPage;

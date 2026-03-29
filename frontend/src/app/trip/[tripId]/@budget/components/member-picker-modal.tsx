'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Divider,
  Chip,
  Stack,
  Typography,
  TextField,
  Box,
} from '@mui/material';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PublicUserInfo } from '@/api/users/type';

type Props = {
  open: boolean;
  onClose: () => void;
  members: PublicUserInfo[];
  payerId: number;
  selectedIds: number[];
  onConfirm: (ids: number[]) => void;
};

export const MemberPickerModal: React.FC<Props> = ({
  open,
  onClose,
  members,
  payerId,
  selectedIds,
  onConfirm,
}) => {
  const { t } = useTranslation('trip_overview');
  const { t: tCommon } = useTranslation('common');

  const [localSelected, setLocalSelected] = React.useState<number[]>([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setLocalSelected(selectedIds ?? []);
      setSearch('');
    }
  }, [open, selectedIds]);

  const toggleMember = (id: number) => {
    setLocalSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const allChecked = members.length > 0 && localSelected.length === members.length;

  const toggleAll = () => {
    if (allChecked) {
      setLocalSelected([]);
    } else {
      setLocalSelected(members.map((m) => m.id));
    }
  };

  const filteredMembers = members.filter((m) =>
    m.username.toLowerCase().includes(search.toLowerCase())
  );
  const showSelectAll = search.trim() === '';
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('budget.memberPicker.title')}</DialogTitle>

      <DialogContent>
        {/* SEARCH */}
        <TextField
          fullWidth
          size="small"
          placeholder={t('budget.memberPicker.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <Search size={16} />
              </Box>
            ),
          }}
        />

        <List>
          {showSelectAll && (
            <>
              <ListItem disablePadding>
                <ListItemButton onClick={toggleAll}>
                  <Checkbox checked={allChecked} tabIndex={-1} disableRipple sx={{ mr: 1 }} />

                  <ListItemAvatar>
                    <Avatar>#</Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={600}>{t('budget.memberPicker.selectAll')}</Typography>

                        <Typography variant="body2" color="text.secondary">
                          ({members.length})
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItemButton>
              </ListItem>

              <Divider />
            </>
          )}

          {filteredMembers.length === 0 && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {t('budget.memberPicker.empty')}
              </Typography>
            </Box>
          )}

          {filteredMembers.map((m) => {
            const checked = localSelected.includes(m.id);

            return (
              <ListItem key={m.id} disablePadding>
                <ListItemButton onClick={() => toggleMember(m.id)}>
                  <Checkbox checked={checked} tabIndex={-1} disableRipple sx={{ mr: 1 }} />

                  <ListItemAvatar>
                    <Avatar src={m.profilePicUrl ?? undefined}>{m.username[0]}</Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>{m.username}</Typography>

                        {m.id === payerId && (
                          <Chip
                            size="small"
                            label={t('budget.memberPicker.payerChip')}
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{tCommon('cancel')}</Button>

        <Button variant="contained" onClick={() => onConfirm(localSelected)}>
          {tCommon('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

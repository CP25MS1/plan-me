'use client';

import React from 'react';
import {
  Box,
  ButtonBase,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  title: React.ReactNode;
  total: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export const ExpenseGroupSection: React.FC<Props> = ({ title, total, open, onToggle, children }) => {
  const { t } = useTranslation('trip_overview');

  return (
    <Box sx={{ mb: 2 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <ButtonBase
          onClick={onToggle}
          sx={{
            width: '100%',
            px: 2,
            py: 1.5,
            display: 'block',
            textAlign: 'left',
            userSelect: 'none',
          }}
          aria-label={t('budget.aria.toggleSection')}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ flex: 1, minWidth: 0 }}>{title}</Box>

            <Typography fontWeight={800} sx={{ whiteSpace: 'nowrap' }}>
              {total}
            </Typography>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              sx={{
                ml: 0.5,
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: '0.2s',
              }}
              aria-label={t('budget.aria.toggleSection')}
            >
              <ChevronDown size={18} />
            </IconButton>
          </Stack>
        </ButtonBase>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <Divider />
          <Stack divider={<Divider flexItem />} sx={{ width: '100%' }}>
            {children}
          </Stack>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default ExpenseGroupSection;

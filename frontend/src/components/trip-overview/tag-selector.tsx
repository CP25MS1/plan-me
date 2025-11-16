'use client';

import { useState } from 'react';
import { Box, Chip, Popover, Button, IconButton } from '@mui/material';
import LabelIcon from '@mui/icons-material/Label';

export default function TagSelector({
  selectedTags,
  setSelectedTags,
  availableTags,
}: {
  selectedTags: string[];
  setSelectedTags: (v: string[]) => void;
  availableTags: string[];
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const toggle = (tag: string) => {
    if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter((t) => t !== tag));
    else setSelectedTags([...selectedTags, tag]);
  };

  return (
    <>
      <Box
        sx={{
          px: 2,
          mt: 1,
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
          <LabelIcon sx={{ color: 'primary' }} />
        </IconButton>

        {selectedTags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => toggle(tag)}
            sx={{
              backgroundColor: 'success.light',
              color: 'primary',
              fontWeight: 600,
            }}
          />
        ))}
      </Box>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {availableTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? 'contained' : 'outlined'}
              color="success"
              onClick={() => toggle(tag)}
              sx={{ textTransform: 'none' }}
            >
              {tag}
            </Button>
          ))}
        </Box>
      </Popover>
    </>
  );
}

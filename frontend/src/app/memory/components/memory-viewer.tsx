'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { MemoryItemDto } from '@/api/memory/type';

interface Props {
  memories: MemoryItemDto[];
  currentIndex: number;
  onClose: () => void;
}

export default function MemoryViewer({ memories, currentIndex, onClose }: Props) {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  const currentMemory = memories[index];

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const handleNext = () => {
    if (index < memories.length - 1) {
      setIndex(index + 1);
    }
  };

  if (!currentMemory) return null;

  return (
    <Dialog open onClose={onClose} fullScreen>
      <DialogContent
        sx={{
          backgroundColor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          p: 0,
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Prev Button */}
        {index > 0 && (
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: 16,
              color: 'white',
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        )}

        {/* Image */}
        <Box
          component="img"
          src={currentMemory.signedUrl}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />

        {/* Next Button */}
        {index < memories.length - 1 && (
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              color: 'white',
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        )}

        {/* Bottom Info */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2">
            {index + 1} / {memories.length}
          </Typography>

          <Typography variant="caption">
            {new Date(currentMemory.createdAt).toLocaleString()}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

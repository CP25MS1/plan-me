'use client';

import React, { useRef, useState } from 'react';
import { Box, Paper, SxProps } from '@mui/material';

type SwipeRevealProps = {
  actionNode: React.ReactNode;
  actionWidth?: number;
  actionSide?: 'right' | 'left';
  children: React.ReactNode;
  actionSx?: SxProps;
  cardSx?: SxProps;
};

export const SwipeReveal: React.FC<SwipeRevealProps> = ({
  actionNode,
  actionWidth = 80,
  actionSide = 'right',
  children,
  actionSx,
  cardSx,
}) => {
  const [translate, setTranslate] = useState(0);
  const startXRef = useRef<number | null>(null);
  const startTranslateRef = useRef(0);
  const draggingRef = useRef(false);

  // allowed range depending on side:
  // right action  -> translate in [-actionWidth, 0]
  // left action   -> translate in [0, actionWidth]
  const minTranslate = actionSide === 'right' ? -actionWidth : 0;
  const maxTranslate = actionSide === 'right' ? 0 : actionWidth;

  const clamp = (v: number) => Math.max(minTranslate, Math.min(maxTranslate, v));

  const onPointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    startTranslateRef.current = translate;
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || startXRef.current === null) return;
    const dx = e.clientX - startXRef.current;
    // consider starting translate so we can drag from opened state too
    const next = clamp(startTranslateRef.current + dx);
    setTranslate(next);
  };

  const finishDrag = () => {
    draggingRef.current = false;
    startXRef.current = null;
    startTranslateRef.current = 0;

    // snap open if more than half of actionWidth, else close
    const shouldOpen =
      Math.abs(translate) > actionWidth / 2 && // dragged more than half
      // also ensure direction matches allowed open direction
      (actionSide === 'right' ? translate < 0 : translate > 0);

    if (shouldOpen) {
      setTranslate(actionSide === 'right' ? -actionWidth : actionWidth);
    } else {
      setTranslate(0);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
    finishDrag();
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', touchAction: 'pan-y' }}>
      {/* Action area */}
      <Box
        sx={{
          position: 'absolute',
          top: 1,
          bottom: 0,
          width: actionWidth,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          right: actionSide === 'right' ? 1 : 'auto',
          left: actionSide === 'left' ? 1 : 'auto',
          bgcolor: 'error.main',
          ...(actionSx as object),
          zIndex: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {actionNode}
      </Box>

      {/* Sliding content */}
      <Paper
        elevation={1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        sx={{
          transform: `translateX(${translate}px)`,
          transition: draggingRef.current ? 'none' : 'transform 160ms ease-out',
          overflow: 'hidden',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          zIndex: 1,
          ...(cardSx as object),
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

export default SwipeReveal;

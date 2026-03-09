'use client';

import { RefObject, useEffect, useRef } from 'react';

interface Props {
  containerRef: RefObject<HTMLDivElement | null>;
  index: number;
  setIndex: (i: number) => void;
  length: number;
}

export const useTouchPageScroll = ({ containerRef, index, setIndex, length }: Props) => {
  const startY = useRef(0);
  const locked = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (locked.current) return;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (locked.current) return;

      const endY = e.changedTouches[0].clientY;
      const diff = startY.current - endY;

      if (Math.abs(diff) < 80) return;

      locked.current = true;

      const direction = diff > 0 ? 1 : -1;

      const next = Math.max(0, Math.min(index + direction, length - 1));

      const height = el.clientHeight;

      el.scrollTo({
        top: next * height,
        behavior: 'smooth',
      });

      setIndex(next);

      // รอ animation จบก่อน unlock
      setTimeout(() => {
        locked.current = false;
      }, 450);
    };

    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef, index, length, setIndex]);
};

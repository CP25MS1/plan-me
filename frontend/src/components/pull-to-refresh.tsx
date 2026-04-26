'use client';

import { useEffect, useRef } from 'react';

const PullToRefresh = () => {
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (globalThis.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (startY.current === null) return;

      const endY = e.changedTouches[0].clientY;
      const diff = endY - startY.current;

      if (diff > 100 && globalThis.scrollY === 0) {
        globalThis.location.reload();
      }

      startY.current = null;
    };

    globalThis.addEventListener('touchstart', handleTouchStart, { passive: true });
    globalThis.addEventListener('touchend', handleTouchEnd);

    return () => {
      globalThis.removeEventListener('touchstart', handleTouchStart);
      globalThis.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return null;
};
export default PullToRefresh;

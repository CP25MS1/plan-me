'use client';

import { RefObject, useEffect } from 'react';

interface Props {
  containerRef: RefObject<HTMLDivElement | null>;
  index: number;
  setIndex: (index: number) => void;
  length: number;
  wheelLockRef: React.RefObject<boolean>;
}

export const useWheelPageScroll = ({
  containerRef,
  index,
  setIndex,
  length,
  wheelLockRef,
}: Props) => {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (wheelLockRef.current) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      wheelLockRef.current = true;

      let nextIndex = index;

      if (e.deltaY > 0) {
        nextIndex = Math.min(index + 1, length - 1);
      } else {
        nextIndex = Math.max(index - 1, 0);
      }

      if (nextIndex !== index) {
        const height = el.clientHeight || window.innerHeight;

        el.scrollTo({
          top: nextIndex * height,
          behavior: 'smooth',
        });

        setIndex(nextIndex);
      }

      setTimeout(() => {
        wheelLockRef.current = false;
      }, 400);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, index, length, setIndex, wheelLockRef]);
};

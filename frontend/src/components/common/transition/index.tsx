import React from 'react';
import { Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

export type SlideDirection = 'up' | 'down' | 'left' | 'right';

const transitionCache: Partial<
  Record<
    SlideDirection,
    React.ForwardRefExoticComponent<TransitionProps & { children: React.ReactElement }>
  >
> = {};

export const createSlideTransition = (direction: SlideDirection = 'up') => {
  transitionCache[direction] ??= React.forwardRef(function SlideTransition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>
  ) {
    return <Slide direction={direction} ref={ref} {...props} />;
  });

  return transitionCache[direction];
};

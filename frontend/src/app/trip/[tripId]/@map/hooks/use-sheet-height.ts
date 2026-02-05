import { useEffect, useState } from 'react';

export const useSheetHeight = (ratio = 0.5) => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const update = () => setHeight(window.innerHeight * ratio);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [ratio]);

  return height;
};

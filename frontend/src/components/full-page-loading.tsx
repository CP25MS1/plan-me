import { useState } from 'react';

import { Spinner } from './ui/spinner';

const FullPageLoading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <Spinner className="size-8 text-primary" />
    </div>
  );
};

export const useFullPageLoading = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  return {
    isNavigating,
    setIsNavigating,
    FullPageLoading,
  };
};

export default FullPageLoading;

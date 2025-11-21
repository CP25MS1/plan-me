'use client';

import { ChevronLeft } from 'lucide-react';
import Button, { type ButtonProps } from '../ui/button';
import { cn } from '@/lib/style-utils';

interface BackButtonProps extends ButtonProps {
  onBack?: () => void;
  iconOnly?: boolean;
}

export const BackButton = ({
  onBack,
  variant = 'ghost',
  className,
  iconOnly = true,
  children,
  ...props
}: BackButtonProps) => {
  const handle = () => {
    if (onBack) return onBack();
    if (globalThis.history.length > 1) return globalThis.history.back();
  };

  return (
    <Button
      variant={variant}
      onClick={handle}
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      <ChevronLeft className="w-6! h-6!" />
      {!iconOnly && (children ?? 'Back')}
    </Button>
  );
};

export default BackButton;

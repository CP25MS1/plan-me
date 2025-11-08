import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/style-utils';

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

const buttonVariants = cva(base, {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive:
        'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
      outline: 'border bg-background hover:bg-accent/5 dark:bg-input/30 dark:hover:bg-input/50',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      default: 'h-9 px-4 has-[>svg]:px-3 rounded-md',
      sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5 rounded-md text-sm',
      lg: 'h-10 px-6 has-[>svg]:px-4 rounded-md',
      icon: 'size-9 p-2',
    },
    compact: {
      none: '',
      sm: 'h-6 px-2 text-xs gap-1 rounded-sm',
      md: 'h-7 px-2.5 text-sm gap-1.5 rounded',
      lg: 'h-8 px-3 text-sm gap-2 rounded-md',
    },
    radius: {
      xs: 'rounded-sm',
      sm: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    compact: 'none',
    radius: 'md',
  },
});

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  compact,
  radius,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, compact, radius }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export default Button;

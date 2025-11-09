'use client';

import * as React from 'react';
import { useMemo } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/style-utils';

type Variant = 'filled' | 'underline';

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  variant?: Variant;
  fullWidth?: boolean;
};

const TabsContext = React.createContext<{ variant: Variant; fullWidth: boolean } | null>(null);

export function Tabs({ variant = 'filled', fullWidth = false, className, ...props }: TabsProps) {
  const contextValue = useMemo(() => ({ variant, fullWidth }), [variant, fullWidth]);

  return (
    <TabsContext.Provider value={contextValue}>
      <TabsPrimitive.Root className={cn('flex flex-col gap-2', className)} {...props} />
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  const ctx = React.useContext(TabsContext);
  const variant = ctx?.variant ?? 'filled';
  const fullWidth = ctx?.fullWidth ?? false;

  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex items-center justify-start gap-1',
        variant === 'filled' && 'bg-muted text-muted-foreground p-[3px] rounded-lg',
        variant === 'underline' && 'bg-transparent border-b border-transparent',
        fullWidth ? 'w-full px-4' : 'w-fit',
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const ctx = React.useContext(TabsContext);
  const variant = ctx?.variant ?? 'filled';
  const fullWidth = ctx?.fullWidth ?? false;

  const filledClasses = cn(
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
    // Radix sets data-state="active" on the trigger element
    'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
  );

  const underlineClasses = cn(
    'inline-flex items-center justify-center gap-1 px-2 pb-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50',
    // base neutral text, base transparent bottom border so we can reveal on active
    'text-neutral-500 border-b-2 border-transparent',
    // when active -> primary text + primary underline
    'data-[state=active]:text-primary data-[state=active]:border-primary'
  );

  return (
    <TabsPrimitive.Trigger
      className={cn(
        fullWidth ? 'flex-1 text-center' : undefined,
        variant === 'filled' ? filledClasses : underlineClasses,
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('flex-1 outline-none', className)} {...props} />;
}

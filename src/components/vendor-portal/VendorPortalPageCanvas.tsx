import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Voxxy-tinted canvas: soft violet wash on zinc (light + dark) */
export function VendorPortalPageCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-b from-violet-50/90 via-zinc-50/95 to-violet-50/50 text-foreground antialiased dark:from-[#120b1c] dark:via-zinc-950 dark:to-[#1a1228]',
        className
      )}
    >
      {children}
    </div>
  );
}

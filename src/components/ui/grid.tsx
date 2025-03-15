
import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number[] | number;
  gap?: number;
  children: React.ReactNode;
}

export const Grid = ({
  columns = [1, 2, 3, 4],
  gap = 4,
  className,
  children,
  ...props
}: GridProps) => {
  // Convert columns to responsive classes
  const columnsClass = Array.isArray(columns)
    ? {
        'grid-cols-1': columns.includes(1),
        'sm:grid-cols-2': columns.includes(2) && columns.length > 1,
        'md:grid-cols-3': columns.includes(3) && columns.length > 2,
        'lg:grid-cols-4': columns.includes(4) && columns.length > 3,
      }
    : {
        [`grid-cols-${columns}`]: true,
      };

  // Convert gap to Tailwind class
  const gapClass = `gap-${gap}`;

  return (
    <div
      className={cn(
        'grid',
        gapClass,
        columnsClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

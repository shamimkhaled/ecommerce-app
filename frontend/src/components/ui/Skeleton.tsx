import React from 'react';
import { cn } from '../../utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn("animate-pulse bg-slate-200 dark:bg-slate-800 rounded", className)} />
  );
};

export const ProductSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  );
};

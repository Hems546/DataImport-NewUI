import React from 'react';
import { cn } from "@/lib/utils";

interface LoadingProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ message = "Loading...", className, size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-14 w-14'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md", className)}>
      <div className={cn("animate-spin rounded-full border-b-2 border-brand-purple mb-4", sizeClasses[size])}></div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
} 
'use client';

import React from 'react';

// 컬러 뱃지 컴포넌트
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

export default function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-emerald-50 text-success',
    warning: 'bg-amber-50 text-warning',
    danger: 'bg-red-50 text-danger',
    neutral: 'bg-slate-100 text-txt-sub',
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

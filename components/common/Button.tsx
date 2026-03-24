'use client';

import React from 'react';

// primary/secondary/ghost 버튼 컴포넌트
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const base = 'text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2';

  const variants: Record<string, string> = {
    primary: 'px-5 py-2.5 bg-primary hover:bg-primary-dark text-white',
    secondary: 'px-4 py-2.5 bg-white border border-bdr hover:bg-bg text-txt',
    ghost: 'px-4 py-2.5 text-txt-sub hover:text-txt hover:bg-bg',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

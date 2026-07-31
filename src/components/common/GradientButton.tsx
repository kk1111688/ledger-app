import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';

interface GBProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'green' | 'red' | 'blue' | 'purple' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

const variantStyles: Record<NonNullable<GBProps['variant']>, string> = {
  primary: 'bg-gradient-to-r from-cream-400 to-cream-500 shadow-cream-500/30',
  green: 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-500/30',
  red: 'bg-gradient-to-r from-rose-400 to-red-500 shadow-red-500/30',
  blue: 'bg-gradient-to-r from-sky-400 to-blue-500 shadow-blue-500/30',
  purple: 'bg-gradient-to-r from-violet-400 to-purple-500 shadow-purple-500/30',
  outline: 'bg-white border-2 border-cream-300 text-cream-600',
  ghost: 'bg-cream-50 text-cream-600 hover:bg-cream-100',
};

const gradientVariants = ['primary', 'green', 'red', 'blue', 'purple'] as const;

export function GradientButton({
  variant = 'primary',
  fullWidth,
  className,
  children,
  ...props
}: GBProps) {
  const isGradient = gradientVariants.includes(variant as (typeof gradientVariants)[number]);

  return (
    <button
      className={twMerge(
        clsx(
          'rounded-2xl py-3 px-5 transition-all',
          variantStyles[variant],
          isGradient && 'font-bold text-white shadow-lg hover:shadow-xl active:scale-[0.97]',
          fullWidth && 'w-full',
          className
        )
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default GradientButton;

import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover, className, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl shadow-soft transition-all duration-300 hover:shadow-elevated',
          hover && 'hover:-translate-y-0.5 active:scale-[0.99]',
          className
        )
      )}
      {...props}
    />
  );
}

export default Card;

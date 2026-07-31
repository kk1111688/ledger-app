import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';
import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={twMerge(
          clsx(
            'mx-auto mt-[10vh] animate-scale-in bg-white rounded-3xl shadow-elevated p-5',
            sizeStyles[size]
          )
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-1 py-2">{children}</div>

        {footer && (
          <div className="mt-4 flex gap-2 justify-end">{footer}</div>
        )}
      </div>
    </div>
  );
}

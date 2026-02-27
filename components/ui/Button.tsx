import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-[var(--brand-primary)] text-[var(--brand-primary-text)] hover:opacity-95 focus-visible:outline-[var(--brand-primary)]',
    secondary: 'bg-[var(--brand-secondary)] text-[var(--brand-secondary-text)] hover:opacity-90 focus-visible:outline-[var(--brand-primary)]',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

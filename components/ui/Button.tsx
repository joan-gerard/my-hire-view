import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  /** Shown instead of children while `loading` is true. Defaults to "Loading…". */
  loadingLabel?: string;
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  loadingLabel = 'Loading…',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center px-4 py-2 text-sm font-semibold cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'rounded-full bg-[var(--ink)] text-[var(--white)] hover:opacity-95 focus-visible:outline-[var(--ink)]',
    secondary:
      'rounded-xl border border-[var(--ink)]/12 bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--white)] focus-visible:outline-[var(--ink)]',
    danger:
      'rounded-xl bg-[var(--status-danger-solid)] text-white hover:opacity-90 focus-visible:outline-[var(--status-danger-solid)]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}

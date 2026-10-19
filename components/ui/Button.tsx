import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  /**
   * Corner radius. Defaults: primary → pill; secondary/danger → rounded (xl).
   * Pass explicitly when a paired footer should share one shape.
   */
  shape?: 'pill' | 'rounded';
  loading?: boolean;
  /** Shown instead of children while `loading` is true. Defaults to "Loading…". */
  loadingLabel?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    shape,
    loading = false,
    loadingLabel = 'Loading…',
    className = '',
    disabled,
    ...props
  },
  ref,
) {
  const resolvedShape =
    shape ?? (variant === 'primary' ? 'pill' : 'rounded');
  const shapeClass =
    resolvedShape === 'pill' ? 'rounded-full' : 'rounded-xl';

  const baseStyles =
    'inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'bg-[var(--ink)] text-[var(--white)] hover:opacity-95 focus-visible:outline-[var(--ink)]',
    secondary:
      'border border-[var(--ink)]/12 bg-[var(--white)] text-[var(--ink)] hover:bg-[var(--ink)]/[0.04] focus-visible:outline-[var(--ink)]',
    danger:
      'bg-[var(--status-danger-solid)] text-white hover:opacity-90 focus-visible:outline-[var(--status-danger-solid)]',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${shapeClass} ${variantStyles[variant]} ${loading ? 'motion-safe:animate-pulse' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
            aria-hidden
          />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
});

export default Button;

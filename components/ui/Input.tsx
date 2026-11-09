import { InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Soft guidance under the field; does not replace `error`. */
  warning?: string;
  /** Shorter top and bottom padding. Used on the one-page create form. */
  dense?: boolean;
  /** Control pinned inside the field on the right (e.g. show/hide). */
  endAdornment?: ReactNode;
  /** Icon or control shown before the label (e.g. status tip). */
  labelStart?: ReactNode;
}

export default function Input({
  label,
  error,
  warning,
  dense = false,
  endAdornment,
  labelStart,
  className = '',
  id,
  required,
  'aria-describedby': ariaDescribedBy,
  ...props
}: InputProps) {
  const describedBy =
    [
      ariaDescribedBy,
      error && id ? `${id}-error` : null,
      warning && !error && id ? `${id}-warning` : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-[18px] text-[var(--ink)]"
        >
          {labelStart}
          {label}
          {required ? (
            <span className="text-[var(--status-danger-fg)]" aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
        </label>
      )}
      <div className={`${label ? "mt-1 " : ""}relative`}>
        <input
          id={id}
          required={required}
          className={`block w-full rounded-xl border-0 px-3.5 ${
            endAdornment ? "pr-12" : ""
          } ${dense ? "bg-[var(--ink)]/[0.02] py-1.5" : "bg-[var(--white)] py-2.5 shadow-sm"} text-[var(--ink)] ring-1 ring-inset ring-[var(--ink)]/15 placeholder:text-[var(--muted)] outline-hidden focus:ring-2 focus:ring-inset focus:ring-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:bg-[var(--paper)] disabled:text-[var(--muted)] disabled:ring-[var(--ink)]/10 sm:text-sm sm:leading-6 ${
            error ? 'ring-[var(--status-danger-fg)]/40' : ''
          } ${className}`}
          {...props}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        {endAdornment ? (
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            {endAdornment}
          </div>
        ) : null}
      </div>
      {error ? (
        <p
          id={id ? `${id}-error` : undefined}
          className="mt-1 text-sm text-[var(--status-danger-fg)]"
          role="alert"
        >
          {error}
        </p>
      ) : warning ? (
        <p
          id={id ? `${id}-warning` : undefined}
          className="mt-1 text-sm text-[var(--status-warning-fg)]"
          role="status"
        >
          {warning}
        </p>
      ) : null}
    </div>
  );
}

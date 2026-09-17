import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      <input
        className={`mt-1 block w-full rounded-xl border-0 bg-[var(--surface)] px-3.5 py-2.5 text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--foreground)]/15 placeholder:text-[var(--foreground)]/45 focus:ring-2 focus:ring-inset focus:ring-[var(--brand-accent-1)] sm:text-sm sm:leading-6 ${
          error ? 'ring-[var(--status-danger-fg)]/40' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[var(--status-danger-fg)]">{error}</p>
      )}
    </div>
  );
}

import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      <textarea
        className={`mt-1 block w-full rounded-md border-0 px-3 py-2 text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--foreground)]/20 placeholder:text-[var(--foreground)]/50 focus:ring-2 focus:ring-inset focus:ring-[var(--brand-primary)] sm:text-sm sm:leading-6 ${
          error ? 'ring-red-300' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

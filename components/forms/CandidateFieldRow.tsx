'use client';

import Input from '@/components/ui/Input';

export interface CandidateFieldRowProps {
  id: string;
  label: string;
  type?: 'text' | 'url';
  value: string;
  included: boolean;
  onValueChange: (value: string) => void;
  onIncludedChange: (included: boolean) => void;
}

export default function CandidateFieldRow({
  id,
  label,
  type = 'text',
  value,
  included,
  onValueChange,
  onIncludedChange,
}: CandidateFieldRowProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id={id}
        checked={included}
        onChange={(e) => onIncludedChange(e.target.checked)}
        className="h-4 w-4 rounded border-[var(--foreground)]/30 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
        aria-label={`Include ${label}`}
      />
      <label htmlFor={id} className="flex-1 text-sm font-medium text-[var(--foreground)]">
        {label}
      </label>
      <Input
        aria-label={label}
        type={type}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={!included}
        className="max-w-xs"
      />
    </div>
  );
}

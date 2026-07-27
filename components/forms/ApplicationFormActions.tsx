'use client';

import Button from '@/components/ui/Button';

interface ApplicationFormActionsProps {
  loading?: boolean;
  submitLabel?: string;
  /** When false, the submit button is disabled. */
  canSubmit?: boolean;
  /** Shown on hover when submit is disabled. */
  disabledReason?: string | null;
}

export default function ApplicationFormActions({
  loading = false,
  submitLabel = 'Save Application',
  canSubmit = true,
  disabledReason = null,
}: ApplicationFormActionsProps) {
  const disabled = !canSubmit || loading;

  return (
    <div className="flex justify-end gap-4">
      <Button
        type="button"
        variant="secondary"
        onClick={() => window.history.back()}
      >
        Cancel
      </Button>
      <div
        className="group relative inline-flex"
        title={disabled && disabledReason ? disabledReason : undefined}
      >
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={disabled}
          aria-describedby={
            disabled && disabledReason
              ? 'save-application-disabled-reason'
              : undefined
          }
        >
          {submitLabel}
        </Button>
        {disabled && disabledReason && (
          <span
            id="save-application-disabled-reason"
            role="tooltip"
            className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 hidden max-w-xs rounded-md bg-[var(--foreground)] px-2.5 py-1.5 text-xs text-[var(--background)] shadow-lg group-hover:block group-focus-within:block"
          >
            {disabledReason}
          </span>
        )}
      </div>
    </div>
  );
}

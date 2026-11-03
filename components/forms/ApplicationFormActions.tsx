'use client';

import Button from '@/components/ui/Button';

interface ApplicationFormActionsProps {
  loading?: boolean;
  /** Busy-button label while `loading` (e.g. "Uploading…" / "Saving…"). */
  loadingLabel?: string;
  submitLabel?: string;
  /** When false, save is blocked. The button stays focusable unless `dimWhenBlocked`. */
  canSubmit?: boolean;
  /**
   * Checklist create: a blocked Save uses the disabled style,
   * and the missing-fields line is not shown.
   */
  dimWhenBlocked?: boolean;
  /**
   * Why save is blocked, in one line.
   * Example: "Required before saving: YouTube intro".
   */
  disabledReason?: string | null;
  /** Called when a blocked Save or its reason is activated, so the page can move to the first problem. */
  onBlocked?: () => void;
}

export default function ApplicationFormActions({
  loading = false,
  loadingLabel = 'Saving…',
  submitLabel = 'Save Application',
  canSubmit = true,
  disabledReason = null,
  onBlocked,
  dimWhenBlocked = false,
}: ApplicationFormActionsProps) {
  const blocked = !canSubmit && !loading;
  const showReason = blocked && Boolean(disabledReason) && !dimWhenBlocked;
  const reasonId = showReason ? 'save-application-disabled-reason' : undefined;

  return (
    <div className="flex flex-col items-end gap-2">
      {showReason ? (
        <p id={reasonId} aria-live="polite" className="max-w-sm text-right">
          <button
            type="button"
            onClick={onBlocked}
            className="cursor-pointer text-sm font-semibold text-[var(--ink)] underline decoration-[var(--ink)]/40 underline-offset-2 hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
          >
            {disabledReason}
          </button>
        </p>
      ) : null}
      <div className="group relative inline-flex">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          loadingLabel={loadingLabel}
          disabled={dimWhenBlocked && blocked}
          aria-disabled={!dimWhenBlocked && blocked ? true : undefined}
          aria-describedby={reasonId}
          onClick={(event) => {
            if (!blocked || dimWhenBlocked) return;
            event.preventDefault();
            onBlocked?.();
          }}
        >
          {submitLabel}
        </Button>
        {showReason ? (
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 hidden max-w-xs rounded-md bg-[var(--ink)] px-2.5 py-1.5 text-sm text-[var(--white)] shadow-lg group-hover:block group-focus-within:block"
          >
            {disabledReason}
          </span>
        ) : null}
      </div>
    </div>
  );
}

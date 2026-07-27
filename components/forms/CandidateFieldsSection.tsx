'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/admin/icons';
import CandidateFieldRow from './CandidateFieldRow';

const STORAGE_KEY = 'myhireview:candidate-fields-expanded';

export type CandidateFieldKey =
  | 'first_name'
  | 'last_name'
  | 'location'
  | 'portfolio_url'
  | 'linkedin_url';

export interface CandidateFieldsSectionProps {
  values: Record<CandidateFieldKey, string>;
  include: Record<CandidateFieldKey, boolean>;
  onValueChange: (field: CandidateFieldKey, value: string) => void;
  onIncludeChange: (field: CandidateFieldKey, included: boolean) => void;
}

const FIELDS: { key: CandidateFieldKey; label: string; type: 'text' | 'url' }[] = [
  { key: 'first_name', label: 'First name', type: 'text' },
  { key: 'last_name', label: 'Last name', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'portfolio_url', label: 'Portfolio URL', type: 'url' },
  { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
];

const TOTAL_FIELDS = FIELDS.length;

function getStoredExpanded(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== 'false';
  } catch {
    return true;
  }
}

export default function CandidateFieldsSection({
  values,
  include,
  onValueChange,
  onIncludeChange,
}: CandidateFieldsSectionProps) {
  const [expanded, setExpanded] = useState(getStoredExpanded);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const includedCount = FIELDS.filter(({ key }) => include[key]).length;

  return (
    <section className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Info shown to recruiters{' '}
            <span className="font-normal text-[var(--foreground)]/60">
              ({includedCount}/{TOTAL_FIELDS})
            </span>
          </h3>
          <p className="mt-1 text-xs text-[var(--foreground)]/60">
            Toggle off any field you do not want to share. Edits here apply only to this
            application.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleExpanded}
          className="inline-flex shrink-0 cursor-pointer rounded p-1 text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)]"
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide recruiter info fields' : 'Show recruiter info fields'}
          title={expanded ? 'Hide fields' : 'Show fields'}
        >
          {expanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="candidate-fields"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {FIELDS.map(({ key, label, type }) => (
                <CandidateFieldRow
                  key={key}
                  id={`include-${key}`}
                  label={label}
                  type={type}
                  value={values[key] ?? ''}
                  included={include[key] ?? false}
                  onValueChange={(v) => onValueChange(key, v)}
                  onIncludedChange={(v) => onIncludeChange(key, v)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

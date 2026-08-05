'use client';

import type { ApplicationListItem } from '@/lib/types/application';
import { getApplicationUrl } from '@/lib/utils/url';
import { copyToClipboard } from '@/lib/utils/clipboard';
import Link from 'next/link';
import { useState } from 'react';
import ApplicationCardDropdown from '@/components/admin/ApplicationCardDropdown';
import ApplicationCardInsights from '@/components/admin/ApplicationCardInsights';
import {
  ArchiveIcon,
  ChartIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  ExternalLinkIcon,
  ClockIcon,
} from '@/components/admin/icons';

interface ApplicationCardProps {
  application: ApplicationListItem;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
}

function StatusIcon({
  status,
  viewCount,
}: {
  status: ApplicationListItem['status'];
  viewCount: number;
}) {
  const isActive = status === 'active';
  const hasBeenViewed = viewCount > 0;
  const title =
    status === 'archived'
      ? 'Archived'
      : status === 'draft'
        ? 'Draft'
        : hasBeenViewed
          ? 'Active (viewed)'
          : 'Active (not viewed yet)';

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      title={title}
      aria-label={title}
    >
      {status === 'archived' ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--foreground)]/10">
          <ArchiveIcon className="h-5 w-5 text-[var(--foreground)]/60" />
        </span>
      ) : status === 'draft' ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
          <ClockIcon className="h-5 w-5 text-amber-700" />
        </span>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
          {hasBeenViewed ? (
            <CheckIcon className="h-5 w-5 text-emerald-600" />
          ) : (
            <ClockIcon className="h-5 w-5 text-emerald-600" />
          )}
        </span>
      )}
    </div>
  );
}

function MissingCvBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900"
      title="The CV file is missing from storage. Edit this application or restore a primary CV."
      aria-label="CV file missing"
    >
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.594c.75 1.335-.213 2.982-1.742 2.982H3.48c-1.53 0-2.493-1.647-1.743-2.982L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z"
          clipRule="evenodd"
        />
      </svg>
      CV missing
    </span>
  );
}

export default function ApplicationCard({
  application,
  onDelete,
  onArchive,
  onRestore,
}: ApplicationCardProps) {
  const [copied, setCopied] = useState(false);
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const shareableUrl = getApplicationUrl(application.public_id, application.slug);
  const isArchived = application.status === 'archived';

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareableUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-visible rounded-lg bg-[var(--secondary-background)] shadow border border-[var(--foreground)]/10">
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
          <StatusIcon
            status={application.status}
            viewCount={application.view_count}
          />

          <span className="min-w-0 text-sm font-medium text-[var(--foreground)] sm:text-base">
            {application.company} - {application.role}
          </span>

          {application.cv_exists === false && <MissingCvBadge />}

          <div className="hidden flex-1 sm:block" aria-hidden="true" />

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--brand-primary)]/30 bg-[var(--secondary-background)] px-3 py-1.5 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
          >
            <CopyIcon className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <button
            type="button"
            onClick={() => setInsightsExpanded(!insightsExpanded)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--brand-primary)]/30 bg-[var(--secondary-background)] px-3 py-1.5 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
          >
            <ChartIcon className="h-4 w-4" />
            View Insights
            {insightsExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>

          <Link
            href={`/view/${application.public_id}/${application.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-sm font-medium text-[var(--brand-primary-text)] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            View Application
          </Link>

          <ApplicationCardDropdown
            applicationId={application.id}
            isArchived={isArchived}
            onDelete={onDelete}
            onArchive={onArchive}
            onRestore={onRestore}
          />
        </div>

        <ApplicationCardInsights
          expanded={insightsExpanded}
          viewCount={application.view_count}
          downloadCount={application.download_count ?? 0}
          createdAt={application.created_at}
          lastViewedAt={application.last_viewed_at ?? null}
        />
      </div>
    </div>
  );
}

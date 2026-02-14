'use client';

import { Application } from '@/lib/types/application';
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
} from '@/components/admin/icons';

interface ApplicationCardProps {
  application: Application;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
}

function StatusIcon({ isActive }: { isActive: boolean }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      title={isActive ? 'Active' : 'Archived'}
      aria-label={isActive ? 'Active' : 'Archived'}
    >
      {isActive ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
          <CheckIcon className="h-5 w-5 text-emerald-600" />
        </span>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
          <ArchiveIcon className="h-5 w-5 text-gray-500" />
        </span>
      )}
    </div>
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
  const shareableUrl = getApplicationUrl(application.slug);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareableUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-visible rounded-lg bg-white shadow">
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
          {/* 1. Status icon */}
          <StatusIcon isActive={application.is_active} />

          {/* 2 & 3. Company name - Role applied */}
          <span className="min-w-0 text-sm font-medium text-gray-900 sm:text-base">
            {application.company} - {application.role}
          </span>

          {/* Spacer to push buttons right on larger screens */}
          <div className="hidden flex-1 sm:block" aria-hidden="true" />

          {/* 4. Copy Link button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <CopyIcon className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          {/* 5. View Insights button - expands to show views and creation date */}
          <button
            type="button"
            onClick={() => setInsightsExpanded(!insightsExpanded)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <ChartIcon className="h-4 w-4" />
            View Insights
            {insightsExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>

          {/* 6. View Link button */}
          <Link
            href={`/view/${application.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            View Application
          </Link>

          {/* 7. 3-dot dropdown menu */}
          <ApplicationCardDropdown
            applicationId={application.id}
            isArchived={application.is_active === false}
            onDelete={onDelete}
            onArchive={onArchive}
            onRestore={onRestore}
          />
        </div>

        {/* Expanded insights section */}
        <ApplicationCardInsights
          expanded={insightsExpanded}
          viewCount={application.view_count}
          createdAt={application.created_at}
        />
      </div>
    </div>
  );
}

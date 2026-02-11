'use client';

import { Application } from '@/lib/types/application';
import { getApplicationUrl } from '@/lib/utils/url';
import { copyToClipboard } from '@/lib/utils/clipboard';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useState } from 'react';

interface ApplicationCardProps {
  application: Application;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
}

export default function ApplicationCard({
  application,
  onDelete,
  onArchive,
  onRestore,
}: ApplicationCardProps) {
  const [copied, setCopied] = useState(false);
  const shareableUrl = getApplicationUrl(application.slug);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareableUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this application?')) {
      onDelete(application.id);
    }
  };

  const isArchived = application.is_active === false;

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {application.company}
              </h3>
              {isArchived && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Archived
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">{application.role}</p>
            <p className="mt-2 text-xs text-gray-500">
              Slug: <code className="rounded bg-gray-100 px-1 py-0.5">{application.slug}</code>
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>
                Created: {new Date(application.created_at).toLocaleDateString()}
              </span>
              <span>Views: {application.view_count}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/admin/edit/${application.id}`}>
            <Button variant="primary" type="button">
              Edit
            </Button>
          </Link>
          <Button variant="secondary" type="button" onClick={handleCopyLink}>
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          {isArchived && onRestore ? (
            <Button
              variant="primary"
              type="button"
              className="bg-emerald-600 hover:bg-emerald-500 focus-visible:outline-emerald-600"
              onClick={() => onRestore(application.id)}
            >
              Restore
            </Button>
          ) : onArchive ? (
            <Button
              variant="primary"
              type="button"
              className="bg-amber-600 hover:bg-amber-500 focus-visible:outline-amber-600"
              onClick={() => onArchive(application.id)}
            >
              Archive
            </Button>
          ) : null}
          <Button variant="danger" type="button" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

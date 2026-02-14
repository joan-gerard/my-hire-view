'use client';

import { AnimatePresence, motion } from 'framer-motion';

export interface ApplicationCardInsightsProps {
  expanded: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  /** Last time the page was viewed by a non-owner (null if never viewed). */
  lastViewedAt: string | null;
}

export default function ApplicationCardInsights({
  expanded,
  viewCount,
  downloadCount,
  createdAt,
  lastViewedAt,
}: ApplicationCardInsightsProps) {
  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          key="insights"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-3 flex flex-wrap gap-4 border-t border-gray-100 pt-3">
            <span className="text-sm text-gray-500">
              Views: <strong className="font-medium text-gray-700">{viewCount}</strong>
            </span>
            <span className="text-sm text-gray-500">
              CV downloads:{' '}
              <strong className="font-medium text-gray-700">{downloadCount}</strong>
            </span>
            <span className="text-sm text-gray-500">
              Created:{' '}
              <strong className="font-medium text-gray-700">
                {new Date(createdAt).toLocaleDateString()}
              </strong>
            </span>
            <span className="text-sm text-gray-500">
              Last viewed:{' '}
              <strong className="font-medium text-gray-700">
                {lastViewedAt
                  ? new Date(lastViewedAt).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : '—'}
              </strong>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

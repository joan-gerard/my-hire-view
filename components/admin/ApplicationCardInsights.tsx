"use client";

import { AnimatePresence, motion } from "framer-motion";
import InsightItem from "./InsightItem";

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
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-3 grid grid-cols-1 gap-4 border-t border-gray-100 pt-3 md:grid-cols-2 lg:grid-cols-4">
            <InsightItem label="Views:">{viewCount}</InsightItem>
            <InsightItem label="CV downloads:">{downloadCount}</InsightItem>
            <InsightItem label="Created:">
              {new Date(createdAt).toLocaleDateString()}
            </InsightItem>
            <InsightItem label="Last viewed:">
              {lastViewedAt
                ? new Date(lastViewedAt).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "—"}
            </InsightItem>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

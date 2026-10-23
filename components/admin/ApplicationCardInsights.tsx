"use client";

import AdminModal from "@/components/admin/AdminModal";
import InsightItem from "./InsightItem";

export interface ApplicationCardInsightsProps {
  open: boolean;
  onClose: () => void;
  /** Shown in the dialog description for context. */
  applicationLabel: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  /** Last time the page was viewed by a non-owner (null if never viewed). */
  lastViewedAt: string | null;
}

/** Application insights modal (shared `AdminModal` chrome). */
export default function ApplicationCardInsights({
  open,
  onClose,
  applicationLabel,
  viewCount,
  downloadCount,
  createdAt,
  lastViewedAt,
}: ApplicationCardInsightsProps) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Insights"
      description={
        <p className="truncate">{applicationLabel}</p>
      }
      widthClassName="w-[min(100vw-2rem,28rem)]"
    >
      <div className="space-y-3">
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
    </AdminModal>
  );
}

"use client";

/**
 * Re-export from the admin provider so cards/legend share one hydrated value.
 * Must be used under `StatusIndicatorStyleProvider` (admin layout).
 */
export { useStatusIndicatorStyle } from "@/components/admin/StatusIndicatorStyleProvider";

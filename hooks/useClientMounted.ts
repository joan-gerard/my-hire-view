"use client";

import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  return () => {};
}

function getClientSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * False during SSR and true on the client.
 * Use before reading the browser's local clock or locale so server HTML
 * cannot disagree with hydration.
 */
export function useClientMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
}

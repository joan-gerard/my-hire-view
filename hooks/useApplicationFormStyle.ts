"use client";

import {
  getEnvApplicationFormStyleDefault,
  isApplicationFormStyleSwitchEnabled,
  readApplicationFormStyleSearchParam,
  readStoredApplicationFormStyle,
  replaceApplicationFormStyleSearchParam,
  resolveApplicationFormStyle,
  writeStoredApplicationFormStyle,
  type ApplicationFormStyle,
} from "@/lib/utils/application-form-style";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

function subscribeToUrl(onStoreChange: () => void): () => void {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getSearchParamSnapshot(): string | null {
  return readApplicationFormStyleSearchParam();
}

function getSearchParamServerSnapshot(): string | null {
  return null;
}

/**
 * Active create/edit form layout + setter for F35 A/B manual testing.
 * Priority: `?formStyle=` → localStorage → env → default (`sections`).
 */
export function useApplicationFormStyle(): {
  style: ApplicationFormStyle;
  setStyle: (next: ApplicationFormStyle) => void;
  switchEnabled: boolean;
} {
  const searchParam = useSyncExternalStore(
    subscribeToUrl,
    getSearchParamSnapshot,
    getSearchParamServerSnapshot,
  );

  const [stored, setStored] = useState<ApplicationFormStyle | null>(null);

  useEffect(() => {
    setStored(readStoredApplicationFormStyle());
  }, []);

  const style = resolveApplicationFormStyle({
    searchParam,
    stored,
    envDefault: getEnvApplicationFormStyleDefault(),
  });

  const setStyle = useCallback((next: ApplicationFormStyle) => {
    writeStoredApplicationFormStyle(next);
    setStored(next);
    replaceApplicationFormStyleSearchParam(next);
    // Notify useSyncExternalStore subscribers (replaceState does not fire popstate).
    window.dispatchEvent(new Event("popstate"));
  }, []);

  return {
    style,
    setStyle,
    switchEnabled: isApplicationFormStyleSwitchEnabled(),
  };
}

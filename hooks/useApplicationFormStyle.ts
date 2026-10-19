"use client";

import {
  APPLICATION_FORM_STYLE_CHANGED_EVENT,
  getEnvApplicationFormStyleDefault,
  isApplicationFormStyleSwitchEnabled,
  notifyApplicationFormStyleChanged,
  readApplicationFormStyleSearchParam,
  readStoredApplicationFormStyle,
  replaceApplicationFormStyleSearchParam,
  resolveApplicationFormStyle,
  writeStoredApplicationFormStyle,
  type ApplicationFormStyle,
} from "@/lib/utils/application-form-style";
import { useCallback, useSyncExternalStore } from "react";

function subscribeToStyleSources(onStoreChange: () => void): () => void {
  window.addEventListener(APPLICATION_FORM_STYLE_CHANGED_EVENT, onStoreChange);
  // Real browser Back/Forward may change `?formStyle=` without our event.
  window.addEventListener("popstate", onStoreChange);
  // Cross-tab localStorage updates.
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(
      APPLICATION_FORM_STYLE_CHANGED_EVENT,
      onStoreChange,
    );
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSearchParamSnapshot(): string | null {
  return readApplicationFormStyleSearchParam();
}

function getStoredSnapshot(): ApplicationFormStyle | null {
  return readStoredApplicationFormStyle();
}

function getServerSnapshot(): null {
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
    subscribeToStyleSources,
    getSearchParamSnapshot,
    getServerSnapshot,
  );

  const stored = useSyncExternalStore(
    subscribeToStyleSources,
    getStoredSnapshot,
    getServerSnapshot,
  );

  const style = resolveApplicationFormStyle({
    searchParam,
    stored,
    envDefault: getEnvApplicationFormStyleDefault(),
  });

  const setStyle = useCallback((next: ApplicationFormStyle) => {
    writeStoredApplicationFormStyle(next);
    replaceApplicationFormStyleSearchParam(next);
    notifyApplicationFormStyleChanged();
  }, []);

  return {
    style,
    setStyle,
    switchEnabled: isApplicationFormStyleSwitchEnabled(),
  };
}

"use client";

import { publicIdFromUserMetadata } from "@/lib/auth/ensure-public-id";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_STATUS_INDICATOR_STYLE,
  STATUS_INDICATOR_CHANGED_EVENT,
  readStatusIndicatorStyle,
  resolveStatusIndicatorAccountKey,
  type StatusIndicatorStyle,
  type StatusIndicatorStorage,
} from "@/lib/utils/status-indicator-preference";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const StatusIndicatorStyleContext = createContext<StatusIndicatorStyle>(
  DEFAULT_STATUS_INDICATOR_STYLE,
);

/**
 * Loads the account-scoped status marker preference once for /admin trees.
 */
export function StatusIndicatorStyleProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [style, setStyle] = useState<StatusIndicatorStyle>(
    DEFAULT_STATUS_INDICATOR_STYLE,
  );

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;

      let profilePublicId: string | null = null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("public_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (
        profile &&
        typeof (profile as { public_id?: unknown }).public_id === "string"
      ) {
        profilePublicId = (profile as { public_id: string }).public_id;
      }

      const accountKey = resolveStatusIndicatorAccountKey({
        profilePublicId,
        metadataPublicId: publicIdFromUserMetadata(user),
        authUserId: user.id,
      });
      if (cancelled || !accountKey) return;
      setStyle(readStatusIndicatorStyle(accountKey));
    }

    void hydrate();

    const onChanged = (event: Event) => {
      const detail = (event as CustomEvent<StatusIndicatorStorage>).detail;
      if (detail?.style === "colorful" || detail?.style === "high_contrast") {
        setStyle(detail.style);
      }
    };
    window.addEventListener(STATUS_INDICATOR_CHANGED_EVENT, onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(STATUS_INDICATOR_CHANGED_EVENT, onChanged);
    };
  }, []);

  return (
    <StatusIndicatorStyleContext.Provider value={style}>
      {children}
    </StatusIndicatorStyleContext.Provider>
  );
}

export function useStatusIndicatorStyle(): StatusIndicatorStyle {
  return useContext(StatusIndicatorStyleContext);
}

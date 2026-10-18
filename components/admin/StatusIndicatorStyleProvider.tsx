"use client";

import { publicIdFromUserMetadata } from "@/lib/auth/ensure-public-id";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_STATUS_INDICATOR_STYLE,
  STATUS_INDICATOR_CHANGED_EVENT,
  normalizeProfilePublicIdForPrefs,
  readStatusIndicatorStyle,
  resolveStatusIndicatorAccountKey,
  styleFromStorageEvent,
  type StatusIndicatorChangedDetail,
  type StatusIndicatorStyle,
} from "@/lib/utils/status-indicator-preference";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  const accountKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("public_id")
        .eq("user_id", user.id)
        .maybeSingle();

      const accountKey = resolveStatusIndicatorAccountKey({
        profilePublicId: normalizeProfilePublicIdForPrefs(
          profile?.public_id ?? null,
        ),
        metadataPublicId: publicIdFromUserMetadata(user),
        authUserId: user.id,
      });
      if (cancelled || !accountKey) return;
      accountKeyRef.current = accountKey;
      setStyle(readStatusIndicatorStyle(accountKey));
    }

    void hydrate();

    const onChanged = (event: Event) => {
      const detail = (event as CustomEvent<StatusIndicatorChangedDetail>)
        .detail;
      if (
        !detail ||
        detail.accountKey !== accountKeyRef.current ||
        (detail.style !== "colorful" && detail.style !== "high_contrast")
      ) {
        return;
      }
      setStyle(detail.style);
    };

    const onStorage = (event: StorageEvent) => {
      const key = accountKeyRef.current;
      if (!key) return;
      const next = styleFromStorageEvent(event, key);
      if (next) setStyle(next);
    };

    window.addEventListener(STATUS_INDICATOR_CHANGED_EVENT, onChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener(STATUS_INDICATOR_CHANGED_EVENT, onChanged);
      window.removeEventListener("storage", onStorage);
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

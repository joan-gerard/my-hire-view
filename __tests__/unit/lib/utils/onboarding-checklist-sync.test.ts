import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ONBOARDING_CHECKLIST_CHANGED_EVENT,
  notifyOnboardingChecklistChanged,
  subscribeOnboardingChecklistChanged,
} from "@/lib/utils/onboarding-checklist-sync";

describe("onboarding-checklist-sync", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("dispatches the shared browser event", () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal("window", { dispatchEvent });

    notifyOnboardingChecklistChanged();

    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: ONBOARDING_CHECKLIST_CHANGED_EVENT }),
    );
  });

  it("subscribes and unsubscribes listeners", () => {
    const listeners = new Set<() => void>();
    vi.stubGlobal("window", {
      addEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
        if (typeof listener === "function") {
          listeners.add(listener as () => void);
        }
      },
      removeEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
        if (typeof listener === "function") {
          listeners.delete(listener as () => void);
        }
      },
      dispatchEvent: (event: Event) => {
        if (event.type !== ONBOARDING_CHECKLIST_CHANGED_EVENT) return false;
        for (const listener of listeners) listener();
        return true;
      },
    });

    const listener = vi.fn();
    const unsubscribe = subscribeOnboardingChecklistChanged(listener);
    notifyOnboardingChecklistChanged();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    notifyOnboardingChecklistChanged();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("no-ops when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(() => notifyOnboardingChecklistChanged()).not.toThrow();
    expect(subscribeOnboardingChecklistChanged(() => {})()).toBeUndefined();
  });
});

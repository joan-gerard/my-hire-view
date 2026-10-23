/**
 * Group admin dashboard applications by calendar day of `created_at`.
 * Preserves input order within and across days (API returns newest first).
 *
 * These helpers use the **runtime local timezone** (or an explicit IANA
 * `timeZone`). Call them only after client mount — e.g. once
 * `useClientMounted()` is true — so SSR HTML cannot disagree with hydration.
 */

export type ApplicationDayGroup<T extends { created_at: string }> = {
  /** Calendar day key `YYYY-MM-DD` in the chosen zone. */
  dayKey: string;
  /** Uppercase date heading, e.g. `OCTOBER 15, 2026`. */
  label: string;
  applications: T[];
};

function dayKeyFromParts(parts: Intl.DateTimeFormatPart[]): string {
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  if (!year || !month || !day) {
    throw new Error("Could not format application day key");
  }
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/** `YYYY-MM-DD` in the runtime locale zone, or `timeZone` when provided. */
export function applicationDayKey(iso: string, timeZone?: string): string {
  const d = new Date(iso);
  if (timeZone) {
    return dayKeyFromParts(
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(d),
    );
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Day heading matching the dashboard day-group chrome. */
export function formatApplicationDayLabel(
  iso: string,
  timeZone?: string,
): string {
  return new Date(iso)
    .toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
      ...(timeZone ? { timeZone } : {}),
    })
    .toUpperCase();
}

/** Compact local time for the row leading column, e.g. `4:46pm`. */
export function formatApplicationTime(iso: string, timeZone?: string): string {
  return new Date(iso)
    .toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      ...(timeZone ? { timeZone } : {}),
    })
    .toLowerCase()
    .replace(/\s/g, "");
}

export function groupApplicationsByDay<T extends { created_at: string }>(
  applications: readonly T[],
  timeZone?: string,
): ApplicationDayGroup<T>[] {
  const groups: ApplicationDayGroup<T>[] = [];
  const indexByKey = new Map<string, number>();

  for (const app of applications) {
    const dayKey = applicationDayKey(app.created_at, timeZone);
    const existing = indexByKey.get(dayKey);
    if (existing === undefined) {
      indexByKey.set(dayKey, groups.length);
      groups.push({
        dayKey,
        label: formatApplicationDayLabel(app.created_at, timeZone),
        applications: [app],
      });
    } else {
      groups[existing].applications.push(app);
    }
  }

  return groups;
}

/**
 * Group admin dashboard applications by local calendar day of `created_at`.
 * Preserves input order within and across days (API returns newest first).
 */

export type ApplicationDayGroup<T extends { created_at: string }> = {
  /** Local calendar day key `YYYY-MM-DD`. */
  dayKey: string;
  /** Uppercase date heading, e.g. `OCTOBER 15, 2026`. */
  label: string;
  applications: T[];
};

/** Local `YYYY-MM-DD` for grouping (not UTC midnight). */
export function applicationDayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Day heading matching the dashboard day-group chrome. */
export function formatApplicationDayLabel(iso: string): string {
  return new Date(iso)
    .toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

/** Compact local time for the row leading column, e.g. `4:46pm`. */
export function formatApplicationTime(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })
    .toLowerCase()
    .replace(/\s/g, "");
}

export function groupApplicationsByDay<T extends { created_at: string }>(
  applications: readonly T[],
): ApplicationDayGroup<T>[] {
  const groups: ApplicationDayGroup<T>[] = [];
  const indexByKey = new Map<string, number>();

  for (const app of applications) {
    const dayKey = applicationDayKey(app.created_at);
    const existing = indexByKey.get(dayKey);
    if (existing === undefined) {
      indexByKey.set(dayKey, groups.length);
      groups.push({
        dayKey,
        label: formatApplicationDayLabel(app.created_at),
        applications: [app],
      });
    } else {
      groups[existing].applications.push(app);
    }
  }

  return groups;
}

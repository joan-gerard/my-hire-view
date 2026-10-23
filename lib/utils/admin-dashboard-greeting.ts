/**
 * Time-of-day greeting for the admin dashboard header (client local clock).
 * Call only after client mount so SSR cannot pick the server's morning/evening.
 */
export function timeOfDayGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

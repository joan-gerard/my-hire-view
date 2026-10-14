import { LOGO_DOT_COLORS } from "@/lib/marketing/constants";

/** Prefer ASCII punctuation in homepage copy (shared constants may use em dashes). */
export function withoutEmDash(text: string): string {
  return text.replace(/\s*\u2014\s*/g, " - ");
}

export function dailyLogoDotColor(date = new Date()): string {
  const day = Math.floor(date.getTime() / 86_400_000);
  return LOGO_DOT_COLORS[day % LOGO_DOT_COLORS.length];
}

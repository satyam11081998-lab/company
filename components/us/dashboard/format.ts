/**
 * Date helpers for the US app, rendered server-side in the VIEWER's timezone
 * (the `mece_tz` cookie written by components/region/region-probe.tsx), so
 * "today", "yesterday" and the streak dots match the person's own calendar
 * with no client-side flash. Falls back to US Eastern.
 */

export const DEFAULT_TZ = 'America/New_York';

export function safeTz(tz: string | null | undefined): string {
  if (!tz) return DEFAULT_TZ;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    return DEFAULT_TZ;
  }
}

/** YYYY-MM-DD of an instant, in `tz`. */
export function dayKey(d: Date | string, tz: string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function hourIn(tz: string, now: Date = new Date()): number {
  const h = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(now);
  return Number(h) % 24;
}

export function greetingFor(tz: string, now: Date = new Date()): string {
  const h = hourIn(tz, now);
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** "Today" / "Yesterday" / "Sep 24" in the viewer's calendar. */
export function relativeDay(iso: string, tz: string, now: Date = new Date()): string {
  const k = dayKey(iso, tz);
  const today = dayKey(now, tz);
  const y = new Date(now.getTime() - 86400000);
  if (k === today) return 'Today';
  if (k === dayKey(y, tz)) return 'Yesterday';
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric' }).format(new Date(iso));
}

export function longDate(tz: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric' }).format(now);
}

export function shortDate(iso: string | null | undefined, tz: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

/** The last seven days (oldest → today) with a weekday initial and whether practiced. */
export function lastSevenDays(timestamps: string[], tz: string, now: Date = new Date()) {
  const practiced = new Set(timestamps.map((t) => dayKey(t, tz)));
  const out: { key: string; initial: string; name: string; practiced: boolean; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = dayKey(d, tz);
    const name = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(d);
    out.push({ key, initial: name.charAt(0), name, practiced: practiced.has(key), isToday: i === 0 });
  }
  return out;
}

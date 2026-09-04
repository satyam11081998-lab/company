// Real-time interview minute packs. ONE source of truth for price + minutes,
// imported by the order route, the verify route, and the buy UI so they can
// never drift. Prices are ~2x the ~Rs 4/min Gemini Live cost, with a volume
// discount on the larger packs.
export type RealtimePackId = 'p20' | 'p60' | 'p120';

export const REALTIME_PACKS: Record<RealtimePackId, { minutes: number; priceInr: number; label: string }> = {
  p20: { minutes: 20, priceInr: 99, label: '20 min' },
  p60: { minutes: 60, priceInr: 249, label: '60 min' },
  p120: { minutes: 120, priceInr: 449, label: '120 min' },
};

export function realtimePack(id: string): { minutes: number; priceInr: number; label: string } | undefined {
  return (REALTIME_PACKS as Record<string, { minutes: number; priceInr: number; label: string }>)[id];
}

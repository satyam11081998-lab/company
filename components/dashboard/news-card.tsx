'use client';

import React from 'react';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Bolt } from './icons';
import HomeImage from '@/components/home/photo';
import type { DailyContentResponse } from '@/lib/api';
import type { DashPhoto } from '@/lib/dashboard/photos';

/* ── Types ── */
interface NewsCardProps {
  u: any;
  brief?: DailyContentResponse['brief'];
  /**
   * A photograph of what today's story is about (lib/dashboard/photos.ts →
   * dashPhotoForBrief), chosen on the server. It melts into the card from its
   * right edge; without one the card keeps its plain surface.
   */
  photo?: DashPhoto;
}

/** "3 hr ago" / "yesterday" / "2 Oct" — for the brief's publish time. */
function publishedLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 0) return null;
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  if (hrs < 48) return 'yesterday';
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}

/* ── NewsCard ──
 *
 * Today's GD brief (India). 2026-09-30: the navy chart rail became a photo of
 * the story's subject, and the made-up "FT · 4 hr ago · 4 min read" line and
 * the canned "BCG to acquire Quantis" copy are gone — the card now shows only
 * what the brief row actually carries (title, source, publish time).
 */
export function NewsCard({ u: _u, brief, photo }: NewsCardProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleToCase = async () => {
    if (!brief?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/news/${brief.id}/to-case`, { method: 'POST' });

      // Try to read the JSON body in both success and error paths so we can
      // surface the real server-side reason (RLS violation, missing brief, etc.)
      // instead of a generic "Failed to create case" toast.
      let payload: { case_id?: string; error?: string } | null = null;
      try {
        payload = (await res.json()) as { case_id?: string; error?: string };
      } catch {
        // body wasn't JSON — keep payload null
      }

      if (res.status === 429) {
        toast('Daily free tier quota exhausted.', {
          action: { label: 'Upgrade', onClick: () => router.push('/pricing') },
        });
        return;
      }
      if (!res.ok) {
        throw new Error(payload?.error || `Failed (HTTP ${res.status})`);
      }
      if (payload?.case_id) {
        router.push(`/cases/${payload.case_id}`);
      } else {
        throw new Error('No case_id in response');
      }
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const when = publishedLabel(brief?.published_at);
  const source = brief?.source_name?.trim() || null;

  return (
    <section
      aria-labelledby="brief-title"
      className="relative isolate flex min-h-[214px] overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--card-hex)]"
    >
      {/* Photo: a band on phones, the left 44% from md, fading into the copy. */}
      {photo && (
        <div aria-hidden className="dash-photo-brief pointer-events-none absolute inset-x-0 top-0 -z-10 h-[150px] md:inset-y-0 md:right-auto md:h-auto md:w-[44%]">
          <HomeImage
            photo={photo}
            decorative
            sizes="(min-width: 1280px) 330px, (min-width: 768px) 30vw, 100vw"
            widths={[360, 540, 720, 960]}
            className="dash-photo-img h-full w-full object-cover"
          />
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-[4px] bg-black/45 px-2 py-[3px] text-[9px] font-bold tracking-[0.12em] text-white backdrop-blur-sm">
        DAILY BRIEF
      </span>

      <div
        className={`relative flex min-w-0 flex-1 flex-col gap-2 px-5 pb-4 ${
          photo ? 'pt-[120px] md:ml-[40%] md:pl-1 md:pr-5 md:pt-4' : 'pt-11 md:pt-12'
        }`}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="chip red" style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Relevant to you
          </span>
          {(source || when) && (
            <span className="text-[10.5px] text-[var(--ink-4)]" style={{ fontFamily: 'var(--ff-mono)' }}>
              {[source, when].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
        <h3 id="brief-title" className="serif m-0 text-[18px] leading-[1.25] tracking-[-0.01em] text-[var(--ink)]">
          {brief?.title || 'Today’s brief is on its way.'}
        </h3>
        <p className="m-0 text-[12px] leading-[1.5] text-[var(--ink-3)]">
          {brief?.id ? (
            <>Why it matters: a live business story, the kind a GD panel or a partner round opens with. Turn it into a case and practise the structure on it.</>
          ) : (
            <>A new brief lands every morning. Until then, the GD library has every past brief.</>
          )}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-3.5 pt-2.5">
          <button
            type="button"
            className="btn primary"
            onClick={handleToCase}
            disabled={loading || !brief?.id}
            style={{ opacity: loading || !brief?.id ? 0.6 : 1, whiteSpace: 'nowrap' }}
          >
            {loading ? 'Generating…' : (<><Bolt style={{ width: 13, height: 13 }} /> Turn into a 15-min case</>)}
          </button>
          <button
            type="button"
            onClick={() => router.push(brief?.id ? `/gd-briefs/${brief.id}` : '/gd-briefs')}
            className="text-[12.5px] font-semibold text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
          >
            {brief?.id ? 'Read brief →' : 'Open GD briefs →'}
          </button>
        </div>
      </div>
    </section>
  );
}

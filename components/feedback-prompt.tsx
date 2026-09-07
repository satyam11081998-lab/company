'use client';

/**
 * Gentle in-app feedback / testimonial prompt.
 *
 * Shows ONCE, only after a user has completed 5+ cases/guesstimates combined
 * (so it never interrupts a newcomer). Warm and low-pressure: a rating, two open
 * questions, and an opt-in to feature their words as a testimonial. Writes to the
 * `feedback` table via the browser client (RLS: users insert their own row).
 *
 * "Maybe later" and a successful send both set a localStorage flag so we never
 * nag the same person twice.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const DONE_KEY = 'mece_feedback_done';       // submitted, or "don't show again" -> never again
const SNOOZE_KEY = 'mece_feedback_snooze';   // last "maybe later" (ms) -> re-ask the next day
const THRESHOLD = 5;                          // more than four completed
const DAY_MS = 24 * 60 * 60 * 1000;

function isDone(): boolean {
  try { return localStorage.getItem(DONE_KEY) === '1'; } catch { return false; }
}
function snoozedRecently(): boolean {
  try { return Date.now() - Number(localStorage.getItem(SNOOZE_KEY) || 0) < DAY_MS; } catch { return false; }
}
function markDone() { try { localStorage.setItem(DONE_KEY, '1'); } catch { /* private mode */ } }
function markSnooze() { try { localStorage.setItem(SNOOZE_KEY, String(Date.now())); } catch { /* private mode */ } }

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? '#f5a623' : 'none'}
      stroke={filled ? '#f5a623' : '#c9ced6'} strokeWidth={1.7} strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.6l2.9 6.03 6.6.87-4.85 4.55 1.2 6.55L12 17.9l-5.85 3.1 1.2-6.55L2.5 9.5l6.6-.87z" />
    </svg>
  );
}

export default function FeedbackPrompt({ completedCount }: { completedCount: number }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [working, setWorking] = useState('');
  const [improve, setImprove] = useState('');
  const [allow, setAllow] = useState(false);
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (completedCount >= THRESHOLD && !isDone() && !snoozedRecently()) {
      const t = setTimeout(() => setOpen(true), 2500); // let the dashboard settle first
      return () => clearTimeout(t);
    }
  }, [completedCount]);

  useEffect(() => {
    // Prefill the name so featuring a testimonial feels personal, not a form.
    (async () => {
      try {
        const { data: { user } } = await createClient().auth.getUser();
        const n = (user?.user_metadata as any)?.full_name || (user?.email ? user.email.split('@')[0] : '');
        if (n) setName(n);
      } catch { /* fine */ }
    })();
  }, []);

  function later() {        // "Maybe later" / backdrop tap — re-ask tomorrow
    markSnooze();
    setOpen(false);
  }
  function neverAgain() {   // "Don't show again" — permanent
    markDone();
    setOpen(false);
  }

  async function submit() {
    setSending(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('feedback').insert({
        user_id: user?.id ?? null,
        rating: rating || null,
        working_well: working.trim() || null,
        improve: improve.trim() || null,
        allow_testimonial: allow,
        display_name: allow ? (name.trim() || null) : null,
      });
      markDone();
      setDone(true);
      setTimeout(() => setOpen(false), 2200);
    } catch {
      // Never trap them in a form that won't close.
      markDone();
      setDone(true);
      setTimeout(() => setOpen(false), 2000);
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(15,28,51,0.62)', backdropFilter: 'blur(7px)',
      }}
      onClick={later}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440, background: '#ffffff',
          borderRadius: 16, boxShadow: '0 24px 70px rgba(0,0,0,0.38)',
          padding: '24px 24px 20px', color: '#0f1c33',
        }}
      >
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 8px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Thank you — truly.</div>
            <p style={{ fontSize: 14, color: '#586074', lineHeight: 1.5, margin: 0 }}>
              This genuinely helps us make MECE better for you. We read every word.
            </p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em' }}>
              Quick question — how are you finding MECE?
            </div>
            <p style={{ fontSize: 13.5, color: '#586074', lineHeight: 1.55, margin: '8px 0 18px' }}>
              You&rsquo;ve done a few cases now, so your take really matters. We&rsquo;re a small team, we read
              every response, and your suggestions are worked on — not filed away. Takes 20 seconds.
            </p>

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Would you recommend MECE to a friend prepping for placements?
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}
                >
                  <StarIcon filled={(hover || rating) >= n} />
                </button>
              ))}
            </div>

            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>
              What&rsquo;s working well for you?
            </label>
            <textarea
              value={working}
              onChange={(e) => setWorking(e.target.value)}
              rows={2}
              placeholder="Anything you like so far…"
              style={ta}
            />

            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', margin: '12px 0 5px' }}>
              What could we do better?
            </label>
            <textarea
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              rows={2}
              placeholder="Big or small — we act on it, promise."
              style={ta}
            />

            <label style={{ display: 'flex', gap: 9, alignItems: 'flex-start', margin: '16px 0 4px', cursor: 'pointer' }}>
              <input type="checkbox" checked={allow} onChange={(e) => setAllow(e.target.checked)} style={{ marginTop: 3 }} />
              <span style={{ fontSize: 12.5, color: '#586074', lineHeight: 1.5 }}>
                You&rsquo;re welcome to feature my words as a testimonial on the MECE website.
              </span>
            </label>
            {allow && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name to show (first name is perfect)"
                style={{ ...ta, minHeight: 0, padding: '8px 10px', marginTop: 6 } as any}
              />
            )}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
              <button type="button" onClick={neverAgain} style={{ ...btnGhost, fontSize: 12, color: '#98a0af' }}>Don&rsquo;t show again</button>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button type="button" onClick={later} style={btnGhost}>Maybe later</button>
                <button type="button" onClick={submit} disabled={sending} style={{ ...btnPrimary, opacity: sending ? 0.7 : 1 }}>
                  {sending ? 'Sending…' : 'Send feedback'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const ta: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', resize: 'vertical',
  border: '1px solid #d6dae1', borderRadius: 9,
  padding: '9px 11px', fontSize: 13.5, font: 'inherit', color: '#0f1c33',
  background: '#ffffff',
};
const btnGhost: React.CSSProperties = {
  background: 'none', border: 'none', color: '#586074',
  fontSize: 13, fontWeight: 600, cursor: 'pointer', font: 'inherit',
};
const btnPrimary: React.CSSProperties = {
  background: '#dc2626', color: '#fff', border: 'none',
  padding: '10px 18px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
  cursor: 'pointer', font: 'inherit', boxShadow: '0 3px 12px rgba(220,38,38,0.3)',
};

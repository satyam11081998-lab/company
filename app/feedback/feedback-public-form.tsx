'use client';

/**
 * Public, no-login feedback page — shareable link (https://mece.in/feedback).
 * Posts to the existing POST /api/feedback (RLS allows anonymous inserts into
 * public.feedback_reports). Self-contained: no external UI deps, never throws.
 *
 * A ?src= query param (e.g. /feedback?src=email) is recorded as context.referrer
 * so the team can see which channel the feedback came from.
 */

import { useState } from 'react';
import { FEEDBACK_CATEGORIES } from '@/lib/feedback';
import type { FeedbackCategory } from '@/lib/types';

export default function FeedbackPublicForm() {
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function submit() {
    if (!message.trim()) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const src =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('src')
          : null;
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          contact_email: email.trim() || undefined,
          website, // honeypot
          path: '/feedback',
          context: {
            referrer: src ? `public-${src}` : 'public-feedback',
            viewport:
              typeof window !== 'undefined'
                ? `${window.innerWidth}x${window.innerHeight}`
                : '',
          },
        }),
      });
      if (!res.ok && res.status !== 200) throw new Error(String(res.status));
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Thank you 🙏</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your feedback reached the MECE team. If you left your email, we may reach out to
          understand it better. It genuinely helps us make the product sharper for you.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-bold text-foreground">Tell us how MECE is working for you</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        What&apos;s helping, what&apos;s getting in the way, and anything you&apos;d change. A minute of
        your time makes the product better for everyone preparing with us.
      </p>

      {/* Category chips */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {FEEDBACK_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            title={c.hint}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === c.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        rows={5}
        maxLength={4000}
        placeholder="What's off, or what would make this better?"
        className="mt-3 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Email (optional — only if you'd like us to reply)"
        className="mt-2 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {/* Honeypot: hidden from humans, tempting to bots. */}
      <input
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        name="website"
      />

      {status === 'error' && (
        <p className="mt-2 text-xs text-red-500">
          {message.trim() ? 'Could not send — please try again.' : 'Please add a short message first.'}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={status === 'sending'}
          className="btn-primary rounded-lg px-5 py-2 text-sm disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send feedback'}
        </button>
      </div>
    </div>
  );
}

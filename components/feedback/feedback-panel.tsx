'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { FEEDBACK_CATEGORIES } from '@/lib/feedback';
import type { FeedbackCategory } from '@/lib/types';

interface FeedbackPanelProps {
  open: boolean;
  onClose: () => void;
  /** Pre-selected category (e.g. flag buttons default to 'data_discrepancy'). */
  defaultCategory?: FeedbackCategory;
  /** Extra context captured at the flag site (entity_type / entity_id, etc.). */
  context?: Record<string, string>;
  /** Optional override for the captured page path. */
  pathOverride?: string;
}

export function FeedbackPanel({
  open,
  onClose,
  defaultCategory = 'general',
  context,
  pathOverride,
}: FeedbackPanelProps) {
  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);

  // Reset to the requested default each time the panel opens.
  useEffect(() => {
    if (open) {
      setCategory(defaultCategory);
      setMessage('');
      setEmail('');
      setWebsite('');
    }
  }, [open, defaultCategory]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit() {
    if (!message.trim()) {
      toast.error('Please add a short message.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          contact_email: email.trim() || undefined,
          website, // honeypot
          path: pathOverride ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
          context: {
            ...(context ?? {}),
            viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
          },
        }),
      });
      if (!res.ok && res.status !== 200) throw new Error(String(res.status));
      toast.success('Thanks — we’ll look into it.');
      onClose();
    } catch {
      toast.error('Could not send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Send feedback">
      {/* Backdrop */}
      <button aria-label="Close" className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Send feedback</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category chips */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {FEEDBACK_CATEGORIES.map((c) => (
            <button
              key={c.id}
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
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          autoFocus
          maxLength={4000}
          placeholder="What’s off, or what would make this better?"
          className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email (optional — only if you’d like a reply)"
          className="mt-2 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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

        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="btn-primary rounded-lg px-4 py-2 text-sm disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

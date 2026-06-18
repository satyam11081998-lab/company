'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

/**
 * Public "Share your experience" form. Submits a testimonial as `pending`;
 * it only appears on the site after an admin approves it from /admin/testimonials.
 * Drop it anywhere (landing, /about, a dedicated page).
 */
export default function TestimonialSubmit() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [placement, setPlacement] = useState('');
  const [quote, setQuote] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!name.trim() || !quote.trim()) {
      toast.error('Please add your name and a short quote.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          school: school.trim(),
          placement: placement.trim(),
          quote: quote.trim(),
          linkedin_url: linkedin.trim() || undefined,
          submitted_email: email.trim() || undefined,
          website,
        }),
      });
      if (!res.ok && res.status !== 200) throw new Error(String(res.status));
      setDone(true);
      toast.success('Thanks! We’ll review and publish it soon.');
    } catch {
      toast.error('Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <p className="text-body text-foreground">Your testimonial is in — we’ll review it shortly. 🙏</p>
      </Card>
    );
  }

  if (!open) {
    return (
      <div className="text-center">
        <button onClick={() => setOpen(true)} className="btn-ghost">
          Used MECE? Share your experience →
        </button>
      </div>
    );
  }

  const field = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <Card className="mx-auto max-w-xl p-6">
      <h3 className="mb-1 text-lg font-semibold text-foreground">Share your experience</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        We review every submission before it goes live. A LinkedIn link helps us verify you faster.
      </p>
      <div className="space-y-3">
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" />
        <input className={field} value={school} onChange={(e) => setSchool(e.target.value)} placeholder="College / programme (e.g. IIM Indore PGP '27)" />
        <input className={field} value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="Role / internship (e.g. Summer Intern @ Bain)" />
        <textarea
          className="w-full resize-none rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          rows={3}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          maxLength={600}
          placeholder="What did MECE do for you? *"
        />
        <input className={field} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn profile URL" />
        <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (so we can reach you — not shown publicly)" />
        {/* honeypot */}
        <input value={website} onChange={(e) => setWebsite(e.target.value)} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        <button onClick={submit} disabled={submitting} className="btn-primary rounded-lg px-4 py-2 text-sm disabled:opacity-60">
          {submitting ? 'Submitting…' : 'Submit for review'}
        </button>
      </div>
    </Card>
  );
}

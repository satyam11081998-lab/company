import { createClient } from '@/lib/supabase/server';
import type { TestimonialRow } from '@/lib/types';
import { TestimonialsAdminClient } from './testimonials-admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminTestimonialsPage() {
  const supabase = createClient();
  // RLS testimonials_select_admin lets an admin read all rows (incl. pending).
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .order('status', { ascending: true })
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });

  const rows = (data as TestimonialRow[] | null) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Testimonials</h1>
        <p className="text-muted-foreground mt-1">
          Add testimonials, and approve the ones users submit. Published ones show on the landing page.
        </p>
      </div>
      <TestimonialsAdminClient initialRows={rows} />
    </div>
  );
}

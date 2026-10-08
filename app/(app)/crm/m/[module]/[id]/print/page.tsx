import { notFound } from 'next/navigation';
import { requireCrm, CrmAccessError } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { getRecord } from '@/lib/crm/server/records';
import { resolveRefs } from '@/lib/crm/server/names';
import PrintButton from '@/components/crm/print-button';

export const dynamic = 'force-dynamic';

const TITLES: Record<string, { title: string; number: string }> = {
  quotes: { title: 'Quotation', number: 'quote_number' },
  sales_orders: { title: 'Sales order', number: 'so_number' },
  invoices: { title: 'Invoice', number: 'invoice_number' },
  purchase_orders: { title: 'Purchase order', number: 'po_number' },
};

/** Printable document (browser Print → Save as PDF). */
export default async function PrintPage({ params }: { params: { module: string; id: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  const t = TITLES[params.module];
  if (!t) notFound();
  const meta = await loadMeta();
  let rec;
  try {
    rec = await getRecord(ctx, meta, params.module, params.id);
  } catch (e) {
    if (e instanceof CrmAccessError) notFound();
    throw e;
  }
  const refs = await resolveRefs(ctx, meta, [rec]);
  const d = rec.data;
  const cur = String(d.currency ?? 'INR');
  const money = (n: unknown) => (typeof n === 'number' ? n.toLocaleString(cur === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: cur, maximumFractionDigits: 2 }) : '—');
  const items = Array.isArray(d.line_items) ? (d.line_items as Array<Record<string, unknown>>) : [];
  const party = (id: unknown) => (typeof id === 'string' && refs[id] && !refs[id].restricted ? refs[id].name : null);
  const date = (d.invoice_date ?? d.po_date ?? rec.created_at) as string;

  return (
    <div id="crm-print" className="mx-auto max-w-3xl bg-white p-8 text-[13px] text-black print:p-0">
      {/* Print only this document, not the app chrome around it. */}
      <style>{'@media print { body * { visibility: hidden !important; } #crm-print, #crm-print * { visibility: visible !important; } #crm-print { position: absolute; left: 0; top: 0; width: 100%; } }'}</style>
      <div className="mb-6 flex items-start justify-between print:hidden"><PrintButton /></div>
      <header className="flex items-start justify-between border-b-2 border-black pb-4">
        <div>
          <p className="text-2xl font-bold tracking-tight">MECE</p>
          <p className="text-xs">mece.in · team@mece.in</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">{t.title}</p>
          <p>{String(d[t.number] ?? '')}</p>
          <p className="text-xs">Date: {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          {typeof d.valid_until === 'string' && <p className="text-xs">Valid until: {d.valid_until}</p>}
          {typeof d.due_date === 'string' && <p className="text-xs">Due: {d.due_date}</p>}
          {typeof d.status === 'string' && <p className="text-xs">Status: {d.status}</p>}
        </div>
      </header>
      <section className="mt-4 grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold uppercase">{params.module === 'purchase_orders' ? 'Vendor' : 'Bill to'}</p>
          <p>{party(d.vendor_id) ?? party(d.account_id) ?? party(d.contact_id) ?? '—'}</p>
          {party(d.contact_id) && party(d.account_id) && <p className="text-xs">Attn: {party(d.contact_id)}</p>}
        </div>
        <div><p className="text-xs font-semibold uppercase">Subject</p><p>{String(d.subject ?? rec.name)}</p></div>
      </section>
      <table className="mt-6 w-full border-collapse">
        <thead><tr className="border-b border-black text-left"><th className="py-1.5">Item</th><th className="py-1.5 text-right">Qty</th><th className="py-1.5 text-right">Price</th><th className="py-1.5 text-right">Discount</th><th className="py-1.5 text-right">Tax</th><th className="py-1.5 text-right">Amount</th></tr></thead>
        <tbody>
          {items.map((l, i) => (
            <tr key={i} className="border-b border-gray-300">
              <td className="py-1.5">{String(l.product_name ?? '')}{l.description ? <span className="block text-xs text-gray-600">{String(l.description)}</span> : null}</td>
              <td className="py-1.5 text-right">{String(l.quantity ?? '')}</td>
              <td className="py-1.5 text-right">{money(l.list_price)}</td>
              <td className="py-1.5 text-right">{money(l.discount)}</td>
              <td className="py-1.5 text-right">{l.tax_pct ? `${l.tax_pct}%` : '—'}</td>
              <td className="py-1.5 text-right">{money(l.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ml-auto mt-4 w-64 space-y-1">
        <p className="flex justify-between"><span>Sub-total</span><span>{money(d.sub_total)}</span></p>
        <p className="flex justify-between"><span>Discount</span><span>−{money(d.discount_total)}</span></p>
        <p className="flex justify-between"><span>Tax</span><span>{money(d.tax_total)}</span></p>
        {typeof d.adjustment === 'number' && d.adjustment !== 0 && <p className="flex justify-between"><span>Adjustment</span><span>{money(d.adjustment)}</span></p>}
        <p className="flex justify-between border-t border-black pt-1 text-base font-semibold"><span>Total</span><span>{money(d.grand_total)}</span></p>
      </div>
      {typeof d.terms === 'string' && d.terms && (<section className="mt-8"><p className="text-xs font-semibold uppercase">Terms</p><p className="whitespace-pre-wrap text-xs">{d.terms}</p></section>)}
      {params.module === 'invoices' && typeof d.payment_ref === 'string' && <p className="mt-6 text-xs">Paid online · Razorpay reference {d.payment_ref}. Prices for individual plans are inclusive of applicable taxes.</p>}
    </div>
  );
}

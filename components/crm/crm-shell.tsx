'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, Loader2, Menu, Search, X } from 'lucide-react';
import Wordmark from '@/components/home/wordmark';
import { CrmIcon } from './icons';
import NavProgress from './nav-progress';

export interface NavModule {
  api: string;
  label: string;
  icon: string;
  kind: string;
}

interface Perms {
  analytics: boolean;
  reports: boolean;
  setup: boolean;
  audit: boolean;
  privacy: boolean;
  outbox: boolean;
  ai: boolean;
  marketing: boolean;
  surveys: boolean;
  service: boolean;
  automation: boolean;
}


const GROUPS: Array<{ label: string; modules: string[] }> = [
  { label: 'Sales', modules: ['leads', 'contacts', 'accounts', 'deals'] },
  { label: 'Activities', modules: ['tasks', 'calls', 'meetings'] },
  { label: 'Service', modules: ['cases', 'solutions'] },
  { label: 'Marketing', modules: ['campaigns'] },
  { label: 'Inventory', modules: ['products', 'price_books', 'quotes', 'sales_orders', 'invoices', 'vendors', 'purchase_orders'] },
];

export default function CrmShell({ modules, perms, unread, superAdmin, children }: {
  modules: NavModule[];
  perms: Perms;
  unread: number;
  superAdmin: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  // the link just clicked lights up at once, before the next page arrives
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  useEffect(() => { setPendingHref(null); }, [pathname]);
  const byApi = new Map(modules.map((m) => [m.api, m]));
  const custom = modules.filter((m) => m.kind === 'custom');

  const link = (href: string, label: string, icon: string, exact = false) => {
    const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');
    const going = pendingHref === href && !active;
    return (
      <Link
        key={href}
        href={href}
        onClick={(e) => {
          setOpen(false);
          if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !active) setPendingHref(href);
        }}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
          active ? 'bg-navy text-navy-foreground font-medium' : going ? 'bg-navy/10 text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <CrmIcon name={icon} className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
        {going && <Loader2 className="ml-auto h-3.5 w-3.5 shrink-0 animate-spin text-navy motion-reduce:animate-none" aria-hidden />}
      </Link>
    );
  };

  const nav = (
    <nav className="space-y-4 text-sm" aria-label="CRM">
      <div className="space-y-0.5">{link('/crm', 'Home', 'Home', true)}{link('/crm/approvals', 'My approvals', 'ShieldCheck')}</div>
      {GROUPS.map((g) => {
        const items = g.modules.map((api) => byApi.get(api)).filter(Boolean) as NavModule[];
        const extras: React.ReactNode[] = [];
        if (g.label === 'Service' && perms.service) extras.push(link('/crm/service', 'Service console', 'Gauge'));
        if (g.label === 'Marketing') {
          if (perms.marketing) {
            extras.push(link('/crm/marketing/templates', 'Email templates', 'Mail'));
            extras.push(link('/crm/marketing/segments', 'Segments', 'Layers'));
            extras.push(link('/crm/marketing/forms', 'Web forms', 'FileInput'));
          }
          if (perms.surveys) extras.push(link('/crm/marketing/surveys', 'Surveys (NPS/CSAT)', 'Smile'));
        }
        if (!items.length && !extras.length) return null;
        return (
          <div key={g.label}>
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{g.label}</p>
            <div className="space-y-0.5">{items.map((m) => link(`/crm/m/${m.api}`, m.label, m.icon))}{extras}</div>
          </div>
        );
      })}
      {custom.length > 0 && (
        <div>
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">Custom</p>
          <div className="space-y-0.5">{custom.map((m) => link(`/crm/m/${m.api}`, m.label, m.icon))}</div>
        </div>
      )}
      <div>
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">Insights</p>
        <div className="space-y-0.5">
          {perms.analytics && link('/crm/analytics', 'Customer analytics', 'PieChart')}
          {perms.reports && link('/crm/reports', 'Reports', 'BarChart3')}
          {perms.reports && link('/crm/dashboards', 'Dashboards', 'LayoutDashboard')}
          {perms.reports && byApi.has('deals') && link('/crm/forecasts', 'Forecasts', 'Target')}
          {perms.ai && link('/crm/ai', 'Iris (AI assistant)', 'Bot')}
        </div>
      </div>
      <div>
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">Admin</p>
        <div className="space-y-0.5">
          {perms.outbox && link('/crm/outbox', 'Outbox', 'Send')}
          {perms.automation && link('/crm/automation', 'Automation', 'Workflow')}
          {perms.privacy && link('/crm/privacy', 'Privacy (DPDP)', 'ShieldCheck')}
          {perms.audit && link('/crm/audit', 'Audit log', 'History')}
          {link('/crm/recycle-bin', 'Recycle bin', 'Trash2')}
          {perms.setup && link('/crm/setup', 'Setup', 'Settings')}
          {superAdmin && (
            <Link href="/admin" className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <CrmIcon name="Globe" className="h-4 w-4" /> Back to admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <NavProgress />
      <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-[1500px] items-center gap-3 px-4">
          <button type="button" className="rounded-md p-1.5 hover:bg-muted lg:hidden" onClick={() => setOpen(true)} aria-label="Open CRM menu">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/crm" className="flex shrink-0 items-center gap-2.5" aria-label="MECE CRM home">
            <Wordmark taglineFrom="never" className="[&_span]:text-[20px] [&_svg]:h-[20px]" />
            <span className="rounded-md border border-navy/20 bg-navy/5 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-navy dark:border-white/20 dark:bg-white/5 dark:text-white">CRM</span>
          </Link>
          <form
            className="relative ml-2 flex-1 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim().length >= 2) router.push(`/crm/search?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search leads, contacts, deals, cases…"
              className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              aria-label="Search the CRM"
            />
          </form>
          <Link href="/crm/notifications" className="relative rounded-md p-1.5 hover:bg-muted" aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}>
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-destructive px-1 text-center text-[10px] font-semibold leading-[18px] text-destructive-foreground">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pr-1">{nav}</div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 overflow-y-auto bg-card p-3 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2"><Wordmark taglineFrom="never" className="[&_span]:text-[18px] [&_svg]:h-[18px]" /><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-navy dark:text-white">CRM</span></span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </div>
  );
}

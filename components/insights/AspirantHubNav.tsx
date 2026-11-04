import Link from 'next/link';
import type { MonthOption } from '@/lib/insights/aspirant-hubs';

export type HubTab = 'gd-topics' | 'wat-topics' | 'pi-questions';

interface Props {
  activeTab: HubTab;
  currentMonth?: string;
  months: MonthOption[];
}

const TABS: { id: HubTab; label: string; href: string }[] = [
  { id: 'gd-topics', label: 'GD Topics', href: '/insights/gd-topics' },
  { id: 'wat-topics', label: 'WAT Topics', href: '/insights/wat-topics' },
  { id: 'pi-questions', label: 'PI Questions', href: '/insights/pi-questions' },
];

export function AspirantHubNav({ activeTab, currentMonth, months }: Props) {
  return (
    <div className="space-y-4">
      {/* Primary Hub Navigation Tabs */}
      <nav aria-label="MBA Interview Preparation Hubs" className="border-b border-border">
        <ul className="flex items-center gap-6 text-small font-medium">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <li key={tab.id}>
                <Link
                  href={tab.href}
                  className={`inline-block pb-3 pt-1 transition-colors ${
                    isActive
                      ? 'border-b-2 border-foreground text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Monthly Roundups Filter Strip */}
      {months.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-micro text-muted-foreground" aria-label="Filter by month">
          <span className="font-medium text-foreground">Archive:</span>
          <Link
            href={`/insights/${activeTab}`}
            className={`rounded-full px-3 py-1 transition-colors ${
              !currentMonth
                ? 'bg-foreground text-background font-medium'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            All Months
          </Link>
          {months.map((m) => {
            const isSelected = currentMonth === m.slug;
            return (
              <Link
                key={m.slug}
                href={`/insights/${activeTab}/${m.slug}`}
                className={`rounded-full px-3 py-1 transition-colors ${
                  isSelected
                    ? 'bg-foreground text-background font-medium'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {m.label} ({m.count})
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

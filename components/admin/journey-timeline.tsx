'use client';

/**
 * JourneyTimeline — interactive vertical timeline showing a user's full journey.
 *
 * Receives a merged, chronologically-sorted list of page views and actions for
 * a single session, and renders them as a step-by-step vertical timeline with
 * duration bars and expandable action details.
 */

import { useState } from 'react';
import {
  Eye, MousePointerClick, Clock, ChevronDown, ChevronRight,
  CreditCard, BookOpen, MessageSquare, Mic, Upload, Send, Award,
  UserPlus, Target, FileText, BarChart3,
} from 'lucide-react';

export interface TimelineEvent {
  id: string | number;
  type: 'view' | 'leave' | 'action';
  path: string;
  occurred_at: string;
  duration_ms?: number | null;
  action?: string | null;
  category?: string | null;
  label?: string | null;
  value?: Record<string, unknown> | null;
}

interface PageGroup {
  path: string;
  entered_at: string;
  duration_ms: number | null;
  actions: TimelineEvent[];
}

const CATEGORY_COLORS: Record<string, string> = {
  case: 'bg-blue-500',
  payment: 'bg-amber-500',
  lifecycle: 'bg-green-500',
  gd: 'bg-purple-500',
  deck: 'bg-indigo-500',
  learn: 'bg-teal-500',
  resume: 'bg-pink-500',
  engagement: 'bg-orange-500',
  navigation: 'bg-gray-400',
};

const ACTION_ICONS: Record<string, React.FC<{ className?: string }>> = {
  start_case: Target,
  send_message: Send,
  open_hint: BookOpen,
  use_voice: Mic,
  upload_image: Upload,
  submit_case: Award,
  view_results: BarChart3,
  view_gd_brief: FileText,
  save_to_cheatsheet: BookOpen,
  preview_deck: Eye,
  purchase_deck: CreditCard,
  view_pricing: CreditCard,
  initiate_checkout: CreditCard,
  complete_payment: CreditCard,
  complete_onboarding: UserPlus,
  complete_signup: UserPlus,
  generate_bullets: FileText,
  read_framework: BookOpen,
  view_leaderboard: BarChart3,
};

function fmtDur(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

/** Group events into page-level steps, collecting actions under each page visit. */
function groupByPage(events: TimelineEvent[]): PageGroup[] {
  const groups: PageGroup[] = [];
  let current: PageGroup | null = null;

  for (const ev of events) {
    if (ev.type === 'view') {
      // Start a new page group
      current = {
        path: ev.path,
        entered_at: ev.occurred_at,
        duration_ms: null,
        actions: [],
      };
      groups.push(current);
    } else if (ev.type === 'leave') {
      // Attach duration to current group
      if (current && current.path === ev.path && ev.duration_ms) {
        current.duration_ms = ev.duration_ms;
      }
    } else if (ev.type === 'action') {
      if (current) {
        current.actions.push(ev);
      } else {
        // Orphaned action (no preceding view) — create a group for it
        current = {
          path: ev.path,
          entered_at: ev.occurred_at,
          duration_ms: null,
          actions: [ev],
        };
        groups.push(current);
      }
    }
  }
  return groups;
}

function PageStep({ group, isLast }: { group: PageGroup; isLast: boolean }) {
  const [expanded, setExpanded] = useState(group.actions.length > 0);
  const hasActions = group.actions.length > 0;

  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
        <button
          onClick={() => hasActions && setExpanded(!expanded)}
          className="flex w-full items-start gap-2 text-left"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{group.path}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {fmtTime(group.entered_at)}
              </span>
              {group.duration_ms != null && (
                <span className="rounded bg-muted px-1.5 py-0.5 tabular-nums">
                  {fmtDur(group.duration_ms)}
                </span>
              )}
              {hasActions && (
                <span className="flex items-center gap-1 text-blue-500">
                  <MousePointerClick className="h-3 w-3" />
                  {group.actions.length} action{group.actions.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          {hasActions && (
            expanded
              ? <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              : <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>

        {/* Expandable actions */}
        {expanded && hasActions && (
          <div className="mt-2 space-y-1.5 rounded-lg border border-border bg-muted/30 p-2">
            {group.actions.map((a, i) => {
              const ActionIcon = ACTION_ICONS[a.action ?? ''] ?? MousePointerClick;
              const catColor = CATEGORY_COLORS[a.category ?? ''] ?? CATEGORY_COLORS.navigation;
              return (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${catColor}`} />
                  <ActionIcon className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">
                      {(a.action ?? '').replace(/_/g, ' ')}
                    </span>
                    {a.label && (
                      <span className="ml-1 text-muted-foreground">— {a.label}</span>
                    )}
                    <span className="ml-2 text-muted-foreground">{fmtTime(a.occurred_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Duration bar */}
        {group.duration_ms != null && group.duration_ms > 0 && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-blue-500/60 transition-all"
              style={{ width: `${Math.min(100, (group.duration_ms / 300_000) * 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function JourneyTimeline({ events }: { events: TimelineEvent[] }) {
  const groups = groupByPage(events);

  if (groups.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No journey data available for this session.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {groups.map((group, i) => (
        <PageStep
          key={`${group.path}-${group.entered_at}-${i}`}
          group={group}
          isLast={i === groups.length - 1}
        />
      ))}
    </div>
  );
}

'use client';

/**
 * JourneyTimeline — interactive vertical timeline showing a user's full journey.
 *
 * Receives a merged, chronologically-sorted list of page views and actions for
 * a single session, and renders them as a step-by-step vertical timeline with
 * duration bars, expandable action details, and inline content viewers for
 * case conversations, GD briefs, and results.
 */

import { useState, useCallback } from 'react';
import {
  Eye, MousePointerClick, Clock, ChevronDown, ChevronRight,
  CreditCard, BookOpen, MessageSquare, Mic, Upload, Send, Award,
  UserPlus, Target, FileText, BarChart3, ExternalLink, Loader2,
  User, Bot,
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
      current = {
        path: ev.path,
        entered_at: ev.occurred_at,
        duration_ms: null,
        actions: [],
      };
      groups.push(current);
    } else if (ev.type === 'leave') {
      if (current && current.path === ev.path && ev.duration_ms) {
        current.duration_ms = ev.duration_ms;
      }
    } else if (ev.type === 'action') {
      if (current) {
        current.actions.push(ev);
      } else {
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

/* ─── Inline Content Viewers ─────────────────────────────────────── */

interface CaseConversation {
  attempt_id: string;
  case_title: string;
  case_type: string | null;
  difficulty: string | null;
  status: string;
  final_recommendation: string | null;
  messages: { role: string; kind: string; content: string | null; is_clarification: boolean; created_at: string }[];
}

interface BriefDetail {
  headline_title: string;
  source_url: string | null;
  summary: string | null;
  data_points: string[];
  gd_talking_points: string[];
}

interface ResultsDetail {
  score: number;
  case_title: string;
  summary: string | null;
  strengths: string[];
  improvements: string[];
  breakdown: Record<string, number>;
}

/** Inline case conversation viewer — shows the full AI chat. */
function CaseConversationViewer({ data }: { data: CaseConversation }) {
  const [showAll, setShowAll] = useState(false);
  const displayMessages = showAll ? data.messages : data.messages.slice(0, 8);
  const hasMore = data.messages.length > 8;

  return (
    <div className="mt-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground">{data.case_title}</p>
          <p className="text-[10px] text-muted-foreground">
            {data.case_type} • {data.difficulty} • {data.status}
            {data.messages.length > 0 && ` • ${data.messages.length} messages`}
          </p>
        </div>
      </div>
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        {displayMessages.map((msg, i) => (
          <div key={i} className={`flex gap-2 text-xs ${msg.role === 'user' ? '' : ''}`}>
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              msg.role === 'user' ? 'bg-blue-500/20' : msg.role === 'assistant' ? 'bg-emerald-500/20' : 'bg-gray-500/20'
            }`}>
              {msg.role === 'user' ? <User className="h-3 w-3 text-blue-600" /> : <Bot className="h-3 w-3 text-emerald-600" />}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-muted-foreground capitalize">{msg.role}</span>
              {msg.kind !== 'text' && (
                <span className="ml-1 rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">{msg.kind}</span>
              )}
              {msg.is_clarification && (
                <span className="ml-1 rounded bg-amber-500/10 px-1 py-0.5 text-[10px] text-amber-600">clarification</span>
              )}
              <p className="mt-0.5 text-foreground/80 whitespace-pre-line break-words leading-relaxed">
                {msg.content || <span className="italic text-muted-foreground">(no text — {msg.kind})</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
      {hasMore && !showAll && (
        <button onClick={() => setShowAll(true)} className="text-[11px] font-medium text-blue-500 hover:underline">
          Show all {data.messages.length} messages…
        </button>
      )}
      {data.final_recommendation && (
        <div className="rounded border border-amber-500/20 bg-amber-500/5 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-1">Final Recommendation</p>
          <p className="text-xs text-foreground/80 whitespace-pre-line">{data.final_recommendation}</p>
        </div>
      )}
    </div>
  );
}

/** Inline GD brief viewer. */
function BriefViewer({ data }: { data: BriefDetail }) {
  return (
    <div className="mt-2 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 space-y-2">
      <p className="text-xs font-semibold text-foreground">{data.headline_title}</p>
      {data.summary && <p className="text-xs text-foreground/80">{data.summary}</p>}
      {data.gd_talking_points.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 mb-1">GD Talking Points</p>
          <ul className="space-y-0.5">
            {data.gd_talking_points.slice(0, 5).map((pt, i) => (
              <li key={i} className="text-xs text-foreground/80 flex gap-1.5">
                <span className="text-purple-500 shrink-0">•</span>{pt}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.source_url && (
        <a href={data.source_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-purple-500 hover:underline">
          <ExternalLink className="h-3 w-3" /> Source article
        </a>
      )}
    </div>
  );
}

/** Inline results viewer. */
function ResultsViewer({ data }: { data: ResultsDetail }) {
  return (
    <div className="mt-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
          <span className="text-lg font-bold text-green-600">{data.score}</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{data.case_title}</p>
          <p className="text-[10px] text-muted-foreground">Score: {data.score}/100</p>
        </div>
      </div>
      {data.summary && <p className="text-xs text-foreground/80">{data.summary}</p>}
      {Object.keys(data.breakdown).length > 0 && (
        <div className="space-y-1">
          {Object.entries(data.breakdown).map(([dim, val]) => (
            <div key={dim} className="flex items-center gap-2 text-[11px]">
              <span className="w-28 truncate text-muted-foreground capitalize">{dim.replace(/_/g, ' ')}</span>
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-green-500/60" style={{ width: `${Math.min(100, val)}%` }} />
              </div>
              <span className="w-6 text-right tabular-nums text-foreground">{val}</span>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {data.strengths.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-0.5">Strengths</p>
            {data.strengths.slice(0, 3).map((s, i) => (
              <p key={i} className="text-[11px] text-foreground/80">• {s}</p>
            ))}
          </div>
        )}
        {data.improvements.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-0.5">Improve</p>
            {data.improvements.slice(0, 3).map((s, i) => (
              <p key={i} className="text-[11px] text-foreground/80">• {s}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Inline Detail Loader ───────────────────────────────────────── */

type DetailData =
  | { type: 'case'; data: CaseConversation }
  | { type: 'brief'; data: BriefDetail }
  | { type: 'results'; data: ResultsDetail };

function InlineDetailViewer({ action, value, userId }: {
  action: string;
  value: Record<string, unknown> | null;
  userId?: string | null;
}) {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (detail) { setOpen(!open); return; }
    setLoading(true);
    setError(null);
    try {
      let url = '/api/admin/journey-detail?';
      if ((action === 'start_case' || action === 'submit_case' || action === 'send_message' || action === 'upload_image') && value?.case_id) {
        url += `type=case&case_id=${value.case_id}${userId ? `&user_id=${userId}` : ''}`;
      } else if (action === 'view_gd_brief' && value?.headline_id) {
        url += `type=brief&headline_id=${value.headline_id}`;
      } else if (action === 'view_results' && value?.submission_id) {
        url += `type=results&submission_id=${value.submission_id}`;
      } else {
        setError('No detail available');
        setLoading(false);
        return;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load');
      const data = await res.json();

      if (action === 'view_gd_brief') setDetail({ type: 'brief', data });
      else if (action === 'view_results') setDetail({ type: 'results', data });
      else setDetail({ type: 'case', data });

      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [action, value, userId, detail, open]);

  // Only show for actions that have viewable content
  const canView = (
    ((action === 'start_case' || action === 'submit_case' || action === 'send_message' || action === 'upload_image') && value?.case_id) ||
    (action === 'view_gd_brief' && value?.headline_id) ||
    (action === 'view_results' && value?.submission_id)
  );

  if (!canView) return null;

  const buttonLabel = action === 'view_gd_brief' ? 'View Brief' :
    action === 'view_results' ? 'View Score' :
    'View Conversation';

  return (
    <div>
      <button
        onClick={fetchDetail}
        disabled={loading}
        className="mt-1 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium bg-foreground/5 text-foreground/70 hover:bg-foreground/10 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : open ? <ChevronDown className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
        {open ? 'Hide' : buttonLabel}
      </button>
      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
      {open && detail?.type === 'case' && <CaseConversationViewer data={detail.data} />}
      {open && detail?.type === 'brief' && <BriefViewer data={detail.data} />}
      {open && detail?.type === 'results' && <ResultsViewer data={detail.data} />}
    </div>
  );
}

/* ─── PageStep Component ─────────────────────────────────────────── */

function PageStep({ group, isLast, userId }: { group: PageGroup; isLast: boolean; userId?: string | null }) {
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
      <div className={`flex-1 pb-6`}>
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
          <div className="mt-2 space-y-2 rounded-lg border border-border bg-muted/30 p-2">
            {group.actions.map((a, i) => {
              const ActionIcon = ACTION_ICONS[a.action ?? ''] ?? MousePointerClick;
              const catColor = CATEGORY_COLORS[a.category ?? ''] ?? CATEGORY_COLORS.navigation;
              return (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-start gap-2 text-xs">
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
                      {/* Show metadata tags */}
                      {a.value && Object.keys(a.value).length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {Object.entries(a.value).map(([k, v]) => (
                            <span key={k} className="rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
                              {k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Inline content viewer */}
                      <InlineDetailViewer action={a.action ?? ''} value={a.value ?? null} userId={userId} />
                    </div>
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

export default function JourneyTimeline({ events, userId }: { events: TimelineEvent[]; userId?: string | null }) {
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
          userId={userId}
        />
      ))}
    </div>
  );
}

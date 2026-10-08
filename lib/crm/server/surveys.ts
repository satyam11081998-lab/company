/**
 * NPS / CSAT / CES surveys.
 *
 *  sendSurvey   → one response row per recipient with an unguessable token,
 *                 then the invite goes to the Outbox (approve before send),
 *                 with one-tap score buttons that open /survey/<token>?s=N.
 *  public page  → shows the question with the tapped score PRE-SELECTED; the
 *                 answer is recorded only when the person presses Submit
 *                 (mail scanners that pre-fetch links can't answer for them).
 *                 One answer per token, and only for invites actually sent.
 *  after answer → score written to the contact (nps_last / csat_last) and
 *                 case (csat_score); a detractor (NPS 0–6, CSAT 1–2) opens a
 *                 follow-up task for the owner — "closing the loop".
 */
import { randomBytes } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/crm/server/svc';
import { canSetup } from '@/lib/crm/permissions';
import { isUuid } from '@/lib/crm/fields';
import { escapeHtml } from '@/lib/crm/templates';
import { cleanSurvey, DEFAULT_SURVEYS, SCALES, sentiment, summarize, validScore, type SurveyConfig, type SurveyKind } from '@/lib/crm/surveys';
import type { Criteria, CrmContext, CrmRecord } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { RECORD_COLS, audit, fetchAll, normalizeRecord } from './db';
import { queueEmails } from './outbox';
import { createRecord, notify, queryAll, SYSTEM_CTX } from './records';
import type { Meta } from './meta';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mece.in').replace(/\/$/, '');
export const surveyUrl = (token: string, score?: number) => `${SITE}/survey/${token}${score === undefined ? '' : `?s=${score}`}`;

export async function ensureDefaultSurveys() {
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id').eq('kind', 'survey').limit(1);
  if (data?.length) return;
  const { error } = await svc.from('crm_config').insert(DEFAULT_SURVEYS.map((s, i) => ({ kind: 'survey', name: s.name, position: (i + 1) * 10, config: s.config })));
  if (error && error.code !== '23505') throw error;
}

export async function saveSurvey(ctx: CrmContext, input: { id?: string | null; name: string; active?: boolean; config: unknown }) {
  if (!canSetup(ctx, 'manage_marketing')) throw new CrmAccessError('You can’t manage surveys.');
  const config = cleanSurvey(input.config);
  const name = String(input.name ?? '').trim().slice(0, 120);
  if (!name) throw new CrmUserError('Give the survey a name.');
  const svc = createServiceClient();
  if (input.id) {
    if (!isUuid(input.id)) throw new CrmAccessError('Survey not found.');
    const { error } = await svc.from('crm_config').update({ name, active: input.active !== false, config, updated_by: ctx.userId, updated_at: new Date().toISOString() }).eq('id', input.id).eq('kind', 'survey');
    if (error) throw error.code === '23505' ? new CrmUserError('A survey with this name exists.') : error;
    await audit(svc, { actor_id: ctx.userId, action: 'survey_save', meta: { name } });
    return input.id;
  }
  const { data, error } = await svc.from('crm_config').insert({ kind: 'survey', name, active: input.active !== false, config, created_by: ctx.userId }).select('id').single();
  if (error) throw error.code === '23505' ? new CrmUserError('A survey with this name exists.') : error;
  await audit(svc, { actor_id: ctx.userId, action: 'survey_create', meta: { name } });
  return (data as { id: string }).id;
}

async function loadSurvey(svc: SupabaseClient, id: string) {
  if (!isUuid(id)) return null;
  const { data } = await svc.from('crm_config').select('id, name, active, config').eq('id', id).eq('kind', 'survey').maybeSingle();
  const s = data as { id: string; name: string; active: boolean; config: unknown } | null;
  return s ? { id: s.id, name: s.name, active: s.active, config: cleanSurvey(s.config) } : null;
}

/** HTML row of one-tap score buttons (tracked like any other link). */
function scaleButtons(kind: SurveyKind, token: string): string {
  const sc = SCALES[kind];
  const cells: string[] = [];
  for (let v = sc.min; v <= sc.max; v++) {
    cells.push(`<td style="padding:2px"><a href="${escapeHtml(surveyUrl(token, v))}" style="display:inline-block;min-width:30px;padding:8px 0;text-align:center;border:1px solid #CBD5E1;border-radius:6px;color:#0B1F3A;text-decoration:none;font-weight:600;font-size:14px">${v}</a></td>`);
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px"><tr>${cells.join('')}</tr></table>`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:#64748B"><tr><td>${escapeHtml(sc.low)}</td><td style="text-align:right">${escapeHtml(sc.high)}</td></tr></table>`;
}

export interface SendSurveyInput {
  surveyId: string;
  module: 'contacts' | 'leads' | 'cases';
  recordIds?: string[];
  criteria?: Criteria | null;
  /** dedupe window: one invite per person per survey per period */
  period?: 'once' | 'month' | 'quarter';
}

function periodKey(p: SendSurveyInput['period'], now = new Date()): string {
  if (p === 'once') return 'once';
  const y = now.getUTCFullYear();
  return p === 'quarter' ? `${y}-Q${Math.floor(now.getUTCMonth() / 3) + 1}` : `${y}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** ctx null = system (CSAT after a resolved case). */
export async function sendSurvey(ctx: CrmContext | null, meta: Meta, input: SendSurveyInput) {
  if (ctx && !canSetup(ctx, 'manage_marketing')) throw new CrmAccessError('You can’t send surveys.');
  if (!['contacts', 'leads', 'cases'].includes(input.module)) throw new CrmUserError('Surveys go to contacts, leads or cases.');
  const svc = createServiceClient();
  const survey = await loadSurvey(svc, input.surveyId);
  if (!survey || !survey.active) throw new CrmUserError('That survey is not active.');
  const cfg = survey.config;

  let recs: CrmRecord[] = [];
  if (input.recordIds?.length) {
    const ids = [...new Set(input.recordIds.filter(isUuid))].slice(0, 5000);
    for (let i = 0; i < ids.length; i += 200) {
      const { data } = await svc.from('crm_records').select(RECORD_COLS).in('id', ids.slice(i, i + 200)).eq('module', input.module).is('deleted_at', null);
      recs.push(...((data ?? []) as Record<string, unknown>[]).map(normalizeRecord));
    }
  } else if (input.criteria !== undefined) {
    recs = (await queryAll(ctx ?? SYSTEM_CTX, meta, input.module, input.criteria ?? null, 5000)).rows;
  }
  if (!recs.length) return { invited: 0, queued: 0, suppressed: 0, noEmail: 0, duplicate: 0 };

  const period = input.module === 'cases' ? 'once' : periodKey(input.period ?? 'quarter');
  const rows = recs.map((r) => {
    const token = randomBytes(18).toString('base64url');
    return { survey_id: survey.id, kind: cfg.kind, record_id: r.id, token, source: 'email', external_key: `survey:${survey.id}:${r.id}:${period}` };
  });
  // external_key is UNIQUE: re-sending in the same period returns the existing invite, not a second one
  const { data: ins, error } = await svc.from('crm_survey_responses').upsert(rows, { onConflict: 'external_key', ignoreDuplicates: true }).select('id, record_id, token');
  if (error) throw error;
  const fresh = (ins ?? []) as Array<{ id: string; record_id: string; token: string }>;
  const byRecord = new Map(fresh.map((x) => [x.record_id, x]));
  if (!fresh.length) return { invited: 0, queued: 0, suppressed: 0, noEmail: 0, duplicate: recs.length };

  const q = await queueEmails(ctx, meta, {
    module: input.module,
    recordIds: fresh.map((x) => x.record_id),
    template: { subject: cfg.inviteSubject, heading: cfg.question, body: cfg.inviteBody, cta: null, category: cfg.category },
    source: 'survey',
    sourceId: survey.id,
    dedupe: (rid) => `survey:${byRecord.get(rid)?.id ?? rid}`,
    extraValues: (rec) => ({ survey_link: surveyUrl(byRecord.get(rec.id)?.token ?? '') }),
    extraHtml: (rec) => scaleButtons(cfg.kind, byRecord.get(rec.id)?.token ?? ''),
  });
  // link each response to its outbox row (answers are accepted only once that row is sent)
  const { data: ob } = await svc.from('crm_outbox').select('id, dedupe_key').in('dedupe_key', fresh.map((x) => `survey:${x.id}`));
  for (const o of (ob ?? []) as Array<{ id: string; dedupe_key: string }>) {
    await svc.from('crm_survey_responses').update({ outbox_id: o.id }).eq('id', o.dedupe_key.slice('survey:'.length));
  }
  await audit(svc, { actor_id: ctx?.userId ?? null, actor_kind: ctx ? 'user' : 'automation', action: 'survey_send', module: input.module, meta: { survey: survey.name, invited: fresh.length, queued: q.queued } });
  return { invited: fresh.length, queued: q.queued, suppressed: q.suppressed, noEmail: q.noEmail, duplicate: recs.length - fresh.length + q.duplicate };
}

// ---------------------------------------------------------------------------
// Public answer flow (no login): every check is server-side
// ---------------------------------------------------------------------------

export interface PublicSurvey {
  status: 'open' | 'answered' | 'invalid';
  kind?: SurveyKind;
  question?: string;
  followUp?: string;
  thankYou?: string;
  min?: number;
  max?: number;
  low?: string;
  high?: string;
}

async function responseByToken(svc: SupabaseClient, token: string) {
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(String(token ?? ''))) return null;
  const { data } = await svc.from('crm_survey_responses').select('id, survey_id, kind, record_id, outbox_id, answered_at, source').eq('token', token).maybeSingle();
  return data as { id: string; survey_id: string | null; kind: SurveyKind; record_id: string | null; outbox_id: string | null; answered_at: string | null; source: string } | null;
}

async function inviteWasSent(svc: SupabaseClient, outboxId: string | null): Promise<boolean> {
  if (!outboxId) return false;
  const { data } = await svc.from('crm_outbox').select('status').eq('id', outboxId).maybeSingle();
  return (data as { status?: string } | null)?.status === 'sent';
}

export async function publicSurvey(token: string): Promise<PublicSurvey> {
  const svc = createServiceClient();
  const r = await responseByToken(svc, token);
  if (!r || !r.survey_id) return { status: 'invalid' };
  const s = await loadSurvey(svc, r.survey_id);
  if (!s) return { status: 'invalid' };
  const sc = SCALES[s.config.kind];
  const base = { kind: s.config.kind, question: s.config.question, followUp: s.config.followUp, thankYou: s.config.thankYou, min: sc.min, max: sc.max, low: sc.low, high: sc.high };
  if (r.answered_at) return { status: 'answered', ...base };
  if (r.source === 'email' && !(await inviteWasSent(svc, r.outbox_id))) return { status: 'invalid' };
  return { status: 'open', ...base };
}

export async function answerSurvey(token: string, rawScore: unknown, rawComment: unknown): Promise<{ ok: boolean; message: string }> {
  const svc = createServiceClient();
  const r = await responseByToken(svc, token);
  if (!r || !r.survey_id) return { ok: false, message: 'This survey link is not valid.' };
  if (r.answered_at) return { ok: false, message: 'You have already answered — thank you!' };
  if (r.source === 'email' && !(await inviteWasSent(svc, r.outbox_id))) return { ok: false, message: 'This survey link is not valid.' };
  const score = validScore(r.kind, rawScore);
  if (score === null) return { ok: false, message: 'Please pick a score.' };
  const comment = typeof rawComment === 'string' ? rawComment.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim().slice(0, 2000) : '';
  const sent = sentiment(comment);
  // one answer per token: the update applies only while answered_at is still null
  const { data: upd, error } = await svc.from('crm_survey_responses')
    .update({ score, comment: comment || null, sentiment: comment ? sent.label : null, answered_at: new Date().toISOString() })
    .eq('id', r.id).is('answered_at', null).select('id');
  if (error) throw error;
  if (!upd?.length) return { ok: false, message: 'You have already answered — thank you!' };

  if (r.record_id) await afterAnswer(svc, r.record_id, r.kind, score, comment);
  await audit(svc, { actor_id: null, actor_kind: 'public', action: 'survey_answer', record_id: r.record_id, meta: { kind: r.kind, score } });
  return { ok: true, message: 'Thanks!' };
}

async function afterAnswer(svc: SupabaseClient, recordId: string, kind: SurveyKind, score: number, comment: string) {
  const { data } = await svc.from('crm_records').select(RECORD_COLS).eq('id', recordId).maybeSingle();
  if (!data) return;
  const rec = normalizeRecord(data as Record<string, unknown>);
  const patch: Array<{ id: string; data: Record<string, unknown> }> = [];
  let contactId: string | null = rec.module === 'contacts' ? rec.id : null;
  if (rec.module === 'cases') {
    if (kind === 'csat') patch.push({ id: rec.id, data: { csat_score: score } });
    contactId = typeof rec.data.contact_id === 'string' ? rec.data.contact_id : null;
  }
  if (contactId) {
    if (kind === 'nps') patch.push({ id: contactId, data: { nps_last: score } });
    if (kind === 'csat') patch.push({ id: contactId, data: { csat_last: score } });
  }
  if (patch.length) await svc.rpc('crm_merge_data', { p_rows: patch });
  await svc.from('crm_records').update({ last_activity_at: new Date().toISOString() }).eq('id', rec.id);

  const detractor = (kind === 'nps' && score <= 6) || (kind === 'csat' && score <= 2) || (kind === 'ces' && score <= 3);
  if (detractor) {
    const meta = await (await import('./meta')).loadMetaWith(svc);
    const label = kind === 'nps' ? `NPS ${score}/10` : kind === 'csat' ? `CSAT ${score}/5` : `CES ${score}/7`;
    try {
      await createRecord(null, meta, 'tasks', {
        subject: `Close the loop: ${rec.name || 'customer'} answered ${label}`.slice(0, 250),
        due_date: new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10),
        priority: 'High',
        related_to: { module: rec.module, id: rec.id },
        description: comment ? `Their comment: “${comment.slice(0, 1500)}”` : 'No comment left.',
      }, { actorKind: 'system', source: 'automation', ownerId: rec.owner_id, skipAutomation: true, allowDuplicate: true });
    } catch (e) {
      console.error('[crm] detractor task not created:', e);
    }
    if (rec.owner_id) await notify(svc, rec.owner_id, 'survey', `Detractor: ${rec.name} answered ${label}`, comment.slice(0, 300) || null, `/crm/m/${rec.module}/${rec.id}`);
  }
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

export async function surveyResults(ctx: CrmContext, surveyId: string) {
  if (!canSetup(ctx, 'manage_marketing') && !canSetup(ctx, 'view_analytics')) throw new CrmAccessError();
  const svc = createServiceClient();
  const s = await loadSurvey(svc, surveyId);
  if (!s) throw new CrmAccessError('Survey not found.');
  const { rows } = await fetchAll<{ score: number | null; comment: string | null; sentiment: string | null; answered_at: string | null; outbox_id: string | null; record_id: string | null; created_at: string }>(
    (o) => svc.from('crm_survey_responses').select('score, comment, sentiment, answered_at, outbox_id, record_id, created_at', o).eq('survey_id', s.id).order('created_at'), 20_000);
  const answered = rows.filter((r) => r.answered_at && r.score !== null);
  const outboxIds = rows.map((r) => r.outbox_id).filter(Boolean) as string[];
  let sent = 0;
  for (let i = 0; i < outboxIds.length; i += 500) {
    const { count } = await svc.from('crm_outbox').select('id', { count: 'exact', head: true }).in('id', outboxIds.slice(i, i + 500)).eq('status', 'sent');
    sent += count ?? 0;
  }
  const byMonth = new Map<string, number[]>();
  for (const r of answered) {
    const m = r.answered_at!.slice(0, 7);
    byMonth.set(m, [...(byMonth.get(m) ?? []), r.score!]);
  }
  const trend = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, scores]) => ({ month, ...summarize(s.config.kind, scores) }));
  const recent = answered.filter((r) => r.comment).slice(-30).reverse().map((r) => ({ score: r.score!, comment: r.comment!, sentiment: r.sentiment, at: r.answered_at!, recordId: r.record_id }));
  return {
    survey: s,
    summary: summarize(s.config.kind, answered.map((r) => r.score!)),
    invited: rows.length,
    sent,
    answered: answered.length,
    responseRate: sent ? Math.round((answered.length / sent) * 1000) / 10 : null,
    trend,
    recent,
  };
}

export type { SurveyConfig };

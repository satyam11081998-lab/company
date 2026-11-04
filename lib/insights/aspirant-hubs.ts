import { getPublishedSeoPages, type SeoPage } from '@/lib/seo-pages';
import { topicOf } from '@/lib/insights/topics';

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

export function toMonthSlug(isoString: string): string {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const month = MONTH_NAMES[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${month}-${year}`;
}

export function formatMonthLabel(slug: string): string {
  const [m, y] = slug.split('-');
  if (!m || !y) return slug;
  return `${m.charAt(0).toUpperCase() + m.slice(1)} ${y}`;
}

export interface MonthOption {
  slug: string;
  label: string;
  count: number;
}

export interface GdTopicCardData {
  id: string;
  slug: string;
  articleTitle: string;
  publishedAt: string;
  monthSlug: string;
  topicLabel: string;
  gdTopic: string;
  forArguments: string[];
  againstArguments: string[];
}

export interface WatTopicCardData {
  id: string;
  slug: string;
  articleTitle: string;
  publishedAt: string;
  monthSlug: string;
  topicLabel: string;
  watPrompt: string;
  caseQuestion?: string;
  summary?: string;
}

export interface PiQuestionCardData {
  id: string;
  slug: string;
  articleTitle: string;
  publishedAt: string;
  monthSlug: string;
  topicLabel: string;
  questions: string[];
  context?: string;
}

export async function getGdTopicsData(monthFilter?: string) {
  const allPages = await getPublishedSeoPages(250);
  const validPages = allPages.filter((p) => Boolean(p.content?.aspirants?.gd_topic));

  const monthCountMap = new Map<string, number>();
  for (const p of validPages) {
    const pub = p.published_at || p.created_at;
    const m = toMonthSlug(pub);
    if (m) {
      monthCountMap.set(m, (monthCountMap.get(m) || 0) + 1);
    }
  }

  const months: MonthOption[] = Array.from(monthCountMap.entries()).map(([slug, count]) => ({
    slug,
    label: formatMonthLabel(slug),
    count,
  }));

  const filteredPages = monthFilter
    ? validPages.filter((p) => toMonthSlug(p.published_at || p.created_at) === monthFilter)
    : validPages;

  const items: GdTopicCardData[] = filteredPages.map((p) => {
    const asp = p.content?.aspirants || {};
    const t = topicOf(p);
    const pub = p.published_at || p.created_at;
    return {
      id: p.id,
      slug: p.slug,
      articleTitle: p.title,
      publishedAt: pub,
      monthSlug: toMonthSlug(pub),
      topicLabel: t.label,
      gdTopic: asp.gd_topic || '',
      forArguments: asp.for || [],
      againstArguments: asp.against || [],
    };
  });

  return { items, months, totalCount: validPages.length };
}

export async function getWatTopicsData(monthFilter?: string) {
  const allPages = await getPublishedSeoPages(250);
  const validPages = allPages.filter((p) => Boolean(p.content?.aspirants?.wat_prompt));

  const monthCountMap = new Map<string, number>();
  for (const p of validPages) {
    const pub = p.published_at || p.created_at;
    const m = toMonthSlug(pub);
    if (m) {
      monthCountMap.set(m, (monthCountMap.get(m) || 0) + 1);
    }
  }

  const months: MonthOption[] = Array.from(monthCountMap.entries()).map(([slug, count]) => ({
    slug,
    label: formatMonthLabel(slug),
    count,
  }));

  const filteredPages = monthFilter
    ? validPages.filter((p) => toMonthSlug(p.published_at || p.created_at) === monthFilter)
    : validPages;

  const items: WatTopicCardData[] = filteredPages.map((p) => {
    const asp = p.content?.aspirants || {};
    const t = topicOf(p);
    const pub = p.published_at || p.created_at;
    return {
      id: p.id,
      slug: p.slug,
      articleTitle: p.title,
      publishedAt: pub,
      monthSlug: toMonthSlug(pub),
      topicLabel: t.label,
      watPrompt: asp.wat_prompt || '',
      caseQuestion: asp.case_question,
      summary: p.content?.summary || p.dek || p.meta_description,
    };
  });

  return { items, months, totalCount: validPages.length };
}

export async function getPiQuestionsData(monthFilter?: string) {
  const allPages = await getPublishedSeoPages(250);
  const validPages = allPages.filter((p) => Boolean(p.content?.aspirants?.pi_questions && p.content.aspirants.pi_questions.length > 0));

  const monthCountMap = new Map<string, number>();
  for (const p of validPages) {
    const pub = p.published_at || p.created_at;
    const m = toMonthSlug(pub);
    if (m) {
      monthCountMap.set(m, (monthCountMap.get(m) || 0) + 1);
    }
  }

  const months: MonthOption[] = Array.from(monthCountMap.entries()).map(([slug, count]) => ({
    slug,
    label: formatMonthLabel(slug),
    count,
  }));

  const filteredPages = monthFilter
    ? validPages.filter((p) => toMonthSlug(p.published_at || p.created_at) === monthFilter)
    : validPages;

  const items: PiQuestionCardData[] = filteredPages.map((p) => {
    const asp = p.content?.aspirants || {};
    const t = topicOf(p);
    const pub = p.published_at || p.created_at;
    return {
      id: p.id,
      slug: p.slug,
      articleTitle: p.title,
      publishedAt: pub,
      monthSlug: toMonthSlug(pub),
      topicLabel: t.label,
      questions: asp.pi_questions || [],
      context: p.content?.summary || p.dek || p.meta_description,
    };
  });

  const totalQuestions = validPages.reduce((acc, p) => acc + (p.content?.aspirants?.pi_questions?.length || 0), 0);

  return { items, months, totalPages: validPages.length, totalQuestions };
}

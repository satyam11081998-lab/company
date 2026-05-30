export type Tier = 'free' | 'lite' | 'pro';
export type Difficulty = 'easy' | 'moderate' | 'challenging';
export type PageKind =
  | 'concept' | 'framework' | 'toolkit' | 'case' | 'guesstimate' | 'primer' | 'landing';

/** Restricted inline markdown only: **bold**, *italic*, `code`, [text](url), and line breaks. No raw HTML. */
export type InlineMd = string;

export type CaseSectionLabel =
  | 'prompt' | 'clarifying' | 'structure' | 'analysis' | 'recommendation' | 'takeaway';

export type Block =
  | { type: 'hook'; md: InlineMd; emphasize?: string }
  | { type: 'prose'; md: InlineMd }
  | { type: 'heading'; level: 2 | 3; text: string; anchor?: string; emphasize?: string }
  | { type: 'callout'; variant: 'tip' | 'insight' | 'warning' | 'pitfall' | 'note'; title?: string; md: InlineMd }
  | { type: 'keyTakeaways'; title?: string; items: InlineMd[] }
  | { type: 'steps'; ordered: boolean; items: { title?: string; md: InlineMd }[] }
  | { type: 'diagram'; ref: string; caption?: string; maxWidth?: number }
  | { type: 'table'; headers: string[]; rows: InlineMd[][]; caption?: string; firstColHeader?: boolean }
  | { type: 'mathBox'; title?: string; md: InlineMd }
  | { type: 'quote'; md: InlineMd; attribution?: string }
  | { type: 'reveal'; summary: string; tier?: Tier; blocks: Block[] }
  | { type: 'columns'; columns: Block[][] }
  | { type: 'caseSection'; label: CaseSectionLabel; title?: string; blocks: Block[] }
  | { type: 'divider' }
  | {
      type: 'dialogue';
      title?: string;
      turns: {
        speaker: 'interviewer' | 'candidate' | 'narrator';
        md: InlineMd;
        note?: InlineMd;
      }[];
    }
  | {
      type: 'drill';
      title: string;
      instructions: InlineMd;
      items: {
        prompt: InlineMd;
        answer: InlineMd;
      }[];
      revealLabel?: string;
    }
  | {
      type: 'comparison';
      title?: string;
      headers: [string, string, string];
      rows: {
        label?: string;
        cells: [InlineMd, InlineMd, InlineMd];
      }[];
    };

export interface PageMeta {
  difficulty?: Difficulty;
  caseType?: string;
  readingTimeMin?: number;
  tags?: string[];
  minTier?: Tier; // page is locked below this tier; omit = free
}

export interface Page {
  slug: string;       // full path under /learn/casebook (no leading slash)
  title: string;
  titleEmphasize?: string;
  subtitle?: string;
  kind: PageKind;
  meta?: PageMeta;
  blocks: Block[];
}

export interface NavNode {
  title: string;
  kind: 'section' | 'group' | 'page';
  slug?: string;          // leaf pages only
  icon?: string;          // lucide icon name; sections only
  meta?: Pick<PageMeta, 'difficulty' | 'minTier'>;
  defaultOpen?: boolean;
  children?: NavNode[];
}

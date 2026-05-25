/**
 * Curriculum Index — central re-export + lookup utilities.
 * Combines all domain data files into one searchable array.
 */
import type { Domain, LearningPath, PlatformStats, QuizType, FlashcardDeck, VisualizationItem, ContentGap } from './types';

// Lazy imports — each file exports its chunk
import { DOMAINS_FOUNDATIONS } from './data-foundations';
import { DOMAINS_ADVANCED } from './data-advanced';
import {
  DOMAINS_SUPPLEMENTARY,
  LEARNING_PATHS as _LEARNING_PATHS,
  PLATFORM_STATS as _PLATFORM_STATS,
  INDUSTRY_SECTORS as _INDUSTRY_SECTORS,
  QUIZ_TYPES as _QUIZ_TYPES,
  FLASHCARD_DECKS as _FLASHCARD_DECKS,
  VISUALIZATION_INVENTORY as _VISUALIZATION_INVENTORY,
  CONTENT_GAPS as _CONTENT_GAPS,
} from './data-supplementary';

/** All 18 domains in order D1→D18 */
export const ALL_DOMAINS: Domain[] = [
  ...DOMAINS_FOUNDATIONS,
  ...DOMAINS_ADVANCED,
  ...DOMAINS_SUPPLEMENTARY,
];

/** Lookup a domain by its URL slug */
export function getDomainBySlug(slug: string): Domain | undefined {
  return ALL_DOMAINS.find(d => d.slug === slug);
}

/** Get all valid slugs (for generateStaticParams) */
export function getAllSlugs(): string[] {
  return ALL_DOMAINS.map(d => d.slug);
}

/** Re-export supplementary data */
export const LEARNING_PATHS: LearningPath[] = _LEARNING_PATHS;
export const PLATFORM_STATS: PlatformStats = _PLATFORM_STATS;
export const INDUSTRY_SECTORS: string[] = _INDUSTRY_SECTORS;
export const QUIZ_TYPES: QuizType[] = _QUIZ_TYPES;
export const FLASHCARD_DECKS: FlashcardDeck[] = _FLASHCARD_DECKS;
export const VISUALIZATION_INVENTORY: VisualizationItem[] = _VISUALIZATION_INVENTORY;
export const CONTENT_GAPS: ContentGap[] = _CONTENT_GAPS;

/** Re-export types */
export type {
  Domain, Module, Lesson, CaseEntry, GuessEntry,
  CompanyProfile, LearningPath, PlatformStats,
  QuizType, FlashcardDeck, VisualizationItem, ContentGap,
} from './types';

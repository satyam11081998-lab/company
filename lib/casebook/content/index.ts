import type { Page, NavNode } from '../types';
import { CASEBOOK_TREE } from '../tree';
import { profitabilityFramework } from './frameworks/profitability';
import { regionalDairyCooperative } from './cases/profitability/regional-dairy-cooperative';
import { evChargingPointsMetro } from './guesstimates/ev-charging-points-metro';
import { newBlocksTest } from './_test/new-blocks-test';
import { repeatableMethod } from './concepts/repeatable-method';
import { whatItTests } from './concepts/what-it-tests';
import { sixCaseTypes } from './concepts/six-case-types';
import { navigatingBlendedCases } from './concepts/navigating-blended-cases';
import { mathUnderPressure } from './concepts/math-under-pressure';
import { communicationUnderPressure } from './concepts/communication-under-pressure';
import { diagnosticAndPlan } from './concepts/diagnostic-and-plan';

const SEED_PAGES: Record<string, Page> = {
  [repeatableMethod.slug]: repeatableMethod,
  [newBlocksTest.slug]: newBlocksTest,
  [profitabilityFramework.slug]: profitabilityFramework,
  [regionalDairyCooperative.slug]: regionalDairyCooperative,
  [evChargingPointsMetro.slug]: evChargingPointsMetro,
  [whatItTests.slug]: whatItTests,
  [sixCaseTypes.slug]: sixCaseTypes,
  [navigatingBlendedCases.slug]: navigatingBlendedCases,
  [mathUnderPressure.slug]: mathUnderPressure,
  [communicationUnderPressure.slug]: communicationUnderPressure,
  [diagnosticAndPlan.slug]: diagnosticAndPlan,
};

// Flatten tree to easily lookup nodes by slug
const flattenTree = (nodes: NavNode[]): NavNode[] => {
  return nodes.reduce((acc: NavNode[], node: NavNode) => {
    if (node.kind === 'page') {
      acc.push(node);
    }
    if (node.children) {
      acc.push(...flattenTree(node.children));
    }
    return acc;
  }, []);
};

const ALL_NODES = flattenTree(CASEBOOK_TREE);

export const ALL_PAGE_SLUGS: string[] = ALL_NODES.map(node => node.slug as string);

function inferKindFromSlug(slug: string): Page['kind'] {
  if (slug.startsWith('core-frameworks')) return 'framework';
  if (slug.startsWith('toolkit')) return 'toolkit';
  if (slug.startsWith('cases')) return 'case';
  if (slug.startsWith('guesstimates')) return 'guesstimate';
  if (slug.startsWith('industry-primers')) return 'primer';
  return 'concept';
}

export function getPage(slug: string): Page | null {
  // 1. Try to find a real authored page
  if (SEED_PAGES[slug]) {
    return SEED_PAGES[slug];
  }

  // 2. See if the slug exists in our tree map
  const treeNode = ALL_NODES.find(n => n.slug === slug);
  
  if (!treeNode) {
    return null; // Invalid slug, not in tree
  }

  // 3. Return a polished placeholder page
  return {
    slug,
    title: treeNode.title,
    subtitle: 'Chapter in progress',
    kind: inferKindFromSlug(slug),
    meta: treeNode.meta,
    blocks: [
      {
        type: 'callout',
        variant: 'note',
        title: 'Chapter in progress',
        md: 'This chapter is being authored and will appear here shortly.'
      }
    ]
  };
}

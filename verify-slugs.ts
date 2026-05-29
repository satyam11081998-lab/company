import { CASEBOOK_TREE } from './lib/casebook/tree';
import { ALL_PAGE_SLUGS } from './lib/casebook/content/index';
import type { NavNode } from './lib/casebook/types';

// Flatten tree to get all slugs
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

const allSlugs = flattenTree(CASEBOOK_TREE).map(n => n.slug);
const uniqueSlugs = new Set(allSlugs);

if (allSlugs.length !== uniqueSlugs.size) {
  console.error('ERROR: Duplicate slugs found in the tree!');
  throw new Error('ERROR: Duplicate slugs found in the tree!');
} else {
  console.log(`Setup clean, types lock in, slug list: ${ALL_PAGE_SLUGS.join(', ')}`);
}

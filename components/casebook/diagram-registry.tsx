import React from 'react';

// Existing
import {
  MECEDiagram,
  ProfitabilityTree,
  IssueTree,
  HypothesisDriven,
  MintoPyramid
} from '../framework-diagrams';

// New Real Diagrams
import { ProfitabilityDriverTree } from './diagrams/profitability-driver-tree';

// Stubs generator
const createStub = (name: string) => (props: any) => (
  <div className="w-full max-w-[650px] mx-auto overflow-hidden rounded-xl border border-dashed border-border/50 bg-muted/10 h-[200px] flex items-center justify-center">
    <span className="text-muted-foreground text-small">Stub: <strong>{name}</strong></span>
  </div>
);

export const DIAGRAMS: Record<string, React.FC<{className?: string}>> = {
  // Map existing
  'mece-diagram': MECEDiagram,
  'profitability-tree': ProfitabilityTree, // old one
  'issue-tree': IssueTree,
  'hypothesis-driven': HypothesisDriven,
  'minto-pyramid': MintoPyramid,

  // New ones
  'profitability-driver-tree': ProfitabilityDriverTree,

  // Stubs
  'market-entry-framework': createStub('MarketEntryFramework'),
  'pricing-ladder': createStub('PricingLadder'),
  'growth-engine': createStub('GrowthEngine'),
  'mna-screen': createStub('MnAScreen'),
  'porters-five-forces': createStub('PorterFiveForces'),
  'value-chain': createStub('ValueChain'),
  'bcg-matrix': createStub('BCGMatrix'),
};

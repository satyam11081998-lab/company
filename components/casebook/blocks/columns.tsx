import React from 'react';
import { BlockRenderer } from '../block-renderer';
import type { Block } from '@/lib/casebook/types';

interface ColumnsProps {
  columns: Block[][];
}

export function ColumnsBlock({ columns }: ColumnsProps) {
  // equal-width columns (rule c)
  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {columns.map((colBlocks, cIdx) => (
        <div key={cIdx} className="space-y-4">
          {colBlocks.map((b, bIdx) => (
            <BlockRenderer key={bIdx} block={b} />
          ))}
        </div>
      ))}
    </div>
  );
}

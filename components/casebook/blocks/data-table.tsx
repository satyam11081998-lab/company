import React from 'react';
import { parseInlineMd } from './prose';

interface DataTableProps {
  headers: string[];
  rows: string[][];
  caption?: string;
  firstColHeader?: boolean;
}

export function DataTableBlock({ headers, rows, caption, firstColHeader }: DataTableProps) {
  return (
    <div className="my-6 w-full overflow-hidden ui-card">
      <div className="overflow-x-auto">
        <table className="data-table w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30">
              {headers.map((header, i) => (
                <th key={i} className="px-4 py-3 text-label text-muted-foreground border-b border-border">
                  {parseInlineMd(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-muted/10 transition-colors">
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-4 py-3 text-body border-b border-border/50 ${
                      firstColHeader && cIdx === 0 ? 'font-semibold text-foreground' : 'text-foreground/80'
                    }`}
                  >
                    {parseInlineMd(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <div className="px-4 py-2 bg-muted/10 border-t border-border text-micro text-muted-foreground">
          {parseInlineMd(caption)}
        </div>
      )}
    </div>
  );
}

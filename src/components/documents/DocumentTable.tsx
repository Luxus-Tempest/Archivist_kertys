import type { ReactNode } from 'react';

interface DocumentTableProps {
  children: ReactNode;
}

export function DocumentTable({ children }: DocumentTableProps) {
  return (
    <div className="bg-surface-container-low/50 rounded-[2rem] border border-outline-variant/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-high/30 border-b border-outline-variant/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Document</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

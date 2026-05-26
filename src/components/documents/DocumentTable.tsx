import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next'

interface DocumentTableProps {
  children: ReactNode;
}

export function DocumentTable({ children }: DocumentTableProps) {
  const { t } = useTranslation()
  return (
    // <div className="bg-white rounded-md border border-outline-variant/40 overflow-hidden shadow-card">
    <div className="bg-white overflow-hidden ">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-outline-variant/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          {/* <thead className="bg-surface-container-high/30 border-b border-outline-variant/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"> */}
            <tr className=''>
            {/* <tr className='border-b border-t border-outline-variant/70'> */}
              <th className="px-6 py-3 text-on-surface-variant font-extrabold text-xs capitalize">{t('document', 'Document')}</th>
              <th className="px-6 py-3 text-on-surface-variant font-extrabold text-xs capitalize">{t('status', 'Status')}</th>
              <th className="px-6 py-3 text-right text-on-surface-variant font-extrabold text-xs capitalize">{t('action', 'Action')}</th>
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

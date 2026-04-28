import { StatusBadge } from './StatusBadge';
import { ProcessingStatus } from '../../types/documents';
import { useTranslation } from 'react-i18next'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

interface DocumentRowProps {
  name: string;
  id?: string;
  size?: number;
  status: ProcessingStatus | string;
  category?: string;
  action?: React.ReactNode;
}

export function DocumentRow({ name, size, status, category, action }: DocumentRowProps) {
  const { t } = useTranslation()
  const fileExtension = name.split('.').pop();
  
  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return null;
    if (bytes < 1024) return t('bytesB', '{{bytes}} B', { bytes });
    if (bytes < 1024 * 1024) return t('valKb', '{{val}} KB', { val: (bytes / 1024).toFixed(2) });
    return t('valMb', '{{val}} MB', { val: (bytes / (1024 * 1024)).toFixed(2) });
  };

  return (
    <tr className="group hover:bg-surface-container-low/50  border-outline-variant/20 transition-colors">
      <td className="px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 bg-white rounded-lg border border-outline-variant/30 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
            <DescriptionRoundedIcon className="text-outline/30" sx={{ fontSize: 24 }} />
            <div className="absolute inset-x-2 top-2 h-0.5 bg-slate-100 rounded"></div>
            <div className="absolute inset-x-2 top-4 h-0.5 bg-slate-100 rounded w-4/5"></div>
            <div className="absolute inset-x-2 top-6 h-0.5 bg-slate-100 rounded w-2/3"></div>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-primary/5 flex items-center justify-center">
              <span className="text-[6px] font-bold text-outline-variant uppercase">
                {fileExtension}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-on-surface truncate">{name}</p>
            {size !== undefined && (
              <p className="text-primary text-[10px] font-extrabold uppercase tracking-widest mt-0.5">
                {formatSize(size)}
              </p>
            )}
            {status === ProcessingStatus.PROCESSING && (
              <div className="mt-2">
                <div className="w-full max-w-[120px] bg-primary-container/20 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            )}
            {category && (
              <div className="flex items-center gap-2 mt-1">
                <span className="px-1.5 py-0.5 bg-surface-container-highest rounded text-[9px] font-bold text-outline uppercase tracking-wider">
                  {category}
                </span>
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <StatusBadge status={status} />
      </td>
      <td className="px-6 py-5 text-right">
        {action}
      </td>
    </tr>
  );
}

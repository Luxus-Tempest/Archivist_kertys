import { DocumentTable } from './DocumentTable';
import { DocumentRow } from './DocumentRow';
import { useTranslation } from 'react-i18next'
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

interface StagedListProps {
  files: File[];
  onRemove: (index: number) => void;
  onClear: () => void;
  isUploading: boolean;
}

export function StagedList({ files, onRemove, onClear, isUploading }: StagedListProps) {
  const { t } = useTranslation()
  if (files.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold font-headline text-on-surface">{t('stagedFiles', 'Staged Files')}</h3>
          <p className="text-sm text-on-surface-variant">{t('reviewDocumentsBeforeSendingToVault', 'Review documents before sending to vault')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="p-2 cursor-pointer text-error hover:bg-error-container/10 rounded-full transition-colors" 
            onClick={onClear}
            disabled={isUploading}
            title={t('clearAll', 'Clear All')}
          >
             <DeleteSweepRoundedIcon sx={{ fontSize: 24 }} />
          </button>
        </div>
      </div>

      <DocumentTable>
        {files.map((file, index) => (
          <DocumentRow
            key={`${file.name}-${index}`}
            name={file.name}
            size={file.size}
            status={t('readyForProcessing', 'Ready for processing')}
            action={
              <button 
                className="p-2 cursor-pointer text-outline hover:text-error transition-colors rounded-full hover:bg-surface-container-highest"
                onClick={() => onRemove(index)}
                disabled={isUploading}
              >
                 <DeleteRoundedIcon sx={{ fontSize: 20 }} />
              </button>
            }
          />
        ))}
      </DocumentTable>
    </section>
  );
}

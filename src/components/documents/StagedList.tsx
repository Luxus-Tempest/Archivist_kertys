import { DocumentTable } from './DocumentTable';
import { DocumentRow } from './DocumentRow';

interface StagedListProps {
  files: File[];
  onRemove: (index: number) => void;
  onClear: () => void;
  isUploading: boolean;
}

export function StagedList({ files, onRemove, onClear, isUploading }: StagedListProps) {
  if (files.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold font-headline text-on-surface">Staged Files</h3>
          <p className="text-sm text-on-surface-variant">Review documents before sending to vault</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="p-2 cursor-pointer text-error hover:bg-error-container/10 rounded-full transition-colors" 
            onClick={onClear}
            disabled={isUploading}
            title="Clear All"
          >
            <span className="material-symbols-outlined">delete_sweep</span>
          </button>
        </div>
      </div>

      <DocumentTable>
        {files.map((file, index) => (
          <DocumentRow
            key={`${file.name}-${index}`}
            name={file.name}
            size={file.size}
            status="Ready for processing"
            action={
              <button 
                className="p-2 cursor-pointer text-outline hover:text-error transition-colors rounded-full hover:bg-surface-container-highest"
                onClick={() => onRemove(index)}
                disabled={isUploading}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            }
          />
        ))}
      </DocumentTable>
    </section>
  );
}

import { ProcessingStatus } from '../../types/documents';

interface StatusBadgeProps {
  status: ProcessingStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case ProcessingStatus.PROCESSING:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container/30 border border-primary/20 text-primary text-[10px] font-extrabold uppercase tracking-widest">
          Processing
        </span>
      );
    case ProcessingStatus.CLASSIFIED:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-container/30 border border-tertiary/20 text-tertiary text-[10px] font-extrabold uppercase tracking-widest">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>sell</span>
          Classify
        </span>
      );
    case ProcessingStatus.UPLOADED:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container/30 border border-secondary/20 text-secondary text-[10px] font-extrabold uppercase tracking-widest">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_done</span>
          Uploaded
        </span>
      );
    case ProcessingStatus.COMPLETED:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-container/30 border border-success/20 text-success text-[10px] font-extrabold uppercase tracking-widest">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Completed
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/20 text-on-surface-variant text-[10px] font-extrabold uppercase tracking-widest">
          {status}
        </span>
      );
  }
}

import { useTranslation } from 'react-i18next'
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { ProcessingStatus } from '../../types/documents';

interface StatusBadgeProps {
  status: ProcessingStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation()
  const GLOBAL_STYLE = "flex w-max! items-center gap-1.5 px-3 py-1.5 rounded-full border  text-[10px] font-extrabold uppercase";
  switch (status) {
    case ProcessingStatus.PROCESSING:
      return (
        <span className={`${GLOBAL_STYLE} bg-primary-container/30 border border-primary/20 text-primary`}>
          {t('processing', 'Processing')}
        </span>
      );
    case ProcessingStatus.CLASSIFIED:
      return (
        <span className={`${GLOBAL_STYLE} bg-tertiary-container/30 border border-tertiary/20 text-tertiary`}>
          <SellRoundedIcon sx={{ fontSize: 14 }} />
          {t('classify', 'Classify')}
        </span>
      );
    case ProcessingStatus.UPLOADED:
      return (
        <span className={`${GLOBAL_STYLE} bg-secondary-container/30 border border-secondary/20 text-secondary`}>
          <CloudDoneRoundedIcon sx={{ fontSize: 14 }} />
          {t('uploaded', 'Uploaded')}
        </span>
      );
    case ProcessingStatus.COMPLETED:
      return (
        <span className={`${GLOBAL_STYLE} bg-success-container/30 border border-success/20 text-success`}>
          <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
          {t('completed', 'Completed')}
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-blue-thin border border-outline-variant/20 text-on-surface-variant text-[10px] font-extrabold capital w-max  ">
          {status}
        </span>
      );
  }
}

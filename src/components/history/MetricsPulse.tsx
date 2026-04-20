import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next'

export function MetricsPulse() {
  const { t } = useTranslation()
  const { user, isLoading } = useAuth();

  const formatSize = (bytes: number) => {
    if (bytes === 0) return t('bytesB', '0 B', { bytes: 0 });
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    
    if (i === 0) return t('bytesB', '{{bytes}} B', { bytes: val });
    if (i === 1) return t('valKb', '{{val}} KB', { val });
    if (i === 2) return t('valMb', '{{val}} MB', { val });
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    return val + ' ' + sizes[i];
  };

  const SkeletonValue = () => <div className="h-9 w-24 bg-surface-container animate-pulse rounded-lg"></div>;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline font-bold text-lg tracking-tight flex items-center gap-2">
          {t('systemPulse', 'System Pulse')}</h2>
        {/* <span className="text-xs font-medium text-outline uppercase tracking-widest">Real-time Telemetry</span> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Metric Card 1 */}
        <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-card">
          <p className="text-outline text-xs font-semibold uppercase tracking-wider mb-2">{t('totalFilesProcessed', 'Total files processed')}</p>
          <div className="flex items-baseline gap-2">
            {isLoading || !user ? (
              <SkeletonValue />
            ) : (
              <span className="text-3xl font-headline font-extrabold text-on-surface">
                {user?.fileCount?.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-card">
          <p className="text-outline text-xs font-semibold uppercase tracking-wider mb-2">{t('storage', 'Storage')}</p>
          <div className="flex items-baseline gap-2">
            {isLoading || !user ? (
              <SkeletonValue />
            ) : (
              <span className="text-3xl font-headline font-extrabold text-on-surface">
                {formatSize(user.totalSize)}
              </span>
            )}
          </div>
        </div>

        {/* Metric Card 3 */}
        {/* <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-card">
          <p className="text-outline text-xs font-semibold uppercase tracking-wider mb-2">Active Sessions</p>
          <div className="flex items-baseline gap-2">
            {isLoading || !user ? (
              <SkeletonValue />
            ) : (
              <>
                <span className="text-3xl font-headline font-extrabold text-on-surface">
                  {user.pendingSessions.toString().padStart(2, '0')}
                </span>
                <span className="flex h-2 w-2 rounded-full bg-tertiary animate-pulse ml-2"></span>
              </>
            )}
          </div>
        </div> */}
      </div>
    </section>
  );
}

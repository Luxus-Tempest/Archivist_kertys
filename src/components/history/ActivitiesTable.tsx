import { useTranslation } from 'react-i18next'
import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocument } from '../../hooks/useDocument';
import ViewAgendaRoundedIcon from '@mui/icons-material/ViewAgendaRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Button } from '../Button';
import { formatDateWithTime } from '../../utils/LocalTime.heler';

const formatDate = (dateString: string, lng: string) => {
  const d = new Date(dateString.replace(' ', 'T'));
  
  const time = new Intl.DateTimeFormat(lng, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);

  const date = new Intl.DateTimeFormat(lng, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);

  return `${date} • ${time}`;
};

export function ActivitiesTable() {
  const { t, i18n } = useTranslation()

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'session' | 'files'>('session');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const navigate = useNavigate();
  const { getHistory, history } = useDocument();

  useEffect(() => {
    const offset = (currentPage - 1) * pageSize;
    getHistory({ offset, limit: pageSize });
  }, [getHistory, currentPage, pageSize]);

  const totalCount = history?.totalCount || 0;
  const startRange = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalCount);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage * pageSize < totalCount) setCurrentPage(prev => prev + 1);
  };
  
  const allFiles = history?.sessions?.flatMap(session => 
    session.files.map(file => ({
      ...file,
      sessionDate: session.date,
      sessionId: session.sessionId
    }))
  ) || [];

  if (history?.isLoading && history?.sessions?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-medium">{t('loadingYourActivities', 'Loading your activities...')}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-headline font-bold text-2xl tracking-tight text-on-surface mb-1">{t('recentActivities', 'Recent Activities')}</h2>
          <p className="text-sm text-on-surface-variant tracking-tight">{t('reviewAndManageYourProcessedDocuments', 'Review and manage your processed documents')}</p>
        </div>
        <div className="flex gap-4 items-center">
          {/* Segmented Control / Toggle */}
          <div className="flex items-center justify-center bg-on-bg-gray-200 p-1 rounded-[3px] border border-outline-variant/10 shadow-card h-8">
            <button 
              onClick={() => setGroupBy('session')}
              className={`px-2 cursor-pointer py-1 text-xs font-bold rounded-md transition-all duration-300 flex items-center gap-2 ${
                groupBy === 'session' ? 'bg-white/88  text-on-surface-variant' : 'text-outline hover:text-on-surface'
              }`}
            >
              <ViewAgendaRoundedIcon sx={{ fontSize: 18 }} />
              {t('sessions', 'Sessions')}</button>
            <button 
              onClick={() => setGroupBy('files')}
              className={`px-2 cursor-pointer py-1 text-xs font-bold rounded-md transition-all duration-300 flex items-center gap-2 ${
                groupBy === 'files' ? 'bg-white/88  text-on-surface-variant' : 'text-outline hover:text-on-surface'
              }`}
            >
              <DescriptionRoundedIcon sx={{ fontSize: 18 }} />
              {t('files', 'Files')}</button>
          </div>

          <div className="h-4 w-px bg-outline-variant/20 mx-2"></div>

          <div className="flex gap-2">
            <Button 
              variant='solid'
              iconPosition='left'
              icon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate('/process')}
              // className="px-4 py-2 text-sm font-semibold bg-primary text-on-primary rounded-lg shadow-sm flex items-center gap-2 hover:bg-primary-dim transition-colors cursor-pointer"
            >
              {t('uploadNewFiles')}
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-surface-container-lowest rounded-md border border-outline-variant/40 shadow-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {groupBy === 'session' ? (
                <>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">{t('sessionId', 'Session ID')}</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">{t('files', 'Files')}</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">{t('status', 'Status')}</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">{t('date', 'Date')}</th>
                  <th className="px-6 py-2 w-10 border-none"></th>
                </>
              ) : (
                <>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">{t('fileName', 'File Name')}</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">{t('category', 'Category')}</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">{t('size', 'Size')}</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">{t('date', 'Date')}</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">{t('action', 'Action')}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {groupBy === 'session' ? (
              history?.sessions?.map((session) => (
                <Fragment key={session.sessionId}>
                  <tr 
                    className={`transition-colors cursor-pointer group ${expandedId === session.sessionId ? 'bg-surface-container-low/30' : 'hover:bg-on-bg-gray-100'}`}
                    onClick={() => setExpandedId(expandedId === session.sessionId ? null : session.sessionId)}
                  >
                    <td className="px-6 py-2 border-none">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${expandedId === session.sessionId ? 'bg-primary-container text-primary' : 'bg-surface-container-highest text-secondary'}`}>
                          <AnalyticsRoundedIcon sx={{ fontSize: 20 }} />
                        </div>
                        <span className="font-semibold text-on-surface text-xs leading-none">
                          {session.sessionId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant text-xs font-bold border-none">{t('lengthDocuments', '{{length}} Documents', { length: session.files.length })}</td>
                    <td className="px-6 py-5 border-none">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full border border-outline-variant/20 uppercase tracking-tight ${
                        session.sessionStatus === 'Completed' || session.sessionStatus === 'Pending'
                          ? 'bg-tertiary-container/30 text-on-tertiary-container' 
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {session.sessionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant text-sm font-medium border-none">{formatDateWithTime(session.date, i18n.language)}</td>
                    <td className="px-6 py-5 border-none">
                      <ExpandMoreRoundedIcon className={`transition-transform duration-300 ${expandedId === session.sessionId ? 'text-primary rotate-180' : 'text-outline-variant group-hover:text-primary'}`} sx={{ fontSize: 20 }} />
                    </td>
                  </tr>

                  <tr className="bg-surface-container-lowest">
                    <td className="px-6 py-0 border-none" colSpan={5}>
                      <div 
                        className={`grid transition-all duration-300 ease-in-out ${
                          expandedId === session.sessionId 
                            ? 'grid-rows-[1fr] opacity-100 mb-4 mt-1' 
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="pl-12 pr-6 py-1 space-y-4 border-l-2 border-primary/20 ml-8 mb-4">
                            {session?.files?.length > 0 ? session?.files?.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white border border-outline-variant/15 hover:border-primary/30 transition-all group/file shadow-sm cursor-default hover:translate-x-1 duration-200">
                                <div className="flex items-center gap-4">
                                  {file.fileName.endsWith('.pdf') ? (
                                    <PictureAsPdfRoundedIcon className="text-error" sx={{ fontSize: 20 }} />
                                  ) : (
                                    <TableChartRoundedIcon className="text-tertiary" sx={{ fontSize: 20 }} />
                                  )}
                                  <div>
                                    <p className="text-sm font-bold text-on-surface tracking-tight">{file.fileName}</p>
                                    <p className="text-[10px] text-outline uppercase tracking-widest font-bold">
                                      {formatSize(file.size)}{t('status2', '• {{status}}', { status: file.status })}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  {file.category && (
                                    <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-black rounded uppercase tracking-widest border border-outline-variant/20">
                                      {file.category}
                                    </span>
                                  )}
                                  <button className="p-2 hover:bg-surface-container rounded-lg transition-colors opacity-0 group-hover/file:opacity-100 cursor-pointer">
                                    <DownloadRoundedIcon className="text-outline" sx={{ fontSize: 20 }} />
                                  </button>
                                </div>
                              </div>
                            )) : (
                              <p className="text-sm text-outline-variant py-4">{t('noFilesFoundForThisSession', 'No files found for this session.')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))
            ) : (
              allFiles.map((file, idx) => (
                <tr key={`${file.fileId}-${idx}`} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4 border-none">
                    <div className="flex items-center gap-3">
                      {file.fileName.endsWith('.pdf') ? (
                        <PictureAsPdfRoundedIcon className="text-error" sx={{ fontSize: 20 }} />
                      ) : (
                        <TableChartRoundedIcon className="text-tertiary" sx={{ fontSize: 20 }} />
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface text-sm tracking-tight">{file.fileName}</span>
                        <span className="text-[10px] text-outline font-medium tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                        {file.sessionId}
                      </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-none">
                    {file.category ? (
                      <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-black rounded uppercase tracking-widest border border-outline-variant/20">
                        {file.category}
                      </span>
                    ) : (
                      <span className="text-outline-variant text-[10px] uppercase font-bold">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 border-none text-on-surface-variant text-sm font-medium tracking-tight">
                    {formatSize(file.size)}
                  </td>
                  <td className="px-6 py-4 border-none">
                    <div className="flex flex-col">
                      <span className="text-on-surface-variant text-sm font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                        {formatDate(file.sessionDate, i18n.language)}
                      </span>
                      <span className="text-[10px] text-outline uppercase font-bold tracking-widest">{file.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-none">
                    <button className="p-2 hover:bg-surface-container-high rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer">
                      <DownloadRoundedIcon className="text-outline" sx={{ fontSize: 20 }} />
                    </button>
                  </td>
                </tr>
              ))
            )}
            {!history?.isLoading && history?.sessions?.length === 0 && (
              <tr>
                <td colSpan={groupBy === 'session' ? 5 : 5} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center opacity-40">
                    <FolderOffRoundedIcon className="mb-4" sx={{ fontSize: 60 }} />
                    <p className="text-on-surface-variant font-bold text-lg tracking-tight">{t('noActivityHistoryFound', 'No activity history found')}</p>
                    <p className="text-sm text-outline max-w-[280px]">{t('yourProcessedFilesAndSessionsWillAppearHereAfterIngestion', 'Your processed files and sessions will appear here after ingestion.')}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center bg-surface-container-high/50 backdrop-blur-sm rounded-full border border-outline-variant/10 p-1.5 shadow-sm transition-all hover:shadow-md">
          <button 
            onClick={handlePrevPage}
            disabled={currentPage === 1 || history?.isLoading}
            className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-primary hover:bg-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
          >
            <ChevronLeftRoundedIcon sx={{ fontSize: 24 }} />
          </button>
          
          <div className="flex items-center px-4 gap-4">
            <div className="h-4 w-px bg-outline-variant/20"></div>
            <div className="flex items-center gap-2 text-[13px] font-bold tracking-tight">
              <span className="text-primary">{t('startrangeEndrange', '{{startRange}} - {{endRange}}', { startRange, endRange })}</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant opacity-60">{totalCount}</span>
            </div>
            <div className="h-4 w-px bg-outline-variant/20"></div>
          </div>

          <button 
            onClick={handleNextPage}
            disabled={endRange >= totalCount || history?.isLoading}
            className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-primary hover:bg-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
          >
            <ChevronRightRoundedIcon sx={{ fontSize: 24 }} />
          </button>
        </div>
      </div>
    </section>

  );
}

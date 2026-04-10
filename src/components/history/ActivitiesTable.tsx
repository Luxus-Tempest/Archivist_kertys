import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocument } from '../../hooks/useDocument';

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  // Replace space with T for better cross-browser compatibility if needed
  const d = new Date(dateString.replace(' ', 'T'));
  
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);

  const date = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);

  return `${date} • ${time}`;
};

export function ActivitiesTable() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { getHistory, history } = useDocument();

  useEffect(() => {
    getHistory();
  }, [getHistory]);

  if (history?.isLoading && history?.sessions?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-medium">Loading your activities...</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-headline font-bold text-2xl tracking-tight text-on-surface">Recent Sessions</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-semibold bg-surface-container-high text-on-surface-variant rounded-lg hover:bg-surface-variant transition-colors cursor-pointer">Export Logs</button>
          <button 
            onClick={() => navigate('/process-new')}
            className="px-4 py-2 text-sm font-semibold bg-primary text-on-primary rounded-lg shadow-sm flex items-center gap-2 hover:bg-primary-dim transition-colors cursor-pointer"
          >
            Upload new files
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Session</th>
              <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Files</th>
              <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Status</th>
              <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Date</th>
              <th className="px-6 py-2 w-10 border-none"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {history?.sessions?.map((session) => (
              <div key={session.sessionId} className="contents">
                <tr 
                  className={`transition-colors cursor-pointer group ${expandedId === session.sessionId ? 'bg-surface-container-low/30' : 'hover:bg-surface-container-low'}`}
                  onClick={() => setExpandedId(expandedId === session.sessionId ? null : session.sessionId)}
                >
                  <td className="px-6 py-2 border-none">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${expandedId === session.sessionId ? 'bg-primary-container text-primary' : 'bg-surface-container-highest text-secondary'}`}>
                        <span className="material-symbols-outlined">
                          analytics
                        </span>
                      </div>
                      <span className="font-semibold text-on-surface text-xs">
                         {session.sessionId}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant text-xs font-medium border-none">{session.files.length} Documents</td>
                  <td className="px-6 py-5 border-none">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      session.sessionStatus === 'Completed' || session.sessionStatus === 'Pending'
                        ? 'bg-tertiary-container/40 text-on-tertiary-container border-tertiary/10' 
                        : 'bg-surface-container-highest text-on-surface-variant border-transparent'
                    }`}>
                      {session.sessionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant text-sm border-none">{formatDate(session.date)}</td>
                  <td className="px-6 py-5 border-none">
                    <span className={`material-symbols-outlined transition-transform duration-300 ${expandedId === session.sessionId ? 'text-primary rotate-180' : 'text-outline-variant group-hover:text-primary'}`}>
                      expand_more
                    </span>
                  </td>
                </tr>

                <tr className="bg-surface-container-lowest">
                  <td className="px-6 py-0 border-none" colSpan={5}>
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${
                        expandedId === session.sessionId 
                          ? 'grid-rows-[1fr] opacity-100 mb-4 mt-2' 
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pl-12 pr-6 py-1 space-y-4 border-l-2 border-primary/20 ml-8">
                          {session?.files?.length > 0 ? session?.files?.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between px-2 py-1 rounded-xl bg-white border border-outline-variant/15 hover:border-primary/30 transition-all group/file shadow-sm cursor-default">
                              <div className="flex items-center gap-4">
                                <span className={`material-symbols-outlined ${file.fileName.endsWith('.pdf') ? 'text-error' : 'text-tertiary'}`}>
                                  {file.fileName.endsWith('.pdf') ? 'picture_as_pdf' : 'table_chart'}
                                </span>
                                <div>
                                  <p className="text-sm font-bold text-on-surface">{file.fileName}</p>
                                  <p className="text-[11px] text-outline uppercase tracking-tighter">
                                    {formatSize(file.size)} • {file.status}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                {file.category && (
                                  <span className="px-2 py-0.5 bg-on-surface text-surface text-[10px] font-bold rounded uppercase tracking-widest">
                                    {file.category}
                                  </span>
                                )}
                                <button className="p-2 hover:bg-surface-container rounded-lg transition-colors opacity-0 group-hover/file:opacity-100 cursor-pointer">
                                  <span className="material-symbols-outlined text-outline text-lg">
                                    download
                                  </span>
                                </button>
                              </div>
                            </div>
                          )) : (
                            <p className="text-sm text-outline-variant">No files found for this session.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </div>
            ))}
            {!history?.isLoading && history?.sessions?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <p className="text-on-surface-variant font-medium">No activity history found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {history?.sessions?.length > 0 && history?.sessions?.length < history?.totalCount && (
        <div className="mt-8 flex justify-center">
          <button 
            className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
            onClick={() => getHistory({ offset: history?.sessions?.length, limit: 5 })}
            disabled={history?.isLoading}
          >
            {history?.isLoading ? 'Loading...' : 'Load more activities'}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      )}
    </section>
  );
}

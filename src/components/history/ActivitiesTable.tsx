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
  const [groupBy, setGroupBy] = useState<'session' | 'files'>('session');
  const navigate = useNavigate();
  const { getHistory, history } = useDocument();

  useEffect(() => {
    getHistory();
  }, [getHistory]);

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
        <p className="text-on-surface-variant font-medium">Loading your activities...</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-headline font-bold text-2xl tracking-tight text-on-surface mb-1">Recent Activities</h2>
          <p className="text-sm text-outline tracking-tight">Review and manage your processed documents</p>
        </div>
        <div className="flex gap-4 items-center">
          {/* Segmented Control / Toggle */}
          <div className="flex bg-surface-container-high p-1 rounded-full border border-outline-variant/10 shadow-sm">
            <button 
              onClick={() => setGroupBy('session')}
              className={`px-6 cursor-pointer py-1.5 text-xs font-bold rounded-full transition-all duration-300 flex items-center gap-2 ${
                groupBy === 'session' ? 'bg-white shadow-sm text-primary' : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">view_agenda</span>
              Sessions
            </button>
            <button 
              onClick={() => setGroupBy('files')}
              className={`px-6 cursor-pointer py-1.5 text-xs font-bold rounded-full transition-all duration-300 flex items-center gap-2 ${
                groupBy === 'files' ? 'bg-white shadow-sm text-primary' : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              Files
            </button>
          </div>

          <div className="h-4 w-[1px] bg-outline-variant/20 mx-2"></div>

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
      </div>

      <div className="overflow-hidden bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {groupBy === 'session' ? (
                <>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Session ID</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Files</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Status</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Date</th>
                  <th className="px-6 py-2 w-10 border-none"></th>
                </>
              ) : (
                <>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">File Name</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Category</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Size</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Date</th>
                  <th className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-outline border-none">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {groupBy === 'session' ? (
              history?.sessions?.map((session) => (
                <div key={session.sessionId} className="contents">
                  <tr 
                    className={`transition-colors cursor-pointer group ${expandedId === session.sessionId ? 'bg-surface-container-low/30' : 'hover:bg-surface-container-low'}`}
                    onClick={() => setExpandedId(expandedId === session.sessionId ? null : session.sessionId)}
                  >
                    <td className="px-6 py-2 border-none">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${expandedId === session.sessionId ? 'bg-primary-container text-primary' : 'bg-surface-container-highest text-secondary'}`}>
                          <span className="material-symbols-outlined">analytics</span>
                        </div>
                        <span className="font-semibold text-on-surface text-xs leading-none">
                          {session.sessionId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant text-xs font-bold border-none">{session.files.length} Documents</td>
                    <td className="px-6 py-5 border-none">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full border border-outline-variant/20 uppercase tracking-tight ${
                        session.sessionStatus === 'Completed' || session.sessionStatus === 'Pending'
                          ? 'bg-tertiary-container/30 text-on-tertiary-container' 
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {session.sessionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant text-sm font-medium border-none">{formatDate(session.date)}</td>
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
                            ? 'grid-rows-[1fr] opacity-100 mb-4 mt-1' 
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="pl-12 pr-6 py-1 space-y-4 border-l-2 border-primary/20 ml-8 mb-4">
                            {session?.files?.length > 0 ? session?.files?.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white border border-outline-variant/15 hover:border-primary/30 transition-all group/file shadow-sm cursor-default hover:translate-x-1 duration-200">
                                <div className="flex items-center gap-4">
                                  <span className={`material-symbols-outlined ${file.fileName.endsWith('.pdf') ? 'text-error' : 'text-tertiary'}`}>
                                    {file.fileName.endsWith('.pdf') ? 'picture_as_pdf' : 'table_chart'}
                                  </span>
                                  <div>
                                    <p className="text-sm font-bold text-on-surface tracking-tight">{file.fileName}</p>
                                    <p className="text-[10px] text-outline uppercase tracking-widest font-bold">
                                      {formatSize(file.size)} • {file.status}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  {file.category && (
                                    <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-black rounded uppercase tracking-widest border border-outline-variant/20">
                                      {file.category}
                                    </span>
                                  )}
                                  <button className="p-2 hover:bg-surface-container rounded-lg transition-colors opacity-0 group-hover/file:opacity-100 cursor-pointer">
                                    <span className="material-symbols-outlined text-outline text-lg">download</span>
                                  </button>
                                </div>
                              </div>
                            )) : (
                              <p className="text-sm text-outline-variant py-4">No files found for this session.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </div>
              ))
            ) : (
              allFiles.map((file, idx) => (
                <tr key={`${file.fileId}-${idx}`} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4 border-none">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${file.fileName.endsWith('.pdf') ? 'text-error' : 'text-tertiary'}`}>
                        {file.fileName.endsWith('.pdf') ? 'picture_as_pdf' : 'table_chart'}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface text-sm tracking-tight">{file.fileName}</span>
                        <span className="text-[10px] text-outline font-medium tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                        Session {file.sessionId.substring(0, 12)}...
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
                      <span className="text-on-surface-variant text-sm font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                        {formatDate(file.sessionDate)}
                      </span>
                      <span className="text-[10px] text-outline uppercase font-bold tracking-widest">{file.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-none">
                    <button className="p-2 hover:bg-surface-container-high rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer">
                      <span className="material-symbols-outlined text-outline text-lg">download</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
            {!history?.isLoading && history?.sessions?.length === 0 && (
              <tr>
                <td colSpan={groupBy === 'session' ? 5 : 5} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center opacity-40">
                    <span className="material-symbols-outlined text-6xl mb-4">folder_off</span>
                    <p className="text-on-surface-variant font-bold text-lg tracking-tight">No activity history found</p>
                    <p className="text-sm text-outline max-w-[280px]">Your processed files and sessions will appear here after ingestion.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {history?.sessions?.length > 0 && history?.sessions?.length < history?.totalCount && (
        <div className="mt-12 flex justify-center">
          <button 
            className="px-12 py-3 text-xs font-black uppercase tracking-widest text-primary border-2 border-primary/20 hover:border-primary/50 rounded-full hover:bg-primary/5 transition-all cursor-pointer shadow-lg shadow-primary/5 active:scale-95 duration-200"
            onClick={() => getHistory({ offset: history?.sessions?.length, limit: 5 })}
            disabled={history?.isLoading}
          >
            {history?.isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              <div className="flex items-center gap-1 hover:gap-3 transition-all">
                Load more activities
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

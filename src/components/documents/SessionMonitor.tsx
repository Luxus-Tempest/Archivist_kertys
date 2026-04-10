import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as signalR from '@microsoft/signalr';
import type { RootState } from '../../store';
import { updateSessionStatus } from '../../store/docs/docsSlice';
import { ProcessingStatus } from '../../types/documents';
import { DocumentTable } from './DocumentTable';
import { DocumentRow } from './DocumentRow';

interface SessionMonitorProps {
  sessionId: string;
  onClose: () => void;
}

export function SessionMonitor({ sessionId, onClose }: SessionMonitorProps) {
  const dispatch = useDispatch();
  const sessionData = useSelector((state: RootState) => state.docs.activeSessions[sessionId]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    
    const baseUrl = import.meta.env.VITE_BASE_URL || '';
    const rootUrl = baseUrl.replace(/\/api\/?$/, '');
    const hubUrl = `${rootUrl}/events/external/status/${sessionId}`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveStatusUpdate", (data: any) => {
      const filesArray = data.files ?? data.Files;
      if (!Array.isArray(filesArray)) return;
      
      dispatch(updateSessionStatus({
        id: sessionId,
        update: {
          session: {
            id: sessionId,
            status: (data.sessionStatus ?? data.SessionStatus) as ProcessingStatus
          },
          files: filesArray.map((f: any) => ({
            id: f.fileId ?? f.FileId,
            fileName: f.fileName ?? f.FileName,
            status: (f.status ?? f.Status) as ProcessingStatus,
            category: f.category ?? f.Category ?? '',
          }))
        }
      }));
    });

    connection.start().catch((err: unknown) => console.error("SignalR Connection Error:", err));

    return () => { connection.stop(); };
  }, [sessionId, dispatch]);

  if (!sessionData) return null;

  return (
    <section className="flex flex-col gap-4 bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-5 transition-all shadow-sm">
      <div 
        className="flex flex-wrap transition-all duration-300 items-center justify-between gap-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="p-2 bg-surface-container-highest rounded-full text-on-surface-variant flex items-center justify-center transition-transform duration-200">
            <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              keyboard_arrow_down
            </span>
          </span>
          <div>
            <h4 className="px-3 py-1 bg-surface-container-high rounded-md text-[10px] font-mono text-outline font-medium tracking-tight border border-outline-variant/20">
              ID: {sessionData.session.id}
            </h4>
            <p className="text-xs text-on-surface-variant">{sessionData.files.length} documents</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <span className="px-3 py-1 bg-surface-container-high rounded-md text-[10px] font-mono text-outline font-medium tracking-tight border border-outline-variant/20 uppercase">
            STATUS: {sessionData.session.status}
          </span>
          <button 
            className="p-2 text-error hover:bg-error-container/10 rounded-full transition-colors flex items-center justify-center" 
            onClick={onClose}
            title="Close Session view"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <DocumentTable>
            {sessionData.files.length > 0 ? (
              sessionData.files.map((file) => (
                <DocumentRow
                  key={file.id}
                  name={file.fileName}
                  status={file.status}
                  category={file.category}
                  action={
                    file.status === ProcessingStatus.COMPLETED || file.status === ProcessingStatus.UPLOADED ? (
                      <button disabled className="p-2 text-outline rounded-full opacity-50 cursor-not-allowed">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center justify-center p-2 text-primary">
                        <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                      </span>
                    )
                  }
                />
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                    <p className="text-sm text-on-surface-variant italic">Connecting to session and retrieving document status...</p>
                  </div>
                </td>
              </tr>
            )}
          </DocumentTable>

          {sessionData.session.status === ProcessingStatus.COMPLETED && (
            <div className="mt-2 p-2 bg-tertiary-container/30 rounded-2xl border border-tertiary/20 flex items-start gap-2">
              <span className="material-symbols-outlined text-tertiary text-xl mt-0.5">verified_user</span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-tertiary mb-1">Session Complete</p>
                <p className="text-[12px] text-on-surface leading-relaxed opacity-80">
                  All documents have been processed and successfully ingested into the vault.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

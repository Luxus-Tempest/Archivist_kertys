import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as signalR from '@microsoft/signalr';
import type { RootState } from '../../store';
import { updateSessionStatus } from '../../store/docs/docsSlice';
import { ProcessingStatus } from '../../types/documents';
import { DocumentTable } from './DocumentTable';
import { DocumentRow } from './DocumentRow';
import { useTranslation } from 'react-i18next'

interface SessionMonitorProps {
  sessionId: string;
  onClose: () => void;
}

export function SessionMonitor({ sessionId, onClose }: SessionMonitorProps) {
  const { t } = useTranslation()
  const dispatch = useDispatch();
  const sessionData = useSelector((state: RootState) => state.docs.activeSessions[sessionId]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!sessionId || !sessionData) return;
    
    // Si la session est déjà terminée localement, on ne se connecte pas
    const terminalStates: string[] = [ProcessingStatus.COMPLETED, ProcessingStatus.UPLOADED, ProcessingStatus.FAILED];
    if (terminalStates.includes(sessionData.session.status)) {
      console.log(`SignalR: Session ${sessionId} is already ${sessionData.session.status}. Navigation connection skipped.`);
      return;
    }
    
    const baseUrl = import.meta.env.VITE_BASE_URL || '';
    const rootUrl = baseUrl.replace(/\/api\/?$/, '');
    const hubUrl = t('rooturleventsexternalstatussessionid', '{{rootUrl}}/events/external/status/{{sessionId}}', { rootUrl, sessionId });

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveStatusUpdate", (data: any) => {
      const sessionStatus = (data.sessionStatus ?? data.SessionStatus) as ProcessingStatus;
      const filesArray = data.files ?? data.Files;
      if (!Array.isArray(filesArray)) return;
      
      dispatch(updateSessionStatus({
        id: sessionId,
        update: {
          session: {
            id: sessionId,
            status: sessionStatus
          },
          files: filesArray.map((f: any) => ({
            id: f.fileId ?? f.FileId,
            fileName: f.fileName ?? f.FileName,
            status: (f.status ?? f.Status) as ProcessingStatus,
            category: f.category ?? f.Category ?? '',
          }))
        }
      }));

      // Close connection if session is completed
      if (sessionStatus === ProcessingStatus.COMPLETED) {
        connection.stop();
        console.log(`SignalR: Session ${sessionId} completed. Connection closed.`);
      }
    });

    connection.start().catch((err: unknown) => console.error("SignalR Connection Error:", err));

    return () => { connection.stop(); };
  }, [sessionId, dispatch]);

  if (!sessionData) return null;

  return (
    <section className="flex flex-col gap-4 bg-surface-container-lowest border border-outline-variant/20 rounded-md p-5 transition-all shadow-sm">
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
            <h4 className="px-3 py-1 bg-surface-container-high rounded-md text-[10px] font-mono text-outline font-medium tracking-tight border border-outline-variant/20">{t('idId', 'ID: {{id}}', { id: sessionData.session.id })}</h4>
            <p className="text-xs text-on-surface-variant">{t('lengthDocuments2', '{{length}} documents', { length: sessionData.files.length })}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <span className="px-3 py-1 bg-surface-container-high rounded-md text-[10px] font-mono text-outline font-medium tracking-tight border border-outline-variant/20 uppercase">{t('statusStatus', 'STATUS: {{status}}', { status: sessionData.session.status })}</span>
          <button 
            className="p-2 text-error hover:bg-error-container/10 rounded-full transition-colors flex items-center justify-center" 
            onClick={onClose}
            title={t('closeSessionView', 'Close Session view')}
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
                    <p className="text-sm text-on-surface-variant italic">{t('connectingToSessionAndRetrievingDocumentStatus', 'Connecting to session and retrieving document status...')}</p>
                  </div>
                </td>
              </tr>
            )}
          </DocumentTable>

          {sessionData.session.status === ProcessingStatus.COMPLETED && (
            <div className="mt-2 p-2 bg-tertiary-container/30 rounded-md border border-tertiary/20 flex items-start gap-2">
              <span className="material-symbols-outlined text-tertiary text-xl mt-0.5">verified_user</span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-tertiary mb-1">{t('sessionComplete', 'Session Complete')}</p>
                <p className="text-[12px] text-on-surface leading-relaxed opacity-80">
                  {t('allDocumentsHaveBeenProcessedAndSuccessfullyIngestedIntoTheVault', 'All documents have been processed and successfully ingested into the vault.')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

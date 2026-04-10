import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as signalR from '@microsoft/signalr';
import { UploadAreaNew } from '../components/UploadAreaNew';
import { ProcessingStatus } from '../types/documents';
import { DashboardLayoutNew } from '../components/layout/DashboardLayoutNew';
import { useDocument } from '../hooks/useDocument';
import type { RootState } from '../store';
import { 
  addStagedFile, 
  removeStagedFile, 
  clearStagedFiles, 
  setSession, 
  removeSession, 
  updateSessionStatus 
} from '../store/docs/docsSlice';
import { fileStorage } from '../utils/fileStorage';
import type { StagedFileMetadata } from '../store/docs/docsSlice';
import type { UploadResponse } from '../types/documents';

const getStatusBadge = (status: ProcessingStatus | string) => {
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
};

function SessionMonitor({ sessionId, onClose }: { sessionId: string, onClose: () => void }) {
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
            {/* <h4 className="text-sm font-bold font-headline text-on-surface tracking-tight">Session {sessionData.session.id}</h4> */}
            <h4 className="px-3 py-1 bg-surface-container-high rounded-md text-[10px] font-mono text-outline font-medium tracking-tight border border-outline-variant/20">
            ID: {sessionData.session.id}
          </h4>
            <p className="text-xs text-on-surface-variant">{sessionData.files.length} documents</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <span className="px-3 py-1 bg-surface-container-high rounded-md text-[10px] font-mono text-outline font-medium tracking-tight border border-outline-variant/20">
            ID: {sessionData.session.id}
          </span>
          <span className="px-3 py-1 bg-surface-container-high rounded-md text-[10px] font-mono text-outline font-medium tracking-tight border border-outline-variant/20">
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
          <div className="bg-surface-container-low/50 rounded-[2rem] border border-outline-variant/10 overflow-hidden mt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-high/30 border-b border-outline-variant/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Document</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {sessionData.files.map((file) => (
                    <tr key={file.id} className="group hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-16 bg-white rounded-lg border border-outline-variant/30 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                            <span className="material-symbols-outlined text-outline/30 text-2xl">description</span>
                            <div className="absolute inset-x-2 top-2 h-0.5 bg-slate-100 rounded"></div>
                            <div className="absolute inset-x-2 top-4 h-0.5 bg-slate-100 rounded w-4/5"></div>
                            <div className="absolute inset-x-2 top-6 h-0.5 bg-slate-100 rounded w-2/3"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-primary/5 flex items-center justify-center">
                              <span className="text-[6px] font-bold text-outline-variant uppercase">
                                {file.fileName.split('.').pop()}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-on-surface truncate">{file.fileName}</p>
                            {file.status === ProcessingStatus.PROCESSING ? (
                              <div className="mt-2">
                                <div className="w-full max-w-[120px] bg-primary-container/20 h-1 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary animate-pulse" style={{ width: '70%' }}></div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                {file.category && (
                                  <span className="px-1.5 py-0.5 bg-surface-container-highest rounded text-[9px] font-bold text-outline uppercase tracking-wider">
                                    {file.category}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(file.status)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {file.status === ProcessingStatus.COMPLETED || file.status === ProcessingStatus.UPLOADED ? (
                          <button disabled className="p-2 text-outline rounded-full opacity-50 cursor-not-allowed">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center justify-center p-2 text-primary">
                            <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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

export function ProcessNew() {
  const dispatch = useDispatch();
  const { stagedFiles: stagedMetadata, activeSessions } = useSelector((state: RootState) => state.docs);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const { uploadFiles, isUploading } = useDocument();

  // Rehydration des fichiers au montage
  useEffect(() => {
    const loadFiles = async () => {
      const loadedFiles: File[] = [];
      for (const meta of stagedMetadata) {
        const file = await fileStorage.getFile(meta.id);
        if (file) {
          // On recrée un objet File avec le nom d'origine si possible (IndexedDB le garde normalement)
          loadedFiles.push(file);
        }
      }
      setStagedFiles(loadedFiles);
    };

    if (stagedMetadata.length > 0 && stagedFiles.length === 0) {
      loadFiles();
    }
  }, [stagedMetadata]);

  const handleFilesSelected = async (files: File[]) => {
    for (const file of files) {
      const id = `${file.name}-${file.size}-${Date.now()}`;
      const metadata: StagedFileMetadata = {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };
      
      await fileStorage.saveFile(id, file);
      dispatch(addStagedFile(metadata));
      setStagedFiles((prev: File[]) => [...prev, file]);
    }
  };

  const removeStaged = async (index: number) => {
    const fileToRemove = stagedFiles[index];
    const metadata = stagedMetadata.find((m: StagedFileMetadata) => m.name === fileToRemove.name && m.size === fileToRemove.size);
    
    if (metadata) {
      await fileStorage.deleteFile(metadata.id);
      dispatch(removeStagedFile(metadata.id));
    }
    setStagedFiles((prev: File[]) => prev.filter((_: File, i: number) => i !== index));
  };

  const clearStaged = async () => {
    await fileStorage.clearAll();
    dispatch(clearStagedFiles());
    setStagedFiles([]);
  };

  const handleSend = async () => {
    if (stagedFiles.length === 0) return;
    const result = await uploadFiles(stagedFiles);
    if (result) {
      dispatch(setSession(result));
      await clearStaged();
    }
  };

  const removeSessionHandler = (idToRemove: string) => {
    dispatch(removeSession(idToRemove));
  };

  const sessionsList = Object.values(activeSessions).reverse();

  return (
    <DashboardLayoutNew>
      <section className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Ingest Documents</h2>
        <p className="text-on-surface-variant font-body max-w-2xl leading-relaxed">
          Securely process your intellectual assets. Our system automatically classifies and inserts into M-Files each entry.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8">
        <UploadAreaNew 
          onFilesSelected={handleFilesSelected} 
          // isUploading={isUploading} 
        />

        {stagedFiles.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-headline text-on-surface">Staged Files</h3>
                <p className="text-sm text-on-surface-variant">Review documents before sending to vault</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  className="p-2 cursor-pointer text-error hover:bg-error-container/10 rounded-full transition-colors" 
                  onClick={clearStaged}
                  title="Clear All"
                >
                  <span className="material-symbols-outlined">delete_sweep</span>
                </button>
              </div>
            </div>

            <div className="bg-surface-container-low/50 rounded-[2rem] border border-outline-variant/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-high/30 border-b border-outline-variant/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Document</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {stagedFiles.map((file, index) => (
                      <tr key={`${file.name}-${index}`} className="group hover:bg-surface-container-lowest transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-16 bg-white rounded-lg border border-outline-variant/30 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                              <span className="material-symbols-outlined text-outline/30 text-2xl">description</span>
                              <div className="absolute inset-x-2 top-2 h-0.5 bg-slate-100 rounded"></div>
                              <div className="absolute bottom-0 left-0 right-0 h-4 bg-primary/5 flex items-center justify-center">
                                <span className="text-[6px] font-bold text-outline-variant uppercase">
                                  {file.name.split('.').pop()}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-on-surface truncate">{file.name}</p>
                              <p className="text-primary text-[12px] font-extrabold uppercase tracking-widest mt-0.5">{parseInt((file.size/1024/1024).toFixed(2)) < 1 ? (file.size/1024).toFixed(2) + " Ko" : (file.size/1024/1024).toFixed(2) + " MB"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge("Ready for processing")}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            className="p-2 cursor-pointer text-outline hover:text-error transition-colors rounded-full hover:bg-surface-container-highest"
                            onClick={() => removeStaged(index)}
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-2 mt-4">
              <button 
                className="px-8 py-3 bg-surface-container-highest text-on-surface font-bold text-sm rounded-xl hover:bg-surface-container-high transition-colors"
                onClick={clearStaged}
                disabled={isUploading}
              >
                Clear All
              </button>
              <button 
                onClick={handleSend}
                disabled={isUploading}
                className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-black transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Sending...' : 'Send to Vault'}
                <span className={`material-symbols-outlined text-sm ${isUploading ? 'animate-spin' : ''}`}>{isUploading ? 'sync' : 'send'}</span>
              </button>
            </div>
          </section>
        )}

          <div className="flex flex-col gap-4">
            {sessionsList.length > 0 && <div>
              <h3 className="text-xl font-bold font-headline text-on-surface">Monitoring Session</h3>
              <p className="text-sm text-on-surface-variant">Real-time status of documents processing</p>
            </div>}
        {(sessionsList as UploadResponse[]).map((session: UploadResponse) => (
            <SessionMonitor 
              key={session.session.id} 
              sessionId={session.session.id} 
              onClose={() => removeSessionHandler(session.session.id)} 
            />
          ))}
          </div>
      </div>
    </DashboardLayoutNew>
  );
}

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DashboardLayoutNew } from '../components/layout/DashboardLayoutNew';
import { UploadAreaNew } from '../components/UploadAreaNew';
import { StagedList } from '../components/documents/StagedList';
import { SessionMonitor } from '../components/documents/SessionMonitor';
import { Button } from '../components/Button';
import { useDocument } from '../hooks/useDocument';
import type { RootState } from '../store';
import { 
  addStagedFile, 
  removeStagedFile, 
  clearStagedFiles, 
  setSession, 
  removeSession, 
  initializeSessionsFromIds,
  reconcilePendingSessions
} from '../store/docs/docsSlice';
import { fileStorage } from '../utils/fileStorage';
import type { StagedFileMetadata } from '../store/docs/docsSlice';
import type { UploadResponse } from '../types/documents';
import { useTranslation } from 'react-i18next'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

export function ProcessNew() {
  const { t } = useTranslation()
  const dispatch = useDispatch();
  const { stagedFiles: stagedMetadata, activeSessions } = useSelector((state: RootState) => state.docs);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const { uploadFiles, fetchPendingSessions, isUploading } = useDocument();

  // Synchronisation des sessions serveurs au montage
  useEffect(() => {
    const syncSessions = async () => {
      try {
        const pendingIds = await fetchPendingSessions();
        // First mark finished sessions as Completed
        dispatch(reconcilePendingSessions(pendingIds));
        // Then initialize any new ones that weren't in our local state
        if (pendingIds.length > 0) {
          dispatch(initializeSessionsFromIds(pendingIds));
        }
      } catch (error) {
        console.error("Error syncing sessions:", error);
      } finally {
        setIsSyncing(false);
      }
    };
    syncSessions();
  }, [dispatch]);

  // Rehydration des fichiers au montage
  useEffect(() => {
    const loadFiles = async () => {
      const loadedFiles: File[] = [];
      for (const meta of stagedMetadata) {
        const file = await fileStorage.getFile(meta.id);
        if (file) {
          loadedFiles.push(file);
        }
      }
      setStagedFiles(loadedFiles);
    };

    if (stagedMetadata.length > 0 && stagedFiles.length === 0) {
      loadFiles();
    }
  }, [stagedMetadata, stagedFiles.length]);

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

  const sessionsList = Object.values(activeSessions).reverse() as UploadResponse[];

  return (
    <DashboardLayoutNew>
      <header className="mb-10 mt-10 px-15">
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">{t('ingestDocuments', 'Ingest Documents')}</h2>
        <p className="text-on-surface-variant font-body max-w-2xl leading-relaxed">
          {t('securelyProcessYourIntellectualAssetsOurSystemAutomaticallyClassifiesAndInsertsIntoMfilesEachEntry', 'Securely process your intellectual assets. Our system automatically classifies and inserts into M-Files each entry.')}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 px-15">
        <UploadAreaNew onFilesSelected={handleFilesSelected} />

        {stagedFiles.length > 0 && (
          <div className="flex flex-col gap-6">
            <StagedList 
              files={stagedFiles} 
              onRemove={removeStaged} 
              onClear={clearStaged} 
              isUploading={isUploading} 
            />
            
            <div className="flex self-end w-fit items-center justify-end gap-3 px-2">
              <Button 
                // className="px-8 cursor-pointer w-max whitespace-nowrap py-2.5 bg-surface-container-highest text-on-surface font-bold text-sm rounded-xl hover:bg-surface-container-high transition-colors"
                variant="outline"
                onClick={clearStaged}
                disabled={isUploading}
              >
                {t('clearAll', 'Clear All')}
              </Button>
              {/* <Button
                variant="lightSolid"
                onClick={clearStaged}
                disabled={isUploading}
                className=''
              >
                {t('clearAll', 'Clear All')}
              </Button> */}
              <Button 
                onClick={handleSend}
                disabled={isUploading}
                icon={isUploading ? <SyncRoundedIcon sx={{width: 15, height: 15}} className="animate-spin" /> : <SendRoundedIcon sx={{width: 18, height: 18}} />}
                variant="solid"
                // className={` ${isUploading ? 'opacity-70' : 'bg-slate-900'}`}
                // className={`w-auto px-10  shadow-xl shadow-slate-900/10 ${isUploading ? 'opacity-70' : 'bg-slate-900'}`}
                // btnClass={`rounded-md -py-2 text-[15px]`}
              >
                {isUploading ? t('sending') : t('sendToVault')}
              </Button>
            </div>
          </div>
        )}

        {!isSyncing && sessionsList.length > 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-bold font-headline text-on-surface">{t('monitoringSession', 'Monitoring Session')}</h3>
              <p className="text-sm text-on-surface-variant">{t('realtimeStatusOfDocumentsProcessing', 'Real-time status of documents processing')}</p>
            </div>
            {sessionsList.map(session => (
              <SessionMonitor 
                key={session.session.id} 
                sessionId={session.session.id} 
                onClose={() => dispatch(removeSession(session.session.id))} 
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayoutNew>
  );
}

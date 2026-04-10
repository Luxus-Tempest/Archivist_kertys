import { useState, useRef, useCallback } from 'react';
import { TrackedFile, FileStatus, Session } from '../types';

// ─────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://your-api.example.com';

const STATUS_PROGRESS: Record<FileStatus, number> = {
  pending:    0,
  processing: 40,
  classified: 75,
  uploaded:  100,
  error:     100,
};

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function generateLocalId(): string {
  return `file-${Math.random().toString(36).slice(2, 9)}`;
}

function getSessionsFromStorage(): Session[] {
  try {
    return JSON.parse(localStorage.getItem('docuflow_sessions') ?? '[]');
  } catch {
    return [];
  }
}

function saveSessionToStorage(session: Session): void {
  const sessions = getSessionsFromStorage();
  const updated = [session, ...sessions].slice(0, 50);
  localStorage.setItem('docuflow_sessions', JSON.stringify(updated));
}

// ─────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────
export function useFileProcessor() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [files, setFiles] = useState<TrackedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Keep a ref to the SignalR connection so you can close it on unmount
  // Replace the type with HubConnection from @microsoft/signalr
  const signalRConnection = useRef<unknown>(null);

  // ── Update a single file's status ──────────────────────────────────────
  const updateFileStatus = useCallback(
    (fileId: string, status: FileStatus, errorMessage?: string) => {
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status, progress: STATUS_PROGRESS[status], errorMessage }
            : f,
        ),
      );
    },
    [],
  );

  // ── MOCK: simulates SignalR events ─────────────────────────────────────
  //  ⚠️  DELETE THIS FUNCTION when you plug in real SignalR
  const _mockSignalR = useCallback(
    (trackedFiles: TrackedFile[], sid: string) => {
      const statusFlow: FileStatus[] = ['processing', 'classified', 'uploaded'];

      trackedFiles.forEach((file, fileIndex) => {
        statusFlow.forEach((status, stepIndex) => {
          const delay = 800 + fileIndex * 700 + stepIndex * 1500 + Math.random() * 300;

          setTimeout(() => {
            updateFileStatus(file.id, status);

            // When all files reach "uploaded", persist the session
            setFiles(current => {
              const allDone = current.every(
                f => f.status === 'uploaded' || f.status === 'error',
              );
              if (allDone) {
                const session: Session = {
                  id: sid,
                  createdAt: new Date().toISOString(),
                  files: current.map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type,
                    status: f.status,
                  })),
                };
                saveSessionToStorage(session);
              }
              return current;
            });
          }, delay);
        });
      });
    },
    [updateFileStatus],
  );

  // ── START SIGNALR ──────────────────────────────────────────────────────
  //  Replace this entire function body with your real SignalR setup.
  //  The only contract this hook needs is: call updateFileStatus(fileId, status)
  //  whenever the server pushes an update.
  const _startSignalR = useCallback(
    async (sid: string, trackedFiles: TrackedFile[]) => {
      // ── Real SignalR (uncomment & adapt) ─────────────────────────────
      //
      // import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
      //
      // const connection = new HubConnectionBuilder()
      //   .withUrl(`${API_BASE_URL}/hub/processing?sessionId=${sid}`)
      //   .withAutomaticReconnect()
      //   .configureLogging(LogLevel.Warning)
      //   .build();
      //
      // connection.on('FileStatusUpdate', (fileId: string, status: FileStatus) => {
      //   updateFileStatus(fileId, status);
      // });
      //
      // connection.on('FileError', (fileId: string, message: string) => {
      //   updateFileStatus(fileId, 'error', message);
      // });
      //
      // await connection.start();
      // signalRConnection.current = connection;
      // ─────────────────────────────────────────────────────────────────

      // Remove the mock below once SignalR is wired:
      _mockSignalR(trackedFiles, sid);
    },
    [_mockSignalR, updateFileStatus],
  );

  // ── UPLOAD FILES ───────────────────────────────────────────────────────
  const uploadFiles = useCallback(
    async (rawFiles: File[]) => {
      if (!rawFiles.length) return;

      // Stop any existing SignalR connection
      const conn = signalRConnection.current as { stop?: () => void } | null;
      conn?.stop?.();
      signalRConnection.current = null;

      setUploadError(null);
      setIsUploading(true);

      // Optimistic UI — show all files as "pending" immediately
      const trackedFiles: TrackedFile[] = rawFiles.map(f => ({
        id: generateLocalId(),
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        status: 'pending',
        progress: 0,
      }));
      setFiles(trackedFiles);

      try {
        // ── Real API call ───────────────────────────────────────────────
        // const formData = new FormData();
        // rawFiles.forEach(f => formData.append('files', f));
        //
        // const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        //   method: 'POST',
        //   body: formData,
        //   headers: {
        //     // Authorization: `Bearer ${token}`,
        //   },
        // });
        //
        // if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
        //
        // const { sessionId: sid }: { sessionId: string } = await response.json();
        // ── Mock response (remove once API is ready) ────────────────────
        await new Promise(r => setTimeout(r, 600));
        const sid = 'SESS-' + Math.random().toString(36).slice(2, 9).toUpperCase();
        // ───────────────────────────────────────────────────────────────

        setSessionId(sid);
        setIsUploading(false);
        await _startSignalR(sid, trackedFiles);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Erreur inattendue');
        setIsUploading(false);
      }
    },
    [_startSignalR],
  );

  // ── RESET ──────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    const conn = signalRConnection.current as { stop?: () => void } | null;
    conn?.stop?.();
    signalRConnection.current = null;
    setFiles([]);
    setSessionId(null);
    setUploadError(null);
  }, []);

  return {
    sessionId,
    files,
    isUploading,
    uploadError,
    uploadFiles,
    reset,
    getSessionsFromStorage,
  };
}

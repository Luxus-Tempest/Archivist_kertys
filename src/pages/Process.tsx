import { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { Clock, Loader2, Tags, CheckCircle2 } from 'lucide-react';
import { UploadArea } from '../components/UploadArea';
import { SvgIcon } from '../components/SvgIcon';
import { ProcessingStatus, type UploadResponse } from '../types/documents';

export function Process() {
  const [sessionData, setSessionData] = useState<UploadResponse | null>(null);

  // Initialiser la connexion SignalR quand la session est créée
  useEffect(() => {
    if (!sessionData?.session?.id) return;
    
    const sessionId = sessionData.session.id;
    const baseUrl = import.meta.env.VITE_BASE_URL || '';
    // Construction de l'URL du hub en supposant que la base URL contient potentiellement /api
    const rootUrl = baseUrl.replace(/\/api\/?$/, '');
    const hubUrl = `${rootUrl}/events/external/status/${sessionId}`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveStatusUpdate", (data: any) => {
      console.log("ReceiveStatusUpdate", data);
      setSessionData(prev => {
        if (!prev) return prev;
        
        // Le backend envoie en camelCase: sessionStatus, files, fileId, fileName, status, category
        const filesArray = data.files ?? data.Files;
        if (!Array.isArray(filesArray)) return prev;

        return {
          ...prev,
          session: {
            ...prev.session,
            status: (data.sessionStatus ?? data.SessionStatus) as ProcessingStatus
          },
          files: filesArray.map((f: any) => ({
            id: f.fileId ?? f.FileId,
            fileName: f.fileName ?? f.FileName,
            status: (f.status ?? f.Status) as ProcessingStatus,
            category: f.category ?? f.Category ?? '',
          }))
        };
      });
    });

    connection.start().catch((err) => {
      console.error("SignalR Connection Error:", err);
    });

    return () => {
      connection.stop();
    };
  }, [sessionData?.session?.id]); // On exécute ceci uniquement quand le Session ID est affecté ou modifié

  const getStatusBadge = (status: ProcessingStatus) => {
    switch (status) {
      case ProcessingStatus.PENDING:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
            <Clock strokeWidth={1.5} className="w-3.5 h-3.5" />
            En attente
          </span>
        );
      case ProcessingStatus.PROCESSING:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
            <Loader2 strokeWidth={1.5} className="w-3.5 h-3.5 animate-spin" />
            En cours
          </span>
        );
      case ProcessingStatus.CLASSIFIED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20">
            <Tags strokeWidth={1.5} className="w-3.5 h-3.5" />
            Classifié
          </span>
        );
      case ProcessingStatus.UPLOADED:
      case ProcessingStatus.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
            Terminé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
            <Clock strokeWidth={1.5} className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-[95%] mx-auto space-y-10">
      {/* Upload Section */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Téléchargement et traitement</h1>
            <p className="text-base text-zinc-500 mt-1">Sélectionnez les fichiers à envoyer pour lancer une session de traitement.</p>
          </div>
        </div>

        {/* Dropzone */}
        <UploadArea onUploadSuccess={(data) => setSessionData(data)} />
      </section>

      {/* Status Section (Session View) */}
      {sessionData && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Session Actuelle</h2>
              <p className="text-sm text-zinc-500">Statut en temps réel des documents téléversés.</p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-1.5 rounded-xs">
              <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Session ID</span>
              <span className="text-sm font-medium font-mono text-zinc-700">{sessionData.session.id}</span>
            </div>
          </div>

          {/* File List Card */}
          <div className="bg-white border border-zinc-200 rounded-xs overflow-hidden">
            
            {/* List Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-50/80 border-b border-zinc-200 text-xs font-medium text-zinc-900 uppercase tracking-wider">
              <div className="col-span-8 sm:col-span-8">Nom du fichier</div>
              <div className="col-span-4 sm:col-span-4 text-right">Statut</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-zinc-100">
              {sessionData.files.map((file) => (
                <div key={file.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-zinc-50/50 transition-colors">
                  <div className="col-span-8 sm:col-span-8 flex items-center gap-3 overflow-hidden">
                    <div className="w-7 h-7 flex items-center justify-center bg-zinc-100 rounded-xs shrink-0 border border-zinc-200/50">
                      <SvgIcon name={file.fileName.split('.').pop() || 'default'} width="20" height="20" color="#71717a" className="w-4 h-4 text-zinc-500" />
                    </div>
                    <span className="text-zinc-900 text-sm truncate">{file.fileName}</span>
                    {file.category && (
                      <code className="text-[10px] bg-zinc-100 text-zinc-600 rounded-xs px-2 py-0.5 ml-2 font-mono">
                        {file.category}
                      </code>
                    )}
                  </div>
                  <div className="col-span-4 sm:col-span-4 flex justify-end">
                    {getStatusBadge(file.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

import { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import { useMetadata } from '../../hooks/useMetadata';
import { fetchAuthBlob } from '../../utils/api';
import { Page, Document, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Initialize PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type DocItem = {
  id: number;
  name: string;
  type: string;
  status: string;
  author: string;
  authorImg: string;
  shared: number;
  date: string;
  rawDate: string;
  isFolder: boolean;
  isPdf: boolean;
  isDoc: boolean;
  dept: string;
  fav: boolean;
  docId: string;
  size: number | null;
  tags: string[];
  reminder: string | null;
  retention: string;
  protection: string;
};

const formatSize = (bytes: number | null) => {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface Props {
  doc: DocItem | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

type DetailTab = 'details';

export function DocumentDetailDrawer({ doc, onClose, onToast }: Props) {
  const detailTab: DetailTab = 'details';
  const [previewZoom, setPreviewZoom] = useState(70);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, any>>({});

  const { activeRow, fetchMetadataByDocumentId, updateMetadataRow } = useMetadata();

  useEffect(() => {
    let currentUrl: string | null = null;

    async function loadPreview() {
      if (!doc || doc.isFolder) {
        setPreviewUrl(null);
        return;
      }

      setIsPreviewLoading(true);
      try {
        const blob = await fetchAuthBlob(`/docs/file/${doc.docId}`);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        currentUrl = url;
        setPreviewZoom(70);
      } catch (err) {
        console.error("Error loading PDF preview:", err);
        setPreviewUrl(null);
      } finally {
        setIsPreviewLoading(false);
      }
    }

    loadPreview();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [doc]);

  useEffect(() => {
    if (doc && !doc.isFolder && doc.dept) {
      fetchMetadataByDocumentId(doc.dept, doc.docId);
      setIsEditing(false);
    }
  }, [doc, fetchMetadataByDocumentId]);

  const handleStartEdit = () => {
    if (activeRow.data) {
      setEditedFields({ ...activeRow.data });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!doc || !activeRow.data) return;
    const metadataId = activeRow.data.Id;
    if (!metadataId) return;

    const fieldsToUpdate = { ...editedFields };
    delete fieldsToUpdate.Id;
    delete fieldsToUpdate.DocumentId;

    const res = await updateMetadataRow(doc.dept, metadataId, fieldsToUpdate);
    if (res) {
      onToast('Métadonnées enregistrées avec succès !');
      setIsEditing(false);
      fetchMetadataByDocumentId(doc.dept, doc.docId);
    } else {
      onToast('Erreur lors de la mise à jour.');
    }
  };



  return (
    <Drawer
      anchor="right"
      open={!!doc}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100vw', md: 880 },
            boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
            border: 'none',
            overflow: 'hidden',
          },
        },
      }}
      variant="temporary"
      ModalProps={{ keepMounted: false }}
    >
      {doc && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'inherit', overflow: 'hidden' }}>

          {/* ── Drawer Header ── */}
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-200 shrink-0 bg-white">
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors text-slate-500 shrink-0"
            >
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </button>


            <span className="text-[13px] font-semibold text-slate-800 truncate flex-1">{doc.name}</span>

            {/* <div className="flex items-center gap-0.5 shrink-0">
              <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors" onClick={() => onToast('Partager')} title="Partager">
                <ShareRoundedIcon sx={{ fontSize: 14 }} className="text-slate-500" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors" onClick={() => onToast('Télécharger')} title="Télécharger">
                <DownloadRoundedIcon sx={{ fontSize: 14 }} className="text-slate-500" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors" onClick={() => onToast('Plus d actions')} title="Plus">
                <MoreHorizRoundedIcon sx={{ fontSize: 16 }} className="text-slate-500" />
              </button>
            </div> */}
          </div>

          {/* ── Tab Bar ── */}
          {/* <div className="flex border-b border-slate-200 bg-white shrink-0 px-4 gap-1">
            {(['details', 'communication', 'task', 'activity'] as const).map(t => (
              <div key={t} onClick={() => setDetailTab(t)} className={detailTabClass(t)}>
                {t === 'details' ? 'Détails' : t === 'communication' ? 'Comm.' : t === 'task' ? 'Tâches' : 'Activité'}
              </div>
            ))}
          </div> */}

          {/* ── Main Body (2 columns: preview + properties) ── */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* ── Left: Preview ── */}
            <div className="flex-1 flex flex-col bg-slate-100/70 border-r border-slate-200 min-w-0 overflow-hidden">
              <div className="flex-1 overflow-auto p-6 [scrollbar-width:thin] flex items-center justify-center relative" id="drawer-preview-container">
                {doc.isFolder ? (
                  <div className="flex flex-col items-center justify-center text-slate-300 select-none">
                    <FolderRoundedIcon sx={{ fontSize: 72 }} className="text-blue-200 mb-3" />
                    <span className="text-sm font-medium text-slate-400">Dossier — pas d aperçu</span>
                  </div>
                ) : isPreviewLoading ? (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <AutorenewRoundedIcon className="animate-spin text-slate-500 text-3xl mb-2" />
                    <span className="text-xs font-semibold text-slate-500">Chargement de l aperçu...</span>
                  </div>
                ) : previewUrl ? (
                  <div className="inline-block align-middle text-left bg-white shadow-xl" style={{ width: `${previewZoom}%`, maxWidth: 520, minWidth: 280 }}>
                    <Document
                      file={previewUrl}
                      onLoadSuccess={({ numPages }) => {
                        setPageCount(typeof numPages === 'number' ? numPages : 1);
                      }}
                      loading={
                        <div className="flex items-center justify-center p-10 text-slate-400">
                          Chargement du document...
                        </div>
                      }
                    >
                      <div className="flex flex-col gap-4">
                        {Array.from({ length: pageCount }).map((_, index) => (
                          <Page
                            key={index}
                            pageNumber={index + 1}
                            scale={previewZoom / 100}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        ))}
                      </div>
                    </Document>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center bg-white rounded-lg shadow-sm border border-slate-100 max-w-sm">
                    <PictureAsPdfRoundedIcon sx={{ fontSize: 48 }} className="text-red-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Aperçu non disponible</p>
                    <p className="text-xs text-slate-400 mt-1">Impossible de charger le document en PDF.</p>
                  </div>
                )}
              </div>

              {!doc.isFolder && previewUrl && (
                <div className="shrink-0 flex items-center justify-center gap-2 py-2.5 border-t border-slate-200 bg-white">
                  <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-40" onClick={() => setPreviewZoom(z => Math.max(z - 20, 30))} disabled={previewZoom <= 30}>
                    <ZoomOutRoundedIcon sx={{ fontSize: 16 }} />
                  </button>
                  <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full">
                    <input
                      type="range" min={30} max={200} step={10} value={previewZoom}
                      onChange={e => setPreviewZoom(Number(e.target.value))}
                      className="w-20 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-slate-600 w-9 text-center">{previewZoom}%</span>
                  </div>
                  <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-40" onClick={() => setPreviewZoom(z => Math.min(z + 10, 200))} disabled={previewZoom >= 200}>
                    <ZoomInRoundedIcon sx={{ fontSize: 16 }} />
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors" onClick={() => {
                    const el = document.getElementById('drawer-preview-container');
                    el?.requestFullscreen().catch(() => { });
                  }}>
                    <FullscreenRoundedIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: Properties Panel ── */}
            <div className="w-[320px] min-w-[320px] flex flex-col overflow-hidden bg-white">
              <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">

                {detailTab === 'details' && (
                  <div className="p-4 space-y-4">

                    {/* Dynamic Metadata Fields */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Informations Métadonnées</span>
                        {doc && doc.dept && (
                          <span className="px-2 py-0.5 bg-blue-thin text-blue-dark text-[9px] font-bold rounded uppercase tracking-wider border border-blue-200">
                            {doc.dept}
                          </span>
                        )}
                      </div>
                      
                      {activeRow.isLoading ? (
                        <div className="p-4 space-y-3 animate-pulse">
                          <div className="h-4 bg-slate-100 rounded w-full"></div>
                          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                        </div>
                      ) : activeRow.data ? (
                        <div className="divide-y divide-slate-100">
                          {Object.keys(activeRow.data)
                            .filter(key => key !== 'Id' && key !== 'DocumentId')
                            .map(key => {
                              const val = activeRow.data![key];
                              return (
                                <div key={key} className="flex flex-col px-4 py-2.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{key}</span>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all font-medium text-slate-700"
                                      value={editedFields[key] !== undefined ? editedFields[key] : (val || '')}
                                      onChange={(e) => setEditedFields({ ...editedFields, [key]: e.target.value })}
                                    />
                                  ) : (
                                    <span className="text-[12px] font-semibold text-slate-700 truncate">
                                      {val !== null && val !== undefined ? String(val) : '—'}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          Aucune métadonnée associée à ce document.
                        </div>
                      )}
                    </div>

                    {/* Standard Document Information */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Informations Fichier</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-[11px] text-slate-400 shrink-0">Document ID</span>
                          <div className="flex items-center gap-1.5 ml-3 min-w-0">
                            <span className="text-[11.5px] font-medium text-slate-700 truncate">{doc.docId}</span>
                            <button className="text-blue-400 hover:text-blue-600 transition-colors shrink-0" onClick={() => { navigator.clipboard.writeText(doc.docId); onToast('ID copié !'); }}>
                              <LinkRoundedIcon sx={{ fontSize: 13 }} />
                            </button>
                          </div>
                        </div>
                        {doc.size && (
                          <div className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-[11px] text-slate-400 shrink-0">Taille</span>
                            <span className="text-[11.5px] font-medium text-slate-700 ml-3">{formatSize(doc.size)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-[11px] text-slate-400 shrink-0">Date de modification</span>
                          <span className="text-[11.5px] font-medium text-slate-700 ml-3">{doc.date}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                

                
              </div>

              {/* Footer Actions */}
              <div className="px-4 py-3 border-t border-slate-200 flex gap-2 shrink-0 bg-white">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 border border-slate-300 text-slate-700 text-[12px] font-medium rounded-md hover:bg-slate-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex-1 py-2 bg-blue-600 text-white text-[12px] font-semibold rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Enregistrer
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleStartEdit}
                      disabled={!activeRow.data}
                      className="flex-1 py-2 border border-slate-300 text-slate-700 text-[12px] font-medium rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Modifier
                    </button>
                    <button 
                      className="flex-1 py-2 bg-blue-thin text-blue-dark text-[12px] font-semibold rounded-md hover:opacity-90 transition-opacity" 
                      onClick={() => onToast(`Visualisation de "${doc.name}"`)}
                    >
                      Voir
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Box>
      )}
    </Drawer>
  );
}

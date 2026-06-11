import { useState, useEffect, useRef, useCallback } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FitScreenRoundedIcon from "@mui/icons-material/FitScreenRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { useMetadata } from "../../hooks/useMetadata";
import { useDocument } from "../../hooks/useDocument";
import { DOCUMENT_FILE_FORMAT } from "../../store/docs/docsSlice";
import { Page, Document, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "../Button";

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

// ─── PDF Preview ─────────────────────────────────────────────────────────────
function PdfPreview({ url }: { url: string }) {
  const [zoom, setZoom] = useState(74);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const computeFitZoom = useCallback(() => {
    if (!scrollRef.current) return 100;
    const available = scrollRef.current.clientWidth - 48;
    return Math.round((available / 595) * 100);
  }, []);

  // Reset and fit only when url changes (new document)
  useEffect(() => {
    const fit = computeFitZoom();
    setZoom(Math.max(50, Math.min(fit, 150)));
    setCurrentPage(1);
    setPageCount(0);
    pageRefs.current = [];
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track visible page — re-wire only when pageCount changes, NOT on zoom
  useEffect(() => {
    if (!scrollRef.current || pageCount === 0) return;
    const root = scrollRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const idx = pageRefs.current.indexOf(visible[0].target as HTMLDivElement);
          if (idx !== -1) setCurrentPage(idx + 1);
        }
      },
      { root, threshold: 0.3 },
    );
    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [pageCount]);

  const scrollToPage = useCallback((n: number) => {
    const el = pageRefs.current[n - 1];
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
    }
  }, []);

  const handleZoom = (delta: number) =>
    setZoom((z) => Math.max(50, Math.min(z + delta, 250)));

  const fitWidth = useCallback(() => {
    setZoom(Math.max(50, Math.min(computeFitZoom(), 150)));
  }, [computeFitZoom]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const pdfScale = zoom / 100;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full bg-[#404040] ${isFullscreen ? "fixed inset-0 z-[9999]" : ""}`}
    >
      {/* Toolbar */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-[#2d2d2d] border-b border-black/30">
        {/* Page nav */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <KeyboardArrowUpRoundedIcon sx={{ fontSize: 15 }} />
          </button>
          <div className="flex items-center gap-0.5 bg-white/10 rounded px-1.5 py-0.5 mx-0.5">
            <input
              type="number"
              min={1}
              max={pageCount || 1}
              value={currentPage}
              onChange={(e) => {
                const n = Math.max(1, Math.min(pageCount, Number(e.target.value)));
                setCurrentPage(n);
                scrollToPage(n);
              }}
              className="w-6 text-center text-[11px] font-medium text-white bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[11px] text-slate-500">/</span>
            <span className="text-[11px] text-slate-400 min-w-[12px]">{pageCount || "—"}</span>
          </div>
          <button
            onClick={() => scrollToPage(Math.min(pageCount, currentPage + 1))}
            disabled={currentPage >= pageCount}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <KeyboardArrowDownRoundedIcon sx={{ fontSize: 15 }} />
          </button>
        </div>

        <div className="w-px h-3.5 bg-white/15 mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => handleZoom(-10)}
            disabled={zoom <= 50}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ZoomOutRoundedIcon sx={{ fontSize: 15 }} />
          </button>
          <button
            onClick={fitWidth}
            className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/20 transition-colors min-w-[42px] text-center"
          >
            {zoom}%
          </button>
          <button
            onClick={() => handleZoom(10)}
            disabled={zoom >= 250}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ZoomInRoundedIcon sx={{ fontSize: 15 }} />
          </button>
        </div>

        <div className="w-px h-3.5 bg-white/15 mx-1" />

        <button
          onClick={fitWidth}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Ajuster à la largeur"
        >
          <FitScreenRoundedIcon sx={{ fontSize: 14 }} />
        </button>
        <button
          onClick={toggleFullscreen}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Plein écran"
        >
          <FullscreenRoundedIcon sx={{ fontSize: 15 }} />
        </button>
      </div>

      {/* Scroll area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]"
        style={{ padding: "20px 24px" }}
      >
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => {
            setPageCount(typeof numPages === "number" ? numPages : 1);
          }}
          loading={null}
          error={null}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              width: "100%",
            }}
          >
            {Array.from({ length: pageCount }).map((_, i) => (
              <div
                key={i}
                ref={(el) => { pageRefs.current[i] = el; }}
                style={{
                  boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
                  borderRadius: "2px",
                  overflow: "hidden",
                  flexShrink: 0,
                  lineHeight: 0,
                  background: "#fff",
                }}
              >
                <Page
                  pageNumber={i + 1}
                  scale={pdfScale}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                  loading={
                    <div
                      style={{
                        width: `${Math.round(595 * pdfScale)}px`,
                        height: `${Math.round(842 * pdfScale)}px`,
                        background: "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AutorenewRoundedIcon
                        className="animate-spin"
                        sx={{ fontSize: 18, color: "#cbd5e1" }}
                      />
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        </Document>
      </div>

      {/* Page dots */}
      {pageCount > 1 && (
        <div className="shrink-0 flex items-center justify-center gap-1 py-1.5 bg-[#2d2d2d] border-t border-black/20">
          {Array.from({ length: Math.min(pageCount, 12) }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i + 1)}
              className={`rounded-full transition-all duration-200 ${
                currentPage === i + 1
                  ? "w-4 h-1.5 bg-blue-400"
                  : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
          {pageCount > 12 && (
            <span className="text-[10px] text-slate-500 ml-1">+{pageCount - 12}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export function DocumentDetailDrawer({ doc, onClose, onToast }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, any>>({});

  const { activeRow, fetchMetadataByDocumentId, updateMetadataRow } = useMetadata();
  const { file, fetchFileForPreview, downloadFile, clearFilePreview } = useDocument();

  // ── KEY FIX: stable preview loading ──────────────────────────────────────
  //
  // Root cause of the flicker + disappear bug:
  //
  //   The old code had a single useEffect with BOTH fetch AND cleanup:
  //     useEffect(() => {
  //       fetchFileForPreview(doc.docId);
  //       return () => clearFilePreview();   // ← THE PROBLEM
  //     }, [doc?.docId]);
  //
  //   React runs the cleanup of the OLD effect synchronously before running
  //   the new effect. So on docId change the sequence was:
  //     1. clearFilePreview() → wipes store → objectUrl = null → preview vanishes
  //     2. fetchFileForPreview() → starts new request
  //     3. If anything cancelled or delayed step 2, preview stayed blank forever
  //
  //   Additional issue: after fixing the infinite-request loop, the effect
  //   deps were tightened, which made the cleanup fire more aggressively,
  //   exposing this race condition that was previously hidden.
  //
  // Fix: separate the two concerns into two effects with different lifecycles:
  //   - Effect 1: fetch when docId changes, but NEVER clear in its cleanup
  //   - Effect 2: clear ONLY on drawer unmount (empty deps [])
  //
  // The lastFetchedDocId ref prevents double-fetching the same doc if the
  // parent re-renders without actually changing the document.

  const lastFetchedDocId = useRef<string | null>(null);

  useEffect(() => {
    if (!doc || doc.isFolder) return;
    // Guard: skip if we already fetched this exact doc
    if (lastFetchedDocId.current === doc.docId) return;
    lastFetchedDocId.current = doc.docId;
    fetchFileForPreview(doc.docId);
    // No cleanup — never revoke a live objectUrl mid-session
  }, [doc?.docId, doc?.isFolder]); // eslint-disable-line react-hooks/exhaustive-deps

  // Only clean up when the drawer is fully destroyed
  useEffect(() => {
    return () => {
      lastFetchedDocId.current = null;
      clearFilePreview();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load metadata
  useEffect(() => {
    if (doc && !doc.isFolder && doc.dept) {
      fetchMetadataByDocumentId(doc.dept, doc.docId);
      setIsEditing(false);
    }
  }, [doc?.docId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartEdit = () => {
    if (activeRow.data) {
      setEditedFields({ ...activeRow.data });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!doc || !activeRow.data) return;
    const id = activeRow.data.Id;
    if (!id) return;
    const fields = { ...editedFields };
    delete fields.Id;
    delete fields.DocumentId;
    const res = await updateMetadataRow(doc.dept, id, fields);
    if (res) {
      onToast("Métadonnées enregistrées.");
      setIsEditing(false);
      fetchMetadataByDocumentId(doc.dept, doc.docId);
    } else {
      onToast("Erreur lors de la mise à jour.");
    }
  };

  const handleDownload = async () => {
    if (!doc || doc.isFolder) return;
    const ok = await downloadFile(doc.docId, doc.name);
    onToast(ok ? "Téléchargement démarré" : "Erreur lors du téléchargement");
  };

  // Derive preview state — only trust store values when docId matches
  const isMatchingDoc =
    !!doc &&
    file.docId === doc.docId &&
    file.format === DOCUMENT_FILE_FORMAT.PREVIEW;
  const isPreviewLoading = !doc?.isFolder && (!isMatchingDoc || file.isLoading);
  const previewUrl = isMatchingDoc && !file.isLoading ? file.objectUrl : null;
  const previewFailed = isMatchingDoc && !file.isLoading && !file.objectUrl;

  return (
    <Drawer
      anchor="right"
      open={!!doc}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100vw", md: 920 },
            boxShadow: "-8px 0 40px rgba(0,0,0,0.14)",
            border: "none",
            overflow: "hidden",
          },
        },
      }}
      variant="temporary"
      ModalProps={{ keepMounted: false }}
    >
      {doc && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            fontFamily: "inherit",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-white">
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
            >
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </button>
            <span className="text-[13px] font-semibold text-slate-800 truncate flex-1 min-w-0">
              {doc.name}
            </span>
            <Button
              onClick={handleDownload}
              disabled={file.isDownloading}
              icon={<DownloadRoundedIcon sx={{ fontSize: 14 }} />}
              iconPosition="left"
            >
              Télécharger
            </Button>
          </div>

          {/* Body */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* Preview pane */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#404040]">
              {doc.isFolder ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 select-none">
                  <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <FolderRoundedIcon sx={{ fontSize: 44 }} className="text-blue-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">
                    Dossier — aucun aperçu disponible
                  </p>
                </div>
              ) : isPreviewLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <AutorenewRoundedIcon
                    className="animate-spin text-slate-400"
                    sx={{ fontSize: 32 }}
                  />
                  <p className="text-xs font-medium text-slate-400">
                    Chargement de l&apos;aperçu…
                  </p>
                </div>
              ) : previewUrl ? (
                // key=previewUrl ensures PdfPreview fully remounts when a new
                // document is loaded, preventing stale page state
                <PdfPreview key={previewUrl} url={previewUrl} />
              ) : previewFailed ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <PictureAsPdfRoundedIcon sx={{ fontSize: 32 }} className="text-red-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-300">Aperçu non disponible</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Impossible de charger ce fichier.
                    </p>
                  </div>
                  <button
                    className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
                    onClick={handleDownload}
                    disabled={file.isDownloading}
                  >
                    Télécharger le fichier
                  </button>
                </div>
              ) : null}
            </div>

            {/* Properties panel */}
            <div className="w-[300px] min-w-[300px] flex flex-col overflow-hidden bg-white border-l border-slate-200">
              <div className="flex-1 overflow-y-auto [scrollbar-width:thin] divide-y divide-slate-100">

                {/* Metadata */}
                <div>
                  <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Métadonnées
                    </span>
                    {doc.dept && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-full uppercase tracking-wider border border-blue-100">
                        {doc.dept}
                      </span>
                    )}
                  </div>

                  {activeRow.isLoading ? (
                    <div className="p-4 space-y-3 animate-pulse">
                      {[100, 75, 90, 60].map((w, i) => (
                        <div key={i} className="h-3 bg-slate-100 rounded" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  ) : activeRow.data ? (
                    <div>
                      {Object.keys(activeRow.data)
                        .filter((k) => k !== "Id" && k !== "DocumentId")
                        .map((key) => {
                          const val = activeRow.data![key];
                          return (
                            <div key={key} className="px-4 py-2.5 border-b border-slate-50 last:border-0">
                              <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                {key}
                              </span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  className="w-full text-[12px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-slate-50/50 transition-all font-medium text-slate-700"
                                  value={editedFields[key] !== undefined ? editedFields[key] : (val ?? "")}
                                  onChange={(e) =>
                                    setEditedFields({ ...editedFields, [key]: e.target.value })
                                  }
                                />
                              ) : (
                                <span className="block text-[12px] font-medium text-slate-700 break-words">
                                  {val !== null && val !== undefined ? (
                                    String(val)
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-xs text-slate-400">Aucune métadonnée disponible</p>
                    </div>
                  )}
                </div>

                {/* File info */}
                <div>
                  <div className="sticky top-0 z-10 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Informations fichier
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-[11px] text-slate-400 shrink-0">Document ID</span>
                      <div className="flex items-center gap-1.5 min-w-0 ml-3">
                        <span className="text-[11px] font-medium text-slate-600 truncate font-mono">
                          {doc.docId}
                        </span>
                        <button
                          className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          onClick={() => { navigator.clipboard.writeText(doc.docId); onToast("ID copié !"); }}
                        >
                          <LinkRoundedIcon sx={{ fontSize: 12 }} />
                        </button>
                      </div>
                    </div>
                    {doc.size && (
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-[11px] text-slate-400">Taille</span>
                        <span className="text-[11px] font-medium text-slate-600 ml-3">{formatSize(doc.size)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-[11px] text-slate-400">Type</span>
                      <span className="text-[11px] font-medium text-slate-600 ml-3">{doc.type}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-[11px] text-slate-400">Modifié le</span>
                      <span className="text-[11px] font-medium text-slate-600 ml-3">{doc.rawDate}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-[11px] text-slate-400">Auteur</span>
                      <span className="text-[11px] font-medium text-slate-600 ml-3">{doc.author}</span>
                    </div>
                    {doc.dept && (
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-[11px] text-slate-400">Classe</span>
                        <span className="text-[11px] font-medium text-slate-600 ml-3 capitalize">{doc.dept}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-3 py-3 border-t border-slate-200 bg-slate-50/60 flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 border border-slate-300 text-slate-600 text-[12px] font-medium rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 py-2 bg-blue-600 text-white text-[12px] font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                    >
                      Enregistrer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartEdit}
                    disabled={!activeRow.data}
                    className="flex-1 py-2 flex items-center justify-center gap-1.5 border border-slate-300 text-slate-600 text-[12px] font-medium rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <EditRoundedIcon sx={{ fontSize: 13 }} />
                    Modifier les métadonnées
                  </button>
                )}
              </div>
            </div>
          </div>
        </Box>
      )}
    </Drawer>
  );
}
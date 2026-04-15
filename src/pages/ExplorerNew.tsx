import { useEffect, useState } from 'react';
import { DashboardLayoutNew } from '../components/layout/DashboardLayoutNew';
import { useMFilesDocsHook, type MFilesDocumentDto } from '../hooks/useMFilesDocsHook';
export function ExplorerNew() {
  const { documents, isLoading, fetchDocuments, getFileContent } = useMFilesDocsHook();
  const [activeDoc, setActiveDoc] = useState<MFilesDocumentDto | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (documents.length > 0 && !activeDoc) {
      setActiveDoc(documents[0]);
    }
  }, [documents, activeDoc]);

  useEffect(() => {
    let currentUrl: string | null = null;
    
    async function loadPreview() {
      if (!activeDoc) {
        setPreviewUrl(null);
        return;
      }

      const objId = (activeDoc as any)?.ObjVer?.ID || (activeDoc as any)?.objVer?.id;
      const files = (activeDoc as any)?.Files || (activeDoc as any)?.files;
      const fileId = files?.[0]?.ID || files?.[0]?.id;

      if (objId !== undefined && fileId !== undefined) {
        setIsPreviewLoading(true);
        try {
          // Instead of using getFileContent (which revokes early if we aren't careful),
          // we fetch the blob directly here to parse the page count.
          const { fetchAuthBlob } = await import('../utils/api');
          const blob = await fetchAuthBlob(`/MFilesDocs/${objId}/files/${fileId}/content`);
          
          // Try to extract page count
          const text = await blob.text();
          const matches = text.match(/\/Count\s+(\d+)/);
          const count = matches && matches[1] ? parseInt(matches[1], 10) : 1;
          setPageCount(count);

          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          currentUrl = url;
          setZoomLevel(100); // Reset zoom on new document
        } catch (err) {
          console.error("Error loading PDF preview:", err);
          setPreviewUrl(null);
        }
        setIsPreviewLoading(false);
      } else {
        setPreviewUrl(null);
      }
    }

    loadPreview();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [activeDoc, getFileContent]);

  const getFileIcon = (title: string, singleFile: boolean) => {
    if (!singleFile) return { icon: 'folder_zip', color: 'text-tertiary' };
    const ext = title.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return { icon: 'picture_as_pdf', color: 'text-error' };
      case 'xlsx':
      case 'xls':
      case 'csv': return { icon: 'table_view', color: 'text-green-600' };
      case 'doc':
      case 'docx': return { icon: 'article', color: 'text-blue-600' };
      case 'png':
      case 'jpg':
      case 'jpeg': return { icon: 'image', color: 'text-secondary' };
      default: return { icon: 'description', color: 'text-outline' };
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayoutNew isFullWidth>
      <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden w-full m-0 p-0">
        {/* Left Pane: Document List */}
        <section className="w-full md:w-[320px] lg:w-[320px] shrink-0 bg-surface-container-lowest border-r border-slate-100 flex flex-col h-full overflow-hidden">
          {/* Header Action Bar */}
          <div className="p-4 shrink-0 border-b border-surface">
            {/* <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-on-surface text-[20px] cursor-pointer">home</span>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-[20px]">grid_view</span>
                <span className="text-sm font-semibold truncate text-on-surface">Récemment ...</span>
              </div>
            </div> */}
            <div className="flex items-center justify-between border border-outline-variant/30 rounded-lg px-3 py-2 bg-white">
              <input type="text" placeholder="Rechercher dans cette v" className="text-[13px] font-medium border-none bg-transparent outline-none w-full text-on-surface placeholder:text-outline" />
              <span className="material-symbols-outlined text-[18px] text-outline-variant">search</span>
            </div>
          </div>
          
          {/* List Content */}
          <div className="flex flex-col flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <div className="px-3 py-2 border-b border-surface-container-high pb-3 mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-outline">Nom</span>
            </div>
            
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer text-on-surface">
              <span className="material-symbols-outlined text-[20px] text-primary">folder_open</span>
              <span className="text-sm font-bold tracking-tight">Documents</span>
              <span className="text-[10px] text-on-surface-variant font-bold ml-auto bg-surface px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
                {documents.length || 0}
              </span>
            </div>
            
            {/* Tree Items */}
            <div className="flex flex-col pl-4 mt-2 space-y-1 pb-4">
              {isLoading && documents.length === 0 ? (
                <div className="flex items-center justify-center p-4">
                  <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                </div>
              ) : (
                documents.map((doc: any) => {
                  const displayId = doc.DisplayID || doc.displayID || doc.displayId;
                  const title = doc.Title || doc.title || '';
                  const isActive = (activeDoc as any)?.DisplayID === displayId || (activeDoc as any)?.displayID === displayId || (activeDoc as any)?.displayId === displayId;
                  const { icon, color } = getFileIcon(title, doc.SingleFile ?? doc.singleFile);
                  
                  return (
                    <div 
                      key={displayId}
                      onClick={() => setActiveDoc(doc)}
                      className={`flex items-center gap-3 px-3 py-2 transition-colors cursor-pointer text-sm rounded-lg group ${
                        isActive 
                          ? 'bg-primary text-on-primary shadow-md hover:bg-primary-dim relative overflow-hidden' 
                          : 'hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {isActive && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                      <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-on-primary' : color}`}>{icon}</span>
                      <span className={`truncate ${isActive ? 'font-bold tracking-tight' : 'font-medium'}`}>
                        {title}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Center Pane: Preview Area */}
        <section className="flex-1 min-w-0 bg-surface flex flex-col h-full overflow-hidden">

          <div className="flex-1 p-2 overflow-hidden flex flex-col">
            <div className="flex-1 relative rounded-xs overflow-hidden shadow-editorial border border-slate-100/50 bg-[#F5F7F9] min-h-0 flex flex-col">
            {isPreviewLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-all duration-300">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary animate-pulse text-xl">picture_as_pdf</span>
                  </div>
                </div>
                <p className="mt-4 text-xs font-bold text-primary uppercase tracking-widest animate-pulse">Chargement du document...</p>
              </div>
            ) : null}

            {!activeDoc ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                 <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6 text-slate-300">
                    <span className="material-symbols-outlined text-4xl">inventory_2</span>
                 </div>
                 <h3 className="text-xl font-headline font-bold text-on-surface">Sélectionnez un document</h3>
                 <p className="text-sm text-slate-500 mt-2 max-w-xs">Choisissez un fichier dans la liste à gauche pour prévisualiser son contenu ici.</p>
              </div>
            ) : (
              <div className="flex-1 relative flex flex-col h-full overflow-auto [scrollbar-width:thin]">
                {previewUrl ? (
                  <div 
                    className="flex-1 transition-transform duration-200 ease-out origin-top"
                    style={{ 
                      transform: `scale(${zoomLevel / 100})`,
                      height: zoomLevel > 100 ? `${zoomLevel}%` : '100%',
                      width: '100%'
                    }}
                  >
                    <iframe 
                      src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                      className="w-full h-full border-none bg-white rounded-xl"
                      title="Document Preview"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
                    <div className="w-16 h-16 bg-error/5 text-error rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-3xl">error_outline</span>
                    </div>
                    <p className="text-sm font-bold text-on-surface">Aperçu non disponible</p>
                    <p className="text-xs text-slate-500 mt-1">Impossible de charger le contenu de ce fichier.</p>
                  </div>
                )}
                
                {/* PDF Overlay Controls (Floating) */}
                {previewUrl && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-on-surface/90 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl z-20">
                    <button 
                      onClick={() => setZoomLevel(prev => Math.max(prev - 10, 50))}
                      className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer text-white"
                    >
                      <span className="material-symbols-outlined text-lg">zoom_out</span>
                    </button>
                    <div className="h-4 w-px bg-white/20 mx-1"></div>
                    <span className="text-[10px] font-black text-white/90 px-3 uppercase tracking-widest whitespace-nowrap">PAGE 1 / {pageCount}</span>
                    <div className="h-4 w-px bg-white/20 mx-1"></div>
                    <button 
                      onClick={() => setZoomLevel(prev => Math.min(prev + 10, 200))}
                      className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer text-white"
                    >
                      <span className="material-symbols-outlined text-lg">zoom_in</span>
                    </button>
                    <div className="h-4 w-px bg-white/20 mx-1"></div>
                    <a 
                      href={previewUrl} 
                      download={(activeDoc as any)?.Title || (activeDoc as any)?.title || 'document.pdf'}
                      className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer text-white"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

        {/* Right Pane: Metadata Sidebar */}
        <section className="w-full md:w-[320px] lg:w-[360px] shrink-0 bg-surface-container-lowest border-l border-slate-100 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden hidden lg:block h-full relative">
          <div className="p-8 space-y-10">
            {/* Properties Section */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">File Properties</h4>
              <div className="space-y-4 shrink-0">
                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-500 shrink-0 pr-4">Name</span>
                  <span className="text-sm font-bold text-on-surface truncate">{(activeDoc as any)?.Title || (activeDoc as any)?.title || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-500 shrink-0 pr-4">Type</span>
                  <span className="text-sm font-bold text-on-surface truncate">{(activeDoc as any)?.Class !== undefined ? `Class ID: ${(activeDoc as any).Class}` : ((activeDoc as any)?.class !== undefined ? `Class ID: ${(activeDoc as any).class}` : '-')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-500 shrink-0 pr-4">Size</span>
                  <span className="text-sm font-bold text-on-surface truncate">
                    {((activeDoc as any)?.Files?.[0]?.Size || (activeDoc as any)?.files?.[0]?.size) 
                       ? formatSize((activeDoc as any)?.Files?.[0]?.Size || (activeDoc as any)?.files?.[0]?.size) 
                       : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-500 shrink-0 pr-4">Version</span>
                  <div className="flex items-center text-on-surface font-bold text-sm truncate">
                    v{(activeDoc as any)?.ObjVer?.Version || (activeDoc as any)?.objVer?.version || 1}
                  </div>
                </div>
              </div>
            </div>

            {/* Version History Section */}
            <div className="shrink-0">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Version History</h4>
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                <div className="relative pl-8">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-primary-container"></div>
                  <p className="text-sm font-bold text-on-surface truncate">v{(activeDoc as any)?.ObjVer?.Version || (activeDoc as any)?.objVer?.version || 1}.0 Finalized</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {((activeDoc as any)?.Files?.[0]?.LastModified || (activeDoc as any)?.files?.[0]?.lastModified)
                      ? new Date((activeDoc as any)?.Files?.[0]?.LastModified || (activeDoc as any)?.files?.[0]?.lastModified).toLocaleDateString() 
                      : 'Aujourd\'hui'}
                  </p>
                  <p className="text-[11px] mt-1 text-slate-400 italic">"Updated thermal specs for north wing"</p>
                </div>
                <div className="relative pl-8 shrink-0">
                  <div className="absolute left-2 top-2 w-2 h-2 rounded-full bg-slate-300"></div>
                  <p className="text-sm font-medium text-slate-700 truncate">v3.2 Draft</p>
                  <p className="text-[11px] text-slate-500 truncate">By Sarah K. • Yesterday</p>
                </div>
                <div className="relative pl-8 shrink-0">
                  <div className="absolute left-2 top-2 w-2 h-2 rounded-full bg-slate-300"></div>
                  <p className="text-sm font-medium text-slate-700 truncate">v3.0 Draft</p>
                  <p className="text-[11px] text-slate-500 truncate">By Marcus V. • Oct 10</p>
                </div>
              </div>
              <button className="mt-6 text-xs font-bold text-primary hover:underline transition-all cursor-pointer">View full timeline →</button>
            </div>

            {/* Security Section */}
            <div className="p-6 bg-surface-container-low rounded-2xl border border-slate-100 shrink-0">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Security Status</h4>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-tertiary shadow-sm shrink-0">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">End-to-End Encrypted</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">This file is protected with AES-256 and only accessible to verified team members.</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <button className="w-full py-2.5 bg-white border border-slate-200 text-on-surface rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer block">Manage Permissions</button>
                <button className="w-full py-2.5 bg-white border border-slate-200 text-on-surface rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer block">Download Audit Log</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayoutNew>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayoutNew } from '../components/layout/DashboardLayoutNew';
import { useMFilesDocsHook, type MFilesDocumentDto, type MFilesObjectPropertiesDto } from '../hooks/useMFilesDocsHook';
import { Page, Document, pdfjs } from 'react-pdf';
import { SvgIcon } from '../components/SvgIcon';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { SearchTag } from '../components/search/SearchTag';
import { MUIMenu } from '../components/MUIMenu';
import { InfoTooltip } from '../components/InfoTooltip';
import { useTranslation, Trans } from 'react-i18next'

// Initialize PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
export function ExplorerNew() {
  const { t } = useTranslation()
  const { documents, isLoading, fetchDocuments, getFileContent, getFileProperties, fetchVaultClasses } = useMFilesDocsHook();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDoc, setActiveDoc] = useState<MFilesDocumentDto | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageCount, setPageCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileProperties, setFileProperties] = useState<MFilesObjectPropertiesDto | null>(null);
  const [isPropertiesLoading, setIsPropertiesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const showSuggestions = Boolean(anchorEl);

  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    const classId = searchParams.get('class');
    fetchDocuments(classId ? parseInt(classId) : undefined);
    
    async function getCategories() {
      const data = await fetchVaultClasses();
      if (data) {
        setCategories(data);
        // If there's a classId in URL, set the selected category object for the UI
        if (classId) {
          const matched = data.find(c => String(c.id) === classId);
          if (matched) {
            setSelectedCategory({ id: matched.id, label: matched.name });
          }
        }
      }
    }
    getCategories();
  }, [fetchDocuments, fetchVaultClasses]); // We don't include searchParams here to avoid infinite loops, we just want initial load

  useEffect(() => {
    if (documents.length > 0) {
      const urlObjectId = searchParams.get('oid');
      const urlFileId = searchParams.get('fid');

      if (urlObjectId && urlFileId) {
        const foundDoc = documents.find((doc: any) => {
          const docObjId = String(doc.ObjVer?.ID || doc.objVer?.id);
          const files = doc.Files || doc.files || [];
          const docFileId = String(files?.[0]?.ID || files?.[0]?.id);
          return docObjId === urlObjectId && docFileId === urlFileId;
        });

        if (foundDoc && foundDoc !== activeDoc) {
          setActiveDoc(foundDoc);
        }
      }
    }
  }, [documents, searchParams, activeDoc]);

  const handleRowClick = (doc: any) => {
    const objId = String(doc.ObjVer?.ID || doc.objVer?.id);
    const files = doc.Files || doc.files || [];
    if (files.length > 0) {
      const fileId = String(files[0].ID || files[0].id);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('oid', objId);
      newParams.set('fid', fileId);
      setSearchParams(newParams, { replace: true });
    }
    setActiveDoc(doc);
  };

  useEffect(() => {
    async function loadProperties() {
      if (!activeDoc) {
        setFileProperties(null);
        return;
      }
      
      const objId = (activeDoc as any)?.ObjVer?.ID || (activeDoc as any)?.objVer?.id;
      if (objId !== undefined) {
        setIsPropertiesLoading(true);
        try {
          const data = await getFileProperties(objId);
          setFileProperties(data || null);
        } catch (error) {
          console.error("Error fetching properties:", error);
          setFileProperties(null);
        } finally {
          setIsPropertiesLoading(false);
        }
      }
    }
    
    loadProperties();
  }, [activeDoc, getFileProperties]);

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
          const { fetchAuthBlob } = await import('../utils/api');
          const blob = await fetchAuthBlob(`/MFilesDocs/${objId}/files/${fileId}/content`);
          
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          currentUrl = url;
          setZoomLevel(70);
        } catch (err) {
          console.error("Error loading PDF preview:", err);
          setPreviewUrl(null);
        }
        // setIsPreviewLoading(false) will be handled by react-pdf onLoadSuccess or we wait a bit
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
    if (!bytes || bytes === 0) return t('bytesB', '0 B', { bytes: 0 });
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    
    if (i === 0) return t('bytesB', '{{bytes}} B', { bytes: val });
    if (i === 1) return t('valKb', '{{val}} KB', { val });
    if (i === 2) return t('valMb', '{{val}} MB', { val });
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    return val + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter((doc: any) => {
    const rawTitle = (doc.Title || doc.title || '').toLowerCase();
    return rawTitle.includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayoutNew isFullWidth>
      <div className="flex flex-col md:flex-row h-full overflow-hidden w-full m-0 p-0 ">
        {/* Left Pane: Document List */}
        <section className="w-full pt-2  md:w-[320px] lg:w-[350px] shrink-0 bg-white border-r border-slate-100 flex flex-col h-full overflow-hidden">
          {/* Header Action Bar */}
          <div className="p-4 pt-0 shrink-0 border-b border-surface">
            <div className="flex items-center gap-2">
              <div className={`flex-1 flex items-center bg-white border rounded-xl px-2 py-1 transition-all relative ${showSuggestions ? 'ring-2 ring-primary/20 border-primary shadow-lg' : 'border-outline-variant/30 hover:border-outline-variant/60 shadow-sm'}`}>
                <InfoTooltip 
                  header="Conseils de recherche"
                  items={[
                    <><Trans i18nKey="tapezLeStrongnomDuFichierstrongPourFiltrerParTitre">Tapez le <strong>nom du fichier</strong> pour filtrer par titre.</Trans></>,
                    <><Trans i18nKey="tapezStrongstrongPourChoisirUneStrongcatgoriestrong">Tapez <strong>'/'</strong> pour choisir une <strong>catégorie</strong>.</Trans></>
                  ]}
                  footer="Vous pouvez combiner : si une catégorie est active, la recherche s'applique uniquement à celle-ci."
                  placement="top-start"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline-variant shrink-0 mr-3 cursor-help">search</span>
                </InfoTooltip>
                
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                  {selectedCategory && (
                    <SearchTag 
                      label={selectedCategory.label} 
                        onRemove={() => {
                          setSelectedCategory(null);
                          const newParams = new URLSearchParams(searchParams);
                          newParams.delete('class');
                          newParams.delete('oid');
                          newParams.delete('fid');
                          setSearchParams(newParams, { replace: true });
                          setActiveDoc(null);
                          setPreviewUrl(null);
                          fetchDocuments();
                        }}
                    />
                  )}
                  
                  <input 
                    type="text" 
                    placeholder={selectedCategory ? t('searchWithinCategory', 'Search within category...') : t('searchByNameOrTypeForCategories', 'Search by name or type \'/\' for categories...')} 
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      if (val.endsWith('/')) {
                        setAnchorEl(e.currentTarget.parentElement);
                      } else if (showSuggestions) {
                        setAnchorEl(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && searchQuery === '' && selectedCategory) {
                        setSelectedCategory(null);
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('class');
                        newParams.delete('oid');
                        newParams.delete('fid');
                        setSearchParams(newParams, { replace: true });
                        setActiveDoc(null);
                        setPreviewUrl(null);
                        fetchDocuments();
                      }
                      if (e.key === 'Escape') {
                        setAnchorEl(null);
                      }
                    }}
                    className="flex-1 text-[13px] font-medium border-none bg-transparent outline-none py-1 text-on-surface placeholder:text-outline-variant/60 min-w-[50px]" 
                  />
                </div>

                {/* {showSuggestions && (
                  <div className="shrink-0 flex items-center justify-center px-1.5 py-0.5 rounded-md bg-surface-container-high border border-outline-variant/30 text-[9px] font-black text-outline uppercase tracking-widest ml-2 animate-in fade-in duration-300">
                    ESC
                  </div>
                )} */}

                <MUIMenu 
                  anchorEl={anchorEl}
                  isOpen={showSuggestions}
                  onClose={() => setAnchorEl(null)}
                  variant="light"
                  align="left"
                  width="100%"
                  items={categories.map(cat => ({
                    label: cat.name,
                    onClick: () => {
                      setSelectedCategory({ id: cat.id, label: cat.name });
                      setSearchQuery(prev => prev.replace('/', ''));
                      setAnchorEl(null);
                      
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('class', String(cat.id));
                      newParams.delete('oid');
                      newParams.delete('fid');
                      setSearchParams(newParams, { replace: true });
                      
                      setActiveDoc(null);
                      setPreviewUrl(null);
                      fetchDocuments(cat.id);
                    }
                  }))}
                />
              </div>
              <button 
                onClick={() => {
                  const classId = searchParams.get('class');
                  fetchDocuments(classId ? parseInt(classId) : undefined);
                }}
                disabled={isLoading}
                className="shrink-0 w-9 h-9 flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                title={t('refreshList', 'Refresh list')}
              >
                <span className={`material-symbols-outlined text-[18px] transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`}>sync</span>
              </button>
            </div>
          </div>
          
          {/* List Content */}
          <div className="flex-1 overflow-x-auto overflow-y-auto w-full [scrollbar-width:thin]">
            <table className="w-full min-w-max text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-lowest z-10 shadow-sm border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400 whitespace-nowrap">{t('name', 'Name')}</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400 whitespace-nowrap cursor-pointer hover:text-slate-600 transition-colors">{t('creationSpanClassnamematerialsymbolsoutlinedText12pxAlignmiddleMl1unfold_morespan')}</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400 whitespace-nowrap cursor-pointer hover:text-slate-600 transition-colors">{t('modifiedSpanClassnamematerialsymbolsoutlinedText12pxAlignmiddleMl1arrow_drop_downspan')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading && documents.length === 0 ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse border-b border-slate-50">
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="w-[18px] h-[18px] rounded bg-slate-200/70 shrink-0"></div>
                          <div className="h-3.5 bg-slate-200/70 rounded w-full max-w-[140px]" style={{ width: `${Math.random() * 40 + 40}%` }}></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3 bg-slate-200/70 rounded w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3 bg-slate-200/70 rounded w-16"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <SvgIcon name="SearchFile" width={64} height={64} className="text-slate-300 mb-4 opacity-60" />
                        <p className="text-sm font-bold text-on-surface">{t('noDocumentsFound', 'No documents found')}</p>
                        <p className="text-xs mt-2 text-slate-500 max-w-xs text-center">
                          {searchQuery 
                            ? t('noFilesMatchYourSearchSearchquery', 'No files match your search "{{searchQuery}}".', { searchQuery }) 
                            : t('noFilesAreAvailable', 'No files are available.')}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc: any) => {
                    const displayId = doc.DisplayID || doc.displayID || doc.displayId;
                    const rawTitle = doc.Title || doc.title || '';
                    const files = doc.Files || doc.files || [];
                    const firstFile = files[0];
                    
                    const ext = (firstFile?.Extension || firstFile?.extension || '').toLowerCase();
                    const createdStr = firstFile?.CreatedUtc || firstFile?.createdUtc || (doc as any)?.Created || '';
                    const modifiedStr = firstFile?.LastModified || firstFile?.lastModified || (doc as any)?.LastModified || '';
                    
                    const createdDate = createdStr ? new Date(createdStr).toLocaleDateString() : '-';
                    const modifiedDate = modifiedStr ? new Date(modifiedStr).toLocaleDateString() : '-';
                    
                    let title = rawTitle;
                    if (ext && !rawTitle.toLowerCase().endsWith(`.${ext}`)) {
                      title = t('rawtitleext', '{{rawTitle}}.{{ext}}', { rawTitle, ext });
                    }
                    
                    const isActive = (activeDoc as any)?.DisplayID === displayId || (activeDoc as any)?.displayID === displayId || (activeDoc as any)?.displayId === displayId;
                    const { icon, color } = getFileIcon(title, doc.SingleFile ?? doc.singleFile);
                    
                    return (
                      <tr 
                        key={displayId}
                        onClick={() => handleRowClick(doc)}
                        className={`group cursor-pointer transition-colors ${
                          isActive 
                            ? 'bg-primary/5 hover:bg-primary/10 relative overflow-hidden'
                            : 'hover:bg-surface-container-high'
                        }`}
                      >
                        <td className="px-4 py-3 max-w-[200px]">
                          {isActive && <div className="absolute inset-y-0 left-0 w-1 bg-primary"></div>}
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined text-[18px] shrink-0 ${isActive ? 'text-primary' : color}`}>{icon}</span>
                            <span className={`truncate text-sm ${isActive ? 'font-bold text-primary tracking-tight' : 'font-medium text-on-surface'}`} title={title}>
                              {title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                          {createdDate}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                          {modifiedDate}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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
                <p className="mt-4 text-xs font-bold text-primary uppercase tracking-widest animate-pulse">{t('loadingDocument', 'Loading document...')}</p>
              </div>
            ) : null}

            {!activeDoc ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                 <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6 text-slate-300">
                    <span className="material-symbols-outlined text-4xl">inventory_2</span>
                 </div>
                 <h3 className="text-xl font-headline font-bold text-on-surface">{t('selectAFile', 'Select a file')}</h3>
                 <p className="text-sm text-slate-500 mt-2 max-w-xs">{t('chooseAFileFromTheListOnTheLeftToPreviewItsContentHere', 'Choose a file from the list on the left to preview its content here.')}</p>
              </div>
            ) : (
              <div id="pdf-preview-container" className="flex-1 relative h-full bg-[#F5F7F9]">
                {/* Scrollable Container */}
                <div className="absolute inset-0 overflow-auto [scrollbar-width:thin] text-center whitespace-nowrap p-4">
                  {/* Pseudo-element for vertical centering */}
                  <span className="inline-block h-full align-middle"></span>
                  
                  {previewUrl ? (
                    <div className="inline-block align-middle text-left" style={{ minWidth: 'min-content' }}>
                      <Document
                        file={previewUrl}
                        onLoadSuccess={({ numPages }) => {
                          setPageCount(typeof numPages === 'number' ? numPages : 0);
                          setIsPreviewLoading(false);
                        }}
                        onLoadError={() => setIsPreviewLoading(false)}
                        loading={null}
                      >
                        <div className="flex flex-col gap-6 align-middle transition-transform duration-200">
                          {Array.from({ length: Number.isFinite(pageCount) ? pageCount : 0 }).map((_, index) => (
                            <div key={`page_${index + 1}`} className="bg-white shadow-xl">
                              <Page 
                                pageNumber={index + 1} 
                                scale={zoomLevel / 100}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                loading={
                                  <div className="flex items-center justify-center p-20 text-slate-400"><Trans i18nKey="spanClassnamematerialsymbolsoutlinedAnimatespinMr2syncspanRenderingPage"><span className="material-symbols-outlined animate-spin mr-2">sync</span>
                                    Rendering page</Trans>{index + 1}{t('key', '...')}
                                  </div>
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </Document>
                    </div>
                  ) : (
                    <div className="inline-flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-slate-100 max-w-sm align-middle">
                      <div className="w-16 h-16 bg-error/5 text-error rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl">error_outline</span>
                      </div>
                      <p className="text-sm font-bold text-on-surface">{t('previewUnavailable', 'Preview unavailable')}</p>
                      <p className="text-xs text-slate-500 mt-1">{t('unableToLoadTheContentOfThisFile', 'Unable to load the content of this file.')}</p>
                    </div>
                  )}
                </div>
                
                {/* PDF Overlay Controls (Floating) */}
                {previewUrl && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-on-surface/60 backdrop-blur-xs  px-4 py-1 rounded-full border border-white/10 shadow-2xl z-20">
                    

                    <span className="text-[10px] font-black text-center text-white/90 px-2 uppercase tracking-widest whitespace-nowrap">{t('pagecountPage', '{{pageCount}} PAGE', { pageCount })}{pageCount > 1 ? 'S' : ''}
                    </span>
                    
                    <div className="h-4 w-px bg-white/20 mx-1"></div>
                    
                    <button 
                      onClick={() => setZoomLevel(prev => Math.max(prev - 20, 50))}
                      className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer text-white"
                    >
                      <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                    </button>
                    
                    {/* <div className="h-4 w-px bg-white/20 mx-1"></div> */}
                    
                    <button 
                      onClick={() => setZoomLevel(prev => Math.min(prev + 10, 200))}
                      className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer text-white"
                    >
                      <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                    </button>
                    
                    <div className="h-4 w-px bg-white/20 mx-1"></div>
                    
                    <button 
                      onClick={() => {
                        const elem = document.getElementById('pdf-preview-container');
                        if (!document.fullscreenElement) {
                          elem?.requestFullscreen().catch(() => {});
                        } else {
                          document.exitFullscreen().catch(() => {});
                        }
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer text-white"
                    >
                      <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                    </button>
                    
                    <div className="h-4 w-px bg-white/20 mx-1"></div>
                    
                    <a 
                      href={previewUrl} 
                      download={(activeDoc as any)?.Title || (activeDoc as any)?.title || 'document.pdf'}
                      className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer text-white"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

        {/* Right Pane: Metadata Sidebar */}
        <section className="w-full md:w-[320px] lg:w-[360px] shrink-0 bg-white border-l border-slate-100 hidden lg:flex flex-col h-full relative overflow-hidden">
          {!activeDoc ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-4 opacity-50">info</span>
              <p className="text-sm font-bold text-on-surface">{t('noFileSelected', 'No file selected')}</p>
              <p className="text-xs mt-2 max-w-[200px]">{t('selectAFileToViewItsProperties', 'Select a file to view its properties.')}</p>
            </div>
          ) : (
          <div className="p-8 pr-3 flex flex-col h-full overflow-hidden">
            {/* Properties Section */}
            <div className="flex flex-col h-full min-h-0">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 shrink-0">{t('fileProperties', 'File Properties')}</h4>
              <div className="space-y-4 overflow-y-auto pr-2 pb-4 [scrollbar-width:thin]">
                {isPropertiesLoading ? (
                   <div className="flex flex-col space-y-4 animate-pulse">
                     <div className="h-4 bg-slate-200/50 rounded w-full"></div>
                     <div className="h-4 bg-slate-200/50 rounded w-3/4"></div>
                     <div className="h-4 bg-slate-200/50 rounded w-full"></div>
                     <div className="h-4 bg-slate-200/50 rounded w-5/6"></div>
                   </div>
                ) : fileProperties && (fileProperties.className || (fileProperties.properties && fileProperties.properties.length > 0)) ? (
                   <>
                     {fileProperties.className && (
                        <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center pb-3 border-b border-gray-100 gap-1">
                          <span className="text-[13px] font-medium self-start text-slate-500 shrink-0 pr-4">{t('category', 'Category')}</span>
                          <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-black rounded uppercase tracking-widest border border-outline-variant/20">
                            {fileProperties.className}
                          </span>
                        </div>
                     )}
                     {fileProperties.properties && Array.isArray(fileProperties.properties) && fileProperties.properties.map((propObj, index) => {
                       const key = Object.keys(propObj)[0];
                       const propData = propObj[key];
                       const value = propData?.value;
                       const displayKey = t(key.toLowerCase(), key);
                       
                       return (
                         <div key={index} className="flex flex-col xl:flex-row xl:justify-between xl:items-center pb-3 border-b border-gray-100 gap-1">
                           <span className="text-[13px] font-medium self-start text-slate-500 shrink-0 pr-4">{displayKey}</span>
                           <span className="text-xs font-light text-on-surface xl:text-right" title={String(value)}>
                             {String(value) || '-'}
                           </span>
                         </div>
                       );
                     })}
                   </>
                ) : (
                  <>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500 shrink-0 pr-4">{t('name', 'Name')}</span>
                      <span className="text-sm font-bold text-on-surface truncate">{(activeDoc as any)?.Title || (activeDoc as any)?.title || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500 shrink-0 pr-4">{t('type', 'Type')}</span>
                      <span className="text-sm font-bold text-on-surface truncate">{(activeDoc as any)?.Class !== undefined ? t('classIdClass', 'Class ID: {{Class}}', { Class: (activeDoc as any).Class }) : ((activeDoc as any)?.class !== undefined ? t('classIdClass2', 'Class ID: {{class}}', { class: (activeDoc as any).class }) : '-')}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500 shrink-0 pr-4">{t('size', 'Size')}</span>
                      <span className="text-sm font-bold text-on-surface truncate">
                        {((activeDoc as any)?.Files?.[0]?.Size || (activeDoc as any)?.files?.[0]?.size) 
                           ? formatSize((activeDoc as any)?.Files?.[0]?.Size || (activeDoc as any)?.files?.[0]?.size) 
                           : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500 shrink-0 pr-4">{t('version', 'Version')}</span>
                      <div className="flex items-center text-on-surface font-bold text-sm truncate">
                        v{(activeDoc as any)?.ObjVer?.Version || (activeDoc as any)?.objVer?.version || 1}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Version History Section */}
            {/* <div className="shrink-0">
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
            </div> */}

            {/* Security Section */}
            {/* <div className="p-6 bg-surface-container-low rounded-2xl border border-slate-100 shrink-0">
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
            </div> */}
          </div>
          )}
        </section>
      </div>
    </DashboardLayoutNew>
  );
}

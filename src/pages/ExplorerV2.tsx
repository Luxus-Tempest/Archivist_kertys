import { useState, useEffect } from 'react';
import { DashboardLayoutNew } from '../components/layout/DashboardLayoutNew';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  DocumentDetailDrawer,
  type DocItem,
} from '../components/explorer/DocumentDetailDrawer';
import { useMetadata } from '../hooks/useMetadata';

const STATS = [
  { label: 'Docs', value: 19 },
  { label: 'Invoices', value: 48 },
  { label: 'Reports', value: '07' },
  { label: 'Purchase Orders', value: 21 },
  { label: 'Requisitions', value: 18 }
];

export function ExplorerV2() {
  const [activeDoc, setActiveDoc] = useState<DocItem | null>(null);
  const [nav, setNav] = useState('all');
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [sortDir, setSortDir] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const [isDeptCollapsed, setIsDeptCollapsed] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [toast, setToast] = useState<{msg: string, id: number} | null>(null);

  // Context menu state
  const [ctxMenu, setCtxMenu] = useState<{ x: number, y: number, docId: string | number } | null>(null);

  const {
    classes,
    documents: apiDocs,
    fetchClasses,
    fetchClassDocuments,
  } = useMetadata();

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    const matchedClass = classes.data.find(c => c.technicalName.toLowerCase() === nav.toLowerCase());
    if (matchedClass) {
      fetchClassDocuments(matchedClass.technicalName, { offset: 0, limit: 50 });
    }
  }, [nav, classes.data, fetchClassDocuments]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setCtxMenu(null);
      setFilterMenuOpen(false);
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const showToast = (msg: string) => {
    setToast({ msg, id: Date.now() });
    setTimeout(() => setToast(current => current?.id === toast?.id ? null : current), 2500);
  };

  const handleNav = (id: string) => {
    setNav(id);
    setTab('all');
    setSelected(new Set());
    setCurrentPage(1);
  };

  const handleTab = (id: string) => {
    setTab(id);
    setCurrentPage(1);
  };

  const handleSort = (col: string) => {
    if (sort === col) setSortDir(prev => prev * -1);
    else {
      setSort(col);
      setSortDir(1);
    }
  };

  const cycleSort = () => {
    const cols = ['date', 'name', 'type', 'status'];
    const idx = cols.indexOf(sort);
    const next = cols[(idx + 1) % cols.length];
    handleSort(next);
  };

  const addFilter = (f: string) => {
    if (!filters.includes(f)) setFilters([...filters, f]);
    setCurrentPage(1);
  };

  const removeFilter = (f: string) => {
    setFilters(filters.filter(x => x !== f));
    setCurrentPage(1);
  };

  const toggleSelectAll = (checked: boolean, pageDocs: DocItem[]) => {
    if (checked) {
      const newSel = new Set(selected);
      pageDocs.forEach(d => newSel.add(String(d.id)));
      setSelected(newSel);
    } else {
      setSelected(new Set());
    }
  };

  const toggleDoc = (id: string | number) => {
    const newSel = new Set(selected);
    const idStr = String(id);
    if (newSel.has(idStr)) newSel.delete(idStr);
    else newSel.add(idStr);
    setSelected(newSel);
  };

  const bulkAction = (action: string) => {
    const n = selected.size;
    if (action === 'delete') {
      showToast(`${n} item${n > 1 ? 's' : ''} supprimé(s)`);
      setSelected(new Set());
    }
    else if (action === 'share') showToast(`Partage de ${n} item(s)`);
    else if (action === 'download') showToast(`Téléchargement de ${n} item(s)`);
  };

  const handleCtxAction = (action: string) => {
    if (!ctxMenu) return;
    showToast(`Action "${action}" exécutée`);
    setCtxMenu(null);
  };

  const onContextMenu = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, docId: id });
  };

  // Build filtered docs
  let filtered: DocItem[] = [];
  const matchedClass = classes.data.find(c => c.technicalName.toLowerCase() === nav.toLowerCase());

  if (matchedClass) {
    filtered = (apiDocs.data || []).map((doc): DocItem => {
      const isPdf = doc.extension?.toLowerCase() === 'pdf';
      const isDoc = ['doc', 'docx'].includes(doc.extension?.toLowerCase());
      return {
        id: doc.documentId as any,
        name: doc.originalFileName,
        type: doc.extension?.toUpperCase() || 'FILE',
        status: '',
        author: 'Système',
        authorImg: 'https://i.pravatar.cc/150?img=9',
        shared: 0,
        date: doc.updatedAt?.split('T')[0] || '',
        rawDate: doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '',
        isFolder: false,
        isPdf,
        isDoc,
        dept: matchedClass.technicalName,
        fav: false,
        docId: doc.documentId,
        size: doc.fileSize,
        tags: [matchedClass.name],
        reminder: null,
        retention: 'Infinity',
        protection: 'Unlocked',
      };
    });
  } else {
    // Show classes list as folders
    filtered = (classes.data || []).map((cls): DocItem => ({
      id: `class-${cls.id}` as any,
      name: cls.name,
      type: 'Folder',
      status: '',
      author: 'Système',
      authorImg: 'https://i.pravatar.cc/150?img=9',
      shared: 0,
      date: '',
      rawDate: '',
      isFolder: true,
      isPdf: false,
      isDoc: false,
      dept: cls.technicalName,
      fav: false,
      docId: `class-${cls.technicalName}`,
      size: null,
      tags: ['Class'],
      reminder: null,
      retention: 'Infinity',
      protection: 'Unlocked',
    }));
  }

  // Client-side filtering & sorting
  if (tab === 'folders') filtered = filtered.filter(d => d.isFolder);
  else if (tab === 'docs') filtered = filtered.filter(d => d.isDoc || d.isPdf);

  if (search) {
    const sl = search.toLowerCase();
    filtered = filtered.filter(d => d.name.toLowerCase().includes(sl) || d.type.toLowerCase().includes(sl) || d.author.toLowerCase().includes(sl));
  }

  filters.forEach(f => {
    if (f === 'Folder') filtered = filtered.filter(d => d.isFolder);
    else if (f === 'PDF') filtered = filtered.filter(d => d.isPdf);
    else if (f === 'Doc') filtered = filtered.filter(d => d.isDoc);
  });

  const sortMap: Record<string, keyof DocItem> = { name: 'name', type: 'type', date: 'date' };
  if (sortMap[sort]) {
    filtered.sort((a, b) => {
      const va = String(a[sortMap[sort]] || '');
      const vb = String(b[sortMap[sort]] || '');
      return va.localeCompare(vb) * sortDir;
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (currentPage - 1) * perPage;
  const paginatedDocs = filtered.slice(start, start + perPage);

  const allSel = paginatedDocs.length > 0 && paginatedDocs.every(d => selected.has(String(d.id)));
  const someSel = paginatedDocs.some(d => selected.has(String(d.id)));

  const navItemClass = (id: string) =>
    `flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] cursor-pointer transition-colors select-none ${nav === id
      ? 'bg-blue-thin text-blue-dark font-semibold'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
    }`;

  const subItemClass = (id: string) =>
    `flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors select-none ${nav === id
      ? 'text-blue-dark font-semibold'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`;

  const tabClassStyle = (id: string) =>
    `px-3 py-1 text-xs rounded-full cursor-pointer transition-colors select-none ${tab === id
      ? 'bg-blue-thin text-blue-dark font-semibold'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`;

  const sortLabelMap: Record<string, string> = { date: 'Last modified', name: 'Name', type: 'Type', status: 'Status' };

  const getStatusStyle = (status: string) => {
    if (status === 'Pending') return 'bg-amber-50 text-amber-800 border-amber-300';
    if (status === 'Revision') return 'bg-orange-50 text-orange-800 border-orange-300';
    if (status === 'Requisition') return 'bg-blue-50 text-blue-900 border-blue-300';
    if (status === 'Approved') return 'bg-green-50 text-green-900 border-green-400';
    if (status === 'Rejected') return 'bg-red-50 text-red-900 border-red-300';
    return '';
  };

  return (
    <DashboardLayoutNew isFullWidth isChildPaddingBottom={false}>
      <div className="flex h-full w-full bg-white font-body -mb-16 border border-slate-200 rounded-lg overflow-hidden relative">

        {/* SIDEBAR */}
        <aside className="w-[240px] min-w-[240px] border-r border-slate-200 flex flex-col bg-slate-50 overflow-y-auto [scrollbar-width:thin]">
          <div className="p-2">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-2 py-2">Documents</div>
            <div onClick={() => handleNav('all')} className={navItemClass('all')}><GridViewRoundedIcon sx={{ fontSize: 16 }} /> All</div>
            <div onClick={() => handleNav('my')} className={navItemClass('my')}><FolderRoundedIcon sx={{ fontSize: 16 }} /> My Files</div>
          </div>

          <div className="h-px bg-slate-200 mx-2 my-1" />

          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-2 cursor-pointer select-none group" onClick={() => setIsDeptCollapsed(!isDeptCollapsed)}>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">By Class</span>
              <KeyboardArrowRightRoundedIcon sx={{ fontSize: 14 }} className={`text-slate-400 transition-transform duration-200 ${!isDeptCollapsed ? 'rotate-90' : ''}`} />
            </div>
            <div className={`pl-2 border-l-2 border-slate-200 ml-5 mr-2 overflow-hidden transition-all duration-200 ${isDeptCollapsed ? 'max-h-0 opacity-0' : 'max-h-[300px] opacity-100'}`}>
              {classes.isLoading ? (
                <div className="text-xs text-slate-400 p-2">Chargement...</div>
              ) : (
                classes.data.map(cls => (
                  <div key={cls.id} onClick={() => handleNav(cls.technicalName)} className={subItemClass(cls.technicalName)}>
                    <FolderRoundedIcon className="text-blue-500" sx={{ fontSize: 14 }} />
                    <span className="truncate">{cls.name}</span>
                    <span className="ml-auto bg-blue-thin text-blue-dark text-[9px] px-1.5 rounded font-bold leading-none py-0.5">{cls.totalRecords}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">

          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3 mb-3.5">
              {/* <div className="w-10 h-10 rounded-lg bg-blue-thin flex items-center justify-center text-lg font-medium text-blue-dark shrink-0">G</div>
              <div>
                <div className="text-base font-medium text-slate-900">Greaper</div>
                <div className="text-xs text-slate-500 mt-0.5">Joseph Tony Rozario</div>
              </div> */}
              {/* <div className="ml-auto flex gap-1.5">
                <button className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-thin text-blue-dark text-xs rounded-md border border-transparent hover:opacity-90 font-medium transition-opacity" onClick={() => showToast('New document created')}>
                  <AddRoundedIcon sx={{ fontSize: 14 }} /> New document
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-slate-600 text-xs rounded-md border border-slate-300 hover:bg-slate-50 hover:text-slate-800 font-medium transition-colors" onClick={() => showToast('Upload dialog opened')}>
                  <UploadRoundedIcon sx={{ fontSize: 14 }} /> Upload
                </button>
              </div> */}
            </div>
            <div className="flex items-center">
              {STATS.map((s, idx) => (
                <div key={s.label} className={`flex flex-col pr-5 mr-5 ${idx < STATS.length - 1 ? 'border-r border-slate-200' : ''}`}>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-0.5">{s.label}</span>
                  <span className="text-[22px] font-medium text-blue-dark">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-5 py-2 border-b border-slate-200 flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex-1 min-w-[200px] flex items-center gap-1.5 bg-white border border-slate-300 rounded-md px-2.5 h-8 focus-within:border-blue-400 transition-colors">
              <SearchRoundedIcon sx={{ fontSize: 14 }} className="text-slate-400 shrink-0" />
              <input type="text" className="w-full bg-transparent border-none outline-none text-[12.5px] text-slate-800 placeholder:text-slate-400 font-body" placeholder="Search documents..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {filters.map(f => (
                <div key={f} className="flex items-center gap-1 bg-blue-thin text-blue-dark px-2 py-1 rounded text-[11.5px] font-medium cursor-pointer hover:opacity-90 transition-opacity" onClick={() => removeFilter(f)}>
                  {f} <CloseRoundedIcon sx={{ fontSize: 12 }} />
                </div>
              ))}
            </div>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-slate-600 text-xs rounded-md border border-slate-300 hover:bg-slate-50 font-medium transition-colors" onClick={() => setFilterMenuOpen(!filterMenuOpen)}>
                <FilterListRoundedIcon sx={{ fontSize: 14 }} /> Filter
              </button>

              {filterMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-1.5 z-50 min-w-[150px]">
                  <div className="text-[11px] text-slate-400 font-medium px-2 pt-1 pb-1.5">Filter by type</div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => addFilter('Folder')}><FolderRoundedIcon sx={{ fontSize: 14 }} /> Folder</div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => addFilter('PDF')}><PictureAsPdfRoundedIcon sx={{ fontSize: 14 }} /> PDF / Requisition</div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => addFilter('Doc')}><DescriptionRoundedIcon sx={{ fontSize: 14 }} /> Document</div>
                  <div className="h-px bg-slate-200 my-1"></div>
                  <div className="text-[11px] text-slate-400 font-medium px-2 pt-1 pb-1.5">Filter by status</div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => addFilter('Approved')}><CheckCircleRoundedIcon className="text-green-600" sx={{ fontSize: 14 }} /> Approved</div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => addFilter('Pending')}><AccessTimeRoundedIcon className="text-amber-600" sx={{ fontSize: 14 }} /> Pending</div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => addFilter('Rejected')}><CancelOutlinedIcon className="text-red-500" sx={{ fontSize: 14 }} /> Rejected</div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs Row */}
          <div className="px-5 border-b border-slate-200 flex items-center justify-between shrink-0 h-[38px]">
            <div className="flex gap-0.5 h-full items-center">
              <div onClick={() => handleTab('all')} className={tabClassStyle('all')}>All</div>
              <div onClick={() => handleTab('folders')} className={tabClassStyle('folders')}>Folders</div>
              <div onClick={() => handleTab('docs')} className={tabClassStyle('docs')}>Documents</div>
              <div onClick={() => handleTab('pending')} className={tabClassStyle('pending')}>Pending approval</div>
            </div>
            <div className="flex items-center gap-1 text-[12px] text-slate-500 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded transition-colors" onClick={cycleSort}>
              <UnfoldMoreRoundedIcon sx={{ fontSize: 13 }} />
              <span className="select-none">{sortLabelMap[sort]}</span>
              <KeyboardArrowDownRoundedIcon sx={{ fontSize: 11 }} />
            </div>
          </div>

          {/* Selection Bar */}
          <div className={`flex items-center gap-2.5 px-5 py-1.5 bg-blue-thin border-b border-blue-200 shrink-0 transition-all overflow-hidden ${selected.size > 0 ? 'h-auto opacity-100' : 'h-0 opacity-0 border-none py-0'}`}>
            <CheckBoxRoundedIcon sx={{ fontSize: 15 }} className="text-blue-dark" />
            <span className="text-[12.5px] font-medium text-blue-dark">{selected.size} selected</span>
            <div className="ml-auto flex gap-1.5">
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-600 text-xs hover:bg-slate-50 transition-colors" onClick={() => bulkAction('share')}><ShareRoundedIcon sx={{ fontSize: 14 }} /> Share</button>
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-600 text-xs hover:bg-slate-50 transition-colors" onClick={() => bulkAction('download')}><DownloadRoundedIcon sx={{ fontSize: 14 }} /> Download</button>
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-red-600 text-xs hover:bg-slate-50 transition-colors" onClick={() => bulkAction('delete')}><DeleteRoundedIcon sx={{ fontSize: 14 }} /> Delete</button>
              <button className="flex items-center justify-center p-1 rounded-md bg-transparent border border-transparent text-slate-500 hover:bg-slate-200/50 transition-colors ml-1" onClick={() => setSelected(new Set())}><CloseRoundedIcon sx={{ fontSize: 14 }} /></button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
            <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 bg-slate-50 z-[2]">
                <tr className="border-b border-slate-200">
                  <th className="w-[36px] pl-4 py-[9px]"><input type="checkbox" className="w-[15px] h-[15px] rounded-[3px] border-slate-300 cursor-pointer accent-blue-500 block" checked={allSel} ref={el => { if (el) el.indeterminate = someSel && !allSel; }} onChange={(e) => toggleSelectAll(e.target.checked, paginatedDocs)} /></th>
                  <th className="w-[200px] py-[9px] px-2.5 text-[10px] font-medium text-slate-400 uppercase tracking-widest cursor-pointer select-none hover:text-slate-800 transition-colors" onClick={() => handleSort('name')}>Name <UnfoldMoreRoundedIcon sx={{ fontSize: 11, verticalAlign: '-1px' }} /></th>
                  <th className="w-[120px] py-[9px] px-2.5 text-[10px] font-medium text-slate-400 uppercase tracking-widest cursor-pointer select-none hover:text-slate-800 transition-colors" onClick={() => handleSort('type')}>Type <UnfoldMoreRoundedIcon sx={{ fontSize: 11, verticalAlign: '-1px' }} /></th>
                  <th className="w-[90px] py-[9px] px-2.5 text-[10px] font-medium text-slate-400 uppercase tracking-widest cursor-pointer select-none hover:text-slate-800 transition-colors" onClick={() => handleSort('status')}>Status <UnfoldMoreRoundedIcon sx={{ fontSize: 11, verticalAlign: '-1px' }} /></th>
                  <th className="w-[110px] py-[9px] px-2.5 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Author</th>
                  <th className="w-[90px] py-[9px] px-2.5 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Shared</th>
                  <th className="w-[120px] py-[9px] px-2.5 text-[10px] font-medium text-slate-400 uppercase tracking-widest cursor-pointer select-none hover:text-slate-800 transition-colors" onClick={() => handleSort('date')}>Modified <UnfoldMoreRoundedIcon sx={{ fontSize: 11, verticalAlign: '-1px' }} /></th>
                  <th className="w-[40px] py-[9px] px-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {classes.isLoading || apiDocs.isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-slate-200">
                      <td className="pl-4 py-2.5"><div className="w-4 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-2.5 py-2.5"><div className="w-24 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-2.5 py-2.5"><div className="w-16 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-2.5 py-2.5"><div className="w-12 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-2.5 py-2.5"><div className="w-20 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-2.5 py-2.5"><div className="w-12 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-2.5 py-2.5"><div className="w-20 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-2.5 py-2.5"></td>
                    </tr>
                  ))
                ) : paginatedDocs.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                        <CancelOutlinedIcon sx={{ fontSize: 32, mb: 1 }} />
                        <span>Aucun document ne correspond à votre recherche</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDocs.map(doc => {
                    const sel = selected.has(String(doc.id));
                    return (
                      <tr
                        key={doc.id}
                        className={`border-b border-slate-200 cursor-pointer transition-colors ${sel ? 'bg-blue-thin' : 'hover:bg-slate-50'}`}
                        onClick={() => {
                          if (doc.isFolder) {
                            handleNav(doc.dept);
                          } else {
                            setActiveDoc(doc);
                          }
                        }}
                        onContextMenu={(e) => onContextMenu(e, doc.id)}
                      >
                        <td className="pl-4 py-2.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="w-[15px] h-[15px] rounded-[3px] border-slate-300 cursor-pointer accent-blue-500 block" checked={sel} onChange={() => toggleDoc(doc.id)} /></td>
                        <td className="px-2.5 py-2.5 overflow-hidden text-ellipsis whitespace-nowrap align-middle">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${doc.isFolder ? 'bg-blue-50 text-blue-500' : doc.isPdf ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                              {doc.isFolder ? <FolderRoundedIcon sx={{ fontSize: 14 }} /> : doc.isPdf ? <PictureAsPdfRoundedIcon sx={{ fontSize: 14 }} /> : <DescriptionRoundedIcon sx={{ fontSize: 14 }} />}
                            </div>
                            <span className="text-[12.5px] font-medium text-slate-800 truncate">{doc.name}</span>
                            {doc.fav && <StarRoundedIcon sx={{ fontSize: 11 }} className="text-amber-500 ml-1 shrink-0" />}
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 overflow-hidden text-ellipsis whitespace-nowrap align-middle">
                          <span className="text-[11px] text-slate-500">{doc.type}</span>
                        </td>
                        <td className="px-2.5 py-2.5 align-middle">
                          {doc.status ? (
                            <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-medium tracking-wide ${getStatusStyle(doc.status)}`}>
                              {doc.status}
                            </span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-2.5 py-2.5 overflow-hidden text-ellipsis whitespace-nowrap align-middle">
                          <div className="flex items-center gap-1.5">
                            <img src={doc.authorImg} alt="" className="w-[22px] h-[22px] rounded-full object-cover shrink-0 bg-slate-100" />
                            <span className="text-xs truncate">{doc.author.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 align-middle">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              <img src="https://i.pravatar.cc/150?img=32" alt="" className="w-[22px] h-[22px] rounded-full object-cover border-2 border-white -mr-1.5 relative z-[1]" />
                              <img src="https://i.pravatar.cc/150?img=12" alt="" className="w-[22px] h-[22px] rounded-full object-cover border-2 border-white relative z-0" />
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-px ml-1">+{doc.shared}</span>
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 align-middle">
                          <span className="text-[11.5px] text-slate-500">{doc.rawDate || '—'}</span>
                        </td>
                        <td className="px-2.5 py-2.5 align-middle" onClick={(e) => e.stopPropagation()}>
                          <div className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer text-slate-400 hover:bg-slate-200/50 hover:text-slate-800 transition-colors" onClick={(e) => onContextMenu(e, doc.id)}>
                            <MoreHorizRoundedIcon sx={{ fontSize: 18 }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="px-5 py-2 border-t border-slate-200 flex items-center justify-between shrink-0 h-[44px]">
            <span className="text-[11.5px] text-slate-400">Showing {Math.min(perPage, total)} of {total} result{total !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-1">
              {totalPages > 1 && (
                <>
                  <button className="w-7 h-7 rounded-md border border-slate-200 bg-white text-slate-500 flex items-center justify-center text-xs font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><KeyboardArrowLeftRoundedIcon sx={{ fontSize: 13 }} /></button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button key={page} className={`w-7 h-7 rounded-md border text-xs flex items-center justify-center transition-colors ${page === currentPage ? 'bg-blue-thin text-blue-dark border-transparent font-medium' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`} onClick={() => setCurrentPage(page)}>{page}</button>
                    )
                  })}
                  {totalPages > 5 && <span className="px-1 text-slate-400 text-xs">…</span>}
                  {totalPages > 5 && <button className={`w-7 h-7 rounded-md border text-xs flex items-center justify-center transition-colors ${totalPages === currentPage ? 'bg-blue-thin text-blue-dark border-transparent font-medium' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>}
                  <button className="w-7 h-7 rounded-md border border-slate-200 bg-white text-slate-500 flex items-center justify-center text-xs font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><KeyboardArrowRightRoundedIcon sx={{ fontSize: 13 }} /></button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Context Menu */}
      {ctxMenu && (
        <div className="fixed bg-white border border-slate-200 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[100] min-w-[150px] p-1" style={{ top: ctxMenu.y, left: ctxMenu.x }}>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => handleCtxAction('open')}><LaunchRoundedIcon sx={{ fontSize: 14 }} /> Open</div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => handleCtxAction('rename')}><EditRoundedIcon sx={{ fontSize: 14 }} /> Rename</div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => handleCtxAction('share')}><ShareRoundedIcon sx={{ fontSize: 14 }} /> Share</div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => handleCtxAction('pin')}><PushPinRoundedIcon sx={{ fontSize: 14 }} /> Pin</div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => handleCtxAction('fav')}><StarRoundedIcon sx={{ fontSize: 14 }} /> Add to favorites</div>
          <div className="h-px bg-slate-200 my-1"></div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors" onClick={() => handleCtxAction('download')}><DownloadRoundedIcon sx={{ fontSize: 14 }} /> Download</div>
          <div className="h-px bg-slate-200 my-1"></div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] text-red-500 cursor-pointer hover:bg-red-50 transition-colors" onClick={() => handleCtxAction('delete')}><DeleteRoundedIcon sx={{ fontSize: 14 }} /> Delete</div>
        </div>
      )}

      <DocumentDetailDrawer
        doc={activeDoc}
        onClose={() => setActiveDoc(null)}
        onToast={showToast}
      />

      {/* Global Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg text-[12.5px] font-medium shadow-lg transition-opacity duration-200 pointer-events-none z-[999] ${toast ? 'opacity-100' : 'opacity-0'}`}>
        {toast?.msg}
      </div>

    </DashboardLayoutNew>
  );
}

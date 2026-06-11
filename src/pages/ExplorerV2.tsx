import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayoutNew } from '../components/layout/DashboardLayoutNew';
import {
  DocumentDetailDrawer,
  type DocItem,
} from '../components/explorer/DocumentDetailDrawer';
import { Collections } from '../components/explorer/Collections';
import { CollectionsDisplayer } from '../components/explorer/CollectionsDisplayer';
import { ActionsMenu, computeMenuPosition } from '../components/explorer/ActionsMenu';
import { useMetadata } from '../hooks/useMetadata';
import { useDocument } from '../hooks/useDocument';

export function ExplorerV2() {
  const [activeDoc, setActiveDoc] = useState<DocItem | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const rootParam = searchParams.get('root') || 'all';
  const classParam = searchParams.get('class') || '';
  const openDocIdParam = searchParams.get('openDocId') || '';

  const nav = classParam ? classParam : rootParam;

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [sortDir, setSortDir] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  const [isDeptCollapsed, setIsDeptCollapsed] = useState(false);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; docId: string | number } | null>(null);

  const {
    classes,
    documents: apiDocs,
    fetchClasses,
    fetchClassDocuments,
  } = useMetadata();

  const { downloadFile } = useDocument();

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    const matchedClass = classes.data.find((c) => c.technicalName.toLowerCase() === nav.toLowerCase());
    if (matchedClass) {
      const offset = (currentPage - 1) * perPage;
      fetchClassDocuments(matchedClass.technicalName, { offset, limit: perPage });
    }
  }, [nav, currentPage, perPage, classes.data, fetchClassDocuments]);

  useEffect(() => {
    const handleGlobalClick = () => setCtxMenu(null);
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const showToast = (msg: string) => {
    const id = Date.now();
    setToast({ msg, id });
    setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 2500);
  };

  const handleNav = (id: string) => {
    if (id === 'all' || id === 'my') {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('root', id);
        next.delete('class');
        next.delete('openDocId');
        return next;
      });
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!next.has('root')) {
          next.set('root', 'all');
        }
        next.set('class', id);
        next.delete('openDocId');
        return next;
      });
    }
    setTab('all');
    setSelected(new Set());
    setCurrentPage(1);
  };

  const handleOpenDoc = (doc: DocItem) => {
    setActiveDoc(doc);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('openDocId', String(doc.id));
      return next;
    });
  };

  const handleCloseDoc = () => {
    setActiveDoc(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('openDocId');
      return next;
    });
  };

  const handleSort = (col: string) => {
    if (sort === col) setSortDir((prev) => prev * -1);
    else {
      setSort(col);
      setSortDir(1);
    }
  };

  const removeFilter = (f: string) => {
    setFilters(filters.filter((x) => x !== f));
    setCurrentPage(1);
  };

  const toggleSelectAll = (checked: boolean, pageDocs: DocItem[]) => {
    if (checked) {
      const newSel = new Set(selected);
      pageDocs.forEach((d) => newSel.add(String(d.id)));
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

  const onContextMenu = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = computeMenuPosition(e.clientX, e.clientY);
    setCtxMenu({ x, y, docId: id });
  };

  let filtered: DocItem[] = [];
  const matchedClass = classes.data.find((c) => c.technicalName.toLowerCase() === nav.toLowerCase());

  if (matchedClass) {
    filtered = (apiDocs.data || []).map((doc): DocItem => {
      const isPdf = doc.extension?.toLowerCase() === '.pdf' || doc.extension?.toLowerCase() === 'pdf';
      const isDoc = ['.doc', '.docx', 'doc', 'docx'].includes(doc.extension?.toLowerCase() || '');

      const authorName = doc.me ? 'Moi' : doc.user?.fullName || 'Système';
      const authorImg = doc.me
        ? 'https://i.pravatar.cc/150?img=60'
        : doc.user?.fullName
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.user.fullName)}&background=0D8ABC&color=fff`
          : 'https://i.pravatar.cc/150?img=9';

      return {
        id: doc.documentId as any,
        name: doc.originalFileName,
        type: doc.extension?.replace(/^\./, '').toUpperCase() || 'FILE',
        status: doc.status || 'UPLOADED',
        author: authorName,
        authorImg,
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
    filtered = (classes.data || []).map(
      (cls): DocItem => ({
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
      }),
    );
  }

  if (tab === 'folders') filtered = filtered.filter((d) => d.isFolder);
  else if (tab === 'docs') filtered = filtered.filter((d) => d.isDoc || d.isPdf);
  else if (tab === 'pending') filtered = filtered.filter((d) => d.status === 'Pending' || d.status === 'UPLOADED');

  if (search) {
    const sl = search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(sl) ||
        d.type.toLowerCase().includes(sl) ||
        d.author.toLowerCase().includes(sl),
    );
  }

  filters.forEach((f) => {
    if (f === 'Folder') filtered = filtered.filter((d) => d.isFolder);
    else if (f === 'PDF') filtered = filtered.filter((d) => d.isPdf);
    else if (f === 'Doc') filtered = filtered.filter((d) => d.isDoc);
    else if (['Approved', 'Pending', 'Rejected', 'UPLOADED'].includes(f)) {
      filtered = filtered.filter((d) => d.status === f);
    }
  });

  const sortMap: Record<string, keyof DocItem> = { name: 'name', type: 'type', date: 'date' };
  if (sortMap[sort]) {
    filtered.sort((a, b) => {
      const va = String(a[sortMap[sort]] || '');
      const vb = String(b[sortMap[sort]] || '');
      return va.localeCompare(vb) * sortDir;
    });
  }

  const isViewingDocuments = !!matchedClass;
  const displayItems = filtered;
  const total = isViewingDocuments ? apiDocs.totalCount : filtered.length;
  const totalPages = isViewingDocuments ? Math.ceil(total / perPage) : 1;

  const allSel = displayItems.length > 0 && displayItems.every((d) => selected.has(String(d.id)));
  const someSel = displayItems.some((d) => selected.has(String(d.id)));

  const bulkAction = async (action: string) => {
    const n = selected.size;
    if (action === 'delete') {
      showToast(`${n} item${n > 1 ? 's' : ''} supprimé(s)`);
      setSelected(new Set());
    } else if (action === 'share') {
      showToast(`Partage de ${n} item(s)`);
    } else if (action === 'download') {
      const docsToDownload = displayItems.filter((d) => selected.has(String(d.id)) && !d.isFolder);
      if (docsToDownload.length === 0) {
        showToast('Aucun fichier à télécharger');
        return;
      }
      let successCount = 0;
      for (const doc of docsToDownload) {
        const ok = await downloadFile(doc.docId, doc.name);
        if (ok) successCount += 1;
      }
      showToast(
        successCount === docsToDownload.length
          ? `Téléchargement de ${successCount} item(s)`
          : `${successCount}/${docsToDownload.length} fichier(s) téléchargé(s)`,
      );
    }
  };

  const handleCtxAction = async (action: string) => {
    if (!ctxMenu) return;

    const doc = displayItems.find((d) => String(d.id) === String(ctxMenu.docId));
    if (!doc) {
      setCtxMenu(null);
      return;
    }

    if (action === 'open') {
      if (doc.isFolder) {
        handleNav(doc.dept);
      } else {
        handleOpenDoc(doc);
      }
    } else if (action === 'download') {
      if (doc.isFolder) {
        showToast('Impossible de télécharger un dossier');
      } else {
        const ok = await downloadFile(doc.docId, doc.name);
        showToast(ok ? 'Téléchargement démarré' : 'Erreur lors du téléchargement');
      }
    } else {
      showToast(`Action "${action}" exécutée`);
    }

    setCtxMenu(null);
  };

  useEffect(() => {
    if (openDocIdParam && filtered.length > 0) {
      const doc = filtered.find((d) => String(d.id) === openDocIdParam);
      if (doc && (!activeDoc || String(activeDoc.id) !== openDocIdParam)) {
        setActiveDoc(doc);
      }
    } else if (!openDocIdParam && activeDoc) {
      setActiveDoc(null);
    }
  }, [openDocIdParam, filtered, activeDoc]);

  return (
    <DashboardLayoutNew isFullWidth isChildPaddingBottom={false}>
      <div className="flex h-full w-full bg-white font-body -mb-16 border border-slate-200 rounded-lg overflow-hidden relative">
        <Collections
          rootParam={rootParam}
          classParam={classParam}
          classes={classes}
          isDeptCollapsed={isDeptCollapsed}
          onToggleDeptCollapsed={() => setIsDeptCollapsed(!isDeptCollapsed)}
          onNavigate={handleNav}
        />

        <CollectionsDisplayer
          rootParam={rootParam}
          classParam={classParam}
          classes={classes}
          documents={displayItems}
          isLoading={classes.isLoading || (isViewingDocuments && apiDocs.isLoading)}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            if (isViewingDocuments) setCurrentPage(1);
          }}
          filters={filters}
          onRemoveFilter={removeFilter}
          selected={selected}
          onClearSelection={() => setSelected(new Set())}
          onBulkAction={bulkAction}
          onNavigate={handleNav}
          onOpenDoc={handleOpenDoc}
          onContextMenu={onContextMenu}
          sort={sort}
          onSort={handleSort}
          allSelected={allSel}
          someSelected={someSel}
          onToggleSelectAll={(checked) => toggleSelectAll(checked, displayItems)}
          onToggleRow={toggleDoc}
          {...(isViewingDocuments && {
            currentPage,
            totalPages,
            total,
            perPage,
            onPageChange: setCurrentPage,
          })}
        />
      </div>

      {ctxMenu && (
        <ActionsMenu x={ctxMenu.x} y={ctxMenu.y} onAction={handleCtxAction} />
      )}

      <DocumentDetailDrawer doc={activeDoc} onClose={handleCloseDoc} onToast={showToast} />

      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg text-[12.5px] font-medium shadow-lg transition-opacity duration-200 pointer-events-none z-[999] ${
          toast ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {toast?.msg}
      </div>
    </DashboardLayoutNew>
  );
}

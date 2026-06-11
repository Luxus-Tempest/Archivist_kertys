import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { InformationBox } from '../global/InformationBox';
import { GenericTable, type GenericTableColumn } from './GenericTable';
import type { DocItem } from './DocumentDetailDrawer';

type ClassItem = {
  id: number | string;
  name: string;
  technicalName: string;
  totalRecords: number;
};

type CollectionsDisplayerProps = {
  rootParam: string;
  classParam: string;
  classes: { data: ClassItem[]; isLoading: boolean };
  documents: DocItem[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  filters: string[];
  onRemoveFilter: (filter: string) => void;
  selected: Set<string>;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
  onNavigate: (id: string) => void;
  onOpenDoc: (doc: DocItem) => void;
  onContextMenu: (e: React.MouseEvent, id: string | number) => void;
  sort: string;
  onSort: (column: string) => void;
  allSelected: boolean;
  someSelected: boolean;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleRow: (id: string | number) => void;
  currentPage?: number;
  totalPages?: number;
  total?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
};

function getStatusStyle(status: string) {
  if (status === 'Pending') return 'bg-amber-50 text-amber-800 border-amber-300';
  if (status === 'Revision') return 'bg-orange-50 text-orange-800 border-orange-300';
  if (status === 'Requisition') return 'bg-blue-50 text-blue-900 border-blue-300';
  if (status === 'Approved') return 'bg-green-50 text-green-900 border-green-400';
  if (status === 'Rejected') return 'bg-red-50 text-red-900 border-red-300';
  return '';
}

function buildColumns(
  onContextMenu: (e: React.MouseEvent, id: string | number) => void,
): GenericTableColumn<DocItem>[] {
  return [
    {
      id: 'name',
      header: 'Name',
      width: 'w-[200px]',
      sortable: true,
      sortKey: 'name',
      render: (doc) => (
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                doc.isFolder ? 'bg-blue-50 text-blue-500' : doc.isPdf ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
              }`}
            >
              {doc.isFolder ? (
                <FolderRoundedIcon sx={{ fontSize: 14 }} />
              ) : doc.isPdf ? (
                <PictureAsPdfRoundedIcon sx={{ fontSize: 14 }} />
              ) : (
                <DescriptionRoundedIcon sx={{ fontSize: 14 }} />
              )}
            </div>
            <span className="text-[12.5px] font-medium text-slate-800 truncate">{doc.name}</span>
            {doc.fav && <StarRoundedIcon sx={{ fontSize: 11 }} className="text-amber-500 ml-1 shrink-0" />}
          </div>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      width: 'w-[120px]',
      sortable: true,
      sortKey: 'type',
      render: (doc) => (
        <span className="text-[11px] text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
          {doc.type}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: 'w-[90px]',
      sortable: true,
      sortKey: 'status',
      render: (doc) =>
        doc.status ? (
          <span
            className={`inline-block px-2 py-0.5 rounded border text-[10px] font-medium tracking-wide ${getStatusStyle(doc.status)}`}
          >
            {doc.status}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      id: 'author',
      header: 'Author',
      width: 'w-[110px]',
      render: (doc) =>
        !doc.isFolder ? (
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <img
              src={doc.authorImg}
              alt=""
              className="w-[22px] h-[22px] rounded-full object-cover shrink-0 bg-slate-100"
            />
            <span className="text-xs truncate">{doc.author.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      id: 'date',
      header: 'Modified',
      width: 'w-[120px]',
      sortable: true,
      sortKey: 'date',
      render: (doc) => <span className="text-[11.5px] text-slate-500">{doc.rawDate || '—'}</span>,
    },
    {
      id: 'actions',
      header: '',
      width: 'w-[40px]',
      render: (doc) => (
        <div onClick={(e) => e.stopPropagation()}>
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer text-slate-400 hover:bg-slate-200/50 hover:text-slate-800 transition-colors"
            onClick={(e) => onContextMenu(e, doc.id)}
          >
            <MoreHorizRoundedIcon sx={{ fontSize: 18 }} />
          </div>
        </div>
      ),
    },
  ];
}

export function CollectionsDisplayer({
  rootParam,
  classParam,
  classes,
  documents,
  isLoading,
  search,
  onSearchChange,
  filters,
  onRemoveFilter,
  selected,
  onClearSelection,
  onBulkAction,
  onNavigate,
  onOpenDoc,
  onContextMenu,
  sort,
  onSort,
  allSelected,
  someSelected,
  onToggleSelectAll,
  onToggleRow,
  currentPage,
  totalPages,
  total,
  perPage,
  onPageChange,
}: CollectionsDisplayerProps) {
  const columns = buildColumns(onContextMenu);

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
      <div className="px-5 pt-4 pb-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3 mb-3.5" />
        <div className="flex items-center overflow-x-auto [scrollbar-width:none]">
          {classes.isLoading && classes.data.length === 0 ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col pr-5 mr-5 border-r border-slate-200 last:border-none animate-pulse shrink-0"
              >
                <div className="w-16 h-3 bg-slate-200 rounded mb-1.5" />
                <div className="w-8 h-6 bg-slate-200 rounded" />
              </div>
            ))
          ) : classes.data.length === 0 ? (
            <div className="text-xs text-slate-400">Pas de statistiques disponibles</div>
          ) : (
            classes.data.map((c, idx) =>
              c.totalRecords > 0 ? (
                <div
                  key={c.id}
                  className={`flex flex-col pr-5 mr-5 shrink-0 ${
                    idx < classes.data.length - 1 ? 'border-r border-slate-200' : ''
                  }`}
                >
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-0.5 truncate max-w-[120px]">
                    {c.name}
                  </span>
                  <span className="text-[12px] font-medium text-blue-dark">{c.totalRecords}</span>
                </div>
              ) : null,
            )
          )}
        </div>
      </div>

      <div className="px-5 py-2 border-b border-slate-200 flex flex-wrap items-center gap-2.5 shrink-0">
        <div className="flex-1 min-w-[200px] flex items-center gap-1.5 bg-white border border-slate-300 rounded-md px-2.5 h-8 focus-within:border-blue-400 transition-colors">
          <SearchRoundedIcon sx={{ fontSize: 14 }} className="text-slate-400 shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent border-none outline-none text-[12.5px] text-slate-800 placeholder:text-slate-400 font-body"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <div
              key={f}
              className="flex items-center gap-1 bg-blue-thin text-blue-dark px-2 py-1 rounded text-[11.5px] font-medium cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onRemoveFilter(f)}
            >
              {f} <CloseRoundedIcon sx={{ fontSize: 12 }} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center ml-3 gap-1.5 text-[14px] font-bold text-slate-400 mt-1 uppercase tracking-wider select-none">
        <span className="cursor-pointer hover:text-slate-600 transition-colors" onClick={() => onNavigate(rootParam)}>
          {rootParam === 'my' ? 'My Files' : 'All'}
        </span>
        {classParam && (
          <>
            <KeyboardArrowRightRoundedIcon sx={{ fontSize: 12 }} className="text-slate-400" />
            <span className="text-slate-700">
              {classes.data.find((c) => c.technicalName.toLowerCase() === classParam.toLowerCase())?.name ||
                classParam}
            </span>
          </>
        )}
      </div>

      <div
        className={`flex items-center gap-2.5 px-5 py-1.5 bg-blue-thin border-b border-blue-200 shrink-0 transition-all overflow-hidden ${
          selected.size > 0 ? 'h-auto opacity-100' : 'h-0 opacity-0 border-none py-0'
        }`}
      >
        <CheckBoxRoundedIcon sx={{ fontSize: 15 }} className="text-blue-dark" />
        <span className="text-[12.5px] font-medium text-blue-dark">{selected.size} selected</span>
        <div className="ml-auto flex gap-1.5">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-600 text-xs hover:bg-slate-50 transition-colors"
            onClick={() => onBulkAction('download')}
          >
            <DownloadRoundedIcon sx={{ fontSize: 14 }} /> Download
          </button>
          <button
            disabled
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-600 text-xs hover:bg-slate-50 transition-colors"
            onClick={() => onBulkAction('delete')}
          >
            <DeleteRoundedIcon sx={{ fontSize: 14 }} /> Delete
          </button>
          <button
            className="flex items-center justify-center p-1 rounded-md bg-transparent border border-transparent text-slate-500 hover:bg-slate-200/50 transition-colors ml-1"
            onClick={onClearSelection}
          >
            <CloseRoundedIcon sx={{ fontSize: 14 }} />
          </button>
        </div>
      </div>

      <GenericTable
        columns={columns}
        data={documents}
        rowKey={(doc) => doc.id}
        isLoading={isLoading}
        emptyState={
          <div className="p-10 text-center text-slate-400 flex flex-col items-center">
            <InformationBox
              title="Collection vide"
              description="Cette collection ne contient aucun fichier"
              icon="search"
            />
          </div>
        }
        selectable
        selectedIds={selected}
        allSelected={allSelected}
        someSelected={someSelected}
        onToggleSelectAll={onToggleSelectAll}
        onToggleRow={onToggleRow}
        sort={sort}
        onSort={onSort}
        onRowClick={(doc) => {
          if (doc.isFolder) {
            onNavigate(doc.dept);
          } else {
            onOpenDoc(doc);
          }
        }}
        onRowContextMenu={(e, doc) => onContextMenu(e, doc.id)}
        {...(onPageChange && {
          currentPage,
          totalPages,
          total,
          perPage,
          onPageChange,
        })}
      />
    </main>
  );
}

import type { ReactNode } from "react";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";

export type GenericTableColumn<T> = {
  id: string;
  header: string;
  width?: string;
  sortable?: boolean;
  sortKey?: string;
  render: (row: T) => ReactNode;
};

type GenericTableProps<T> = {
  columns: GenericTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;
  selectable?: boolean;
  selectedIds?: Set<string>;
  allSelected?: boolean;
  someSelected?: boolean;
  onToggleSelectAll?: (checked: boolean) => void;
  onToggleRow?: (id: string | number) => void;
  sort?: string;
  onSort?: (column: string) => void;
  onRowClick?: (row: T) => void;
  onRowContextMenu?: (e: React.MouseEvent, row: T) => void;
  currentPage?: number;
  totalPages?: number;
  total?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
};

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);
  if (currentPage > 3) {
    pages.push("...");
  }

  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }
  pages.push(totalPages);

  return pages;
}

export function GenericTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  loadingRows = 5,
  emptyState,
  selectable = false,
  selectedIds = new Set(),
  allSelected = false,
  someSelected = false,
  onToggleSelectAll,
  onToggleRow,
  sort,
  onSort,
  onRowClick,
  onRowContextMenu,
  currentPage = 1,
  totalPages = 1,
  total = 0,
  perPage = 5,
  onPageChange,
}: GenericTableProps<T>) {
  const colSpan = columns.length + (selectable ? 1 : 0);
  const start = (currentPage - 1) * perPage;
  const showPagination = totalPages > 1 && onPageChange;

  return (
    <>
      <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
        <table className="w-full border-collapse table-fixed">
          <thead className="sticky top-0 bg-slate-50 z-[2]">
            <tr className="border-b border-slate-200">
              {selectable && (
                <th className="w-[36px] pl-4 py-[9px]">
                  <input
                    type="checkbox"
                    className="w-[15px] h-[15px] rounded-full! border-slate-300 cursor-pointer accent-blue-500 block"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`${col.width ?? ""} py-[9px] px-2.5 text-[10px] font-medium text-slate-400 uppercase tracking-widest ${
                    col.sortable
                      ? "cursor-pointer select-none hover:text-slate-800 transition-colors"
                      : ""
                  }`}
                  onClick={
                    col.sortable && col.sortKey
                      ? () => onSort?.(col.sortKey!)
                      : undefined
                  }
                >
                  {col.header}
                  {col.sortable && sort === col.sortKey && (
                    <UnfoldMoreRoundedIcon
                      sx={{ fontSize: 11, verticalAlign: "-1px" }}
                    />
                  )}
                  {col.sortable && sort !== col.sortKey && (
                    <UnfoldMoreRoundedIcon
                      sx={{ fontSize: 11, verticalAlign: "-1px" }}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, idx) => (
                <tr
                  key={idx}
                  className="animate-pulse border-b border-slate-200"
                >
                  {selectable && (
                    <td className="pl-4 py-2.5">
                      <div className="w-4 h-4 bg-slate-200 rounded" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.id} className="px-2.5 py-2.5">
                      <div className="w-20 h-4 bg-slate-200 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>{emptyState}</td>
              </tr>
            ) : (
              data.map((row) => {
                const key = String(rowKey(row));
                const sel = selectedIds.has(key);

                return (
                  <tr
                    key={key}
                    className={`border-b border-slate-200 cursor-pointer transition-colors ${
                      sel ? "bg-blue-thin" : "hover:bg-slate-50"
                    }`}
                    onClick={() => onRowClick?.(row)}
                    onContextMenu={(e) => onRowContextMenu?.(e, row)}
                  >
                    {selectable && (
                      <td
                        className="pl-4 py-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="w-[15px] h-[15px] rounded-full! border-slate-300 cursor-pointer accent-blue-500 block"
                          checked={sel}
                          onChange={() => onToggleRow?.(rowKey(row))}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.id} className="px-2.5 py-2.5 align-middle">
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <div className="px-5 py-2 border-t border-slate-200 flex items-center justify-between shrink-0 h-[44px]">
          <span className="text-[11.5px] text-slate-400">
            Showing {total > 0 ? start + 1 : 0} -{" "}
            {Math.min(start + perPage, total)} of {total} result
            {total !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            {showPagination && (
              <>
                <button
                  className="w-7 h-7 rounded-md border border-slate-200 bg-white text-slate-500 flex items-center justify-center text-xs font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <KeyboardArrowLeftRoundedIcon sx={{ fontSize: 13 }} />
                </button>

                {getPageNumbers(currentPage, totalPages).map((page, i) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`dots-${i}`}
                        className="px-1 text-slate-400 text-xs select-none"
                      >
                        …
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      className={`w-7 h-7 rounded-md border text-xs flex items-center justify-center transition-colors ${
                        page === currentPage
                          ? "bg-blue-thin text-blue-dark border-transparent font-medium"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                      onClick={() => onPageChange(page as number)}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  className="w-7 h-7 rounded-md border border-slate-200 bg-white text-slate-500 flex items-center justify-center text-xs font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <KeyboardArrowRightRoundedIcon sx={{ fontSize: 13 }} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

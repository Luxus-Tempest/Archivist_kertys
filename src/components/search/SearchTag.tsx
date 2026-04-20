import React from 'react';

interface SearchTagProps {
  label: string;
  onRemove: () => void;
}

export const SearchTag: React.FC<SearchTagProps> = ({ 
  label, 
  onRemove
}) => {
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}  
      className="flex items-center gap-1 cursor-pointer  animate-in zoom-in-95 duration-200 shrink-0 px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-black rounded uppercase tracking-widest border border-outline-variant/20"
    >
    {/* <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm animate-in zoom-in-95 duration-200 shrink-0"> */}
      <span className="tracking-tight uppercase text-[9px] font-black">{label}</span>
      {/* <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }} 
        className="hover:text-error text-[8px] transition-colors cursor-pointer flex items-center justify-center -mr-1"
      >
        <span className="material-symbols-outlined text-[8px]">close</span>
      </button> */}
    </div>
  );
};

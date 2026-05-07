import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export interface PropertyItem {
  key: string;       // ex: "{{className}}"
  label: string;     // ex: "Nom de classe"
  type: string;      // ex: "Texte", "Date"
  description?: string;
}

interface AtMentionMenuProps {
  items: PropertyItem[];
  query: string;
  activeIndex: number;
  onSelect: (item: PropertyItem) => void;
  onClose: () => void;
  position: { top: number; left: number };
}



export const AtMentionMenu: React.FC<AtMentionMenuProps> = ({
  items,
  query,
  activeIndex,
  onSelect,
  onClose: _onClose,
  position,
}) => {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll vers l'item actif
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.key.toLowerCase().includes(query.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return createPortal(
    <div
      ref={listRef}
      className="fixed z-[9999]"
      style={{ top: position.top, left: position.left }}
    >
      {/* Bulle principale */}
      <div
        className="
          min-w-[220px] max-w-[280px] max-h-[220px] overflow-y-auto
          bg-white/95 backdrop-blur-sm
          border border-outline-variant/30
          rounded-xl shadow-xl
          py-1.5
          [scrollbar-width:thin]
        "
        style={{ animation: "at-menu-appear 0.18s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <style>{`
          @keyframes at-menu-appear {
            from { opacity: 0; transform: scale(0.95) translateY(-6px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);    }
          }
        `}</style>

        {/* Header discret */}
        <div className="px-3 pb-1.5 pt-0.5 flex items-center gap-1.5">
          <span className="text-[9px] font-black tracking-[0.18em] uppercase text-outline/60">
            {t("instructions.properties")}
          </span>
          {query && (
            <span className="text-[9px] font-bold text-primary/70 truncate max-w-[100px]">
              — « {query} »
            </span>
          )}
        </div>

        <div className="h-px bg-outline-variant/15 mx-2 mb-1" />

        {/* Liste */}
        {filtered.map((item, idx) => {
          const isActive = idx === activeIndex;
          // const typeStyle = getTypeStyle(item.type);

          return (
            <button
              key={item.key}
              ref={isActive ? activeRef : null}
              onMouseDown={(e) => {
                // preventDefault empêche le blur de la textarea,
                // ce qui permet l'insertion sans fermeture prématurée du menu
                e.preventDefault();
                onSelect(item);
              }}
              className={`
                w-full flex items-center gap-2.5 px-3 py-1.5 text-left
                transition-colors duration-100 cursor-pointer
                relative group
                ${isActive
                  ? "bg-primary/[0.07]"
                  : "hover:bg-surface-container-low/60"
                }
              `}
            >
              {/* Indicateur actif */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r-full" />
              )}

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`
                      text-[11px] font-bold tracking-tight truncate
                      ${isActive ? "text-primary" : "text-on-surface"}
                    `}
                  >
                    {item.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-outline/60 tracking-tight">
                  {item.key}
                </span>
              </div>

              {/* Badge type */}
              <span
                className={`
                  shrink-0 text-[8px] font-black capitalize tracking-widest
                  px-1.5 py-0.5 rounded-xs border border-outline-variant/30
                  bg-surface-container text-primary
                `}
              >
                {item.type}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hint clavier */}
      {/* <div className="flex items-center gap-2 mt-1.5 px-1">
        <Kbd>↑↓</Kbd>
        <span className="text-[9px] text-outline/50 font-medium">naviguer</span>
        <Kbd>↵</Kbd>
        <span className="text-[9px] text-outline/50 font-medium">insérer</span>
        <Kbd>Esc</Kbd>
        <span className="text-[9px] text-outline/50 font-medium">fermer</span>
      </div> */}
    </div>,
    document.body
  );
};



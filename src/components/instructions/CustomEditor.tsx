import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { AtMentionMenu, type PropertyItem } from "./AtMentionMenu";
import { useAdmin } from "../../hooks/useAdmin";
import { SvgIcon } from "../SvgIcon";



// ─── Types internes ──────────────────────────────────────────────────────────
interface PropBlock {
  id: string;
  name: string;
  content: string;
}
interface EditorState {
  global: string;
  blocks: PropBlock[];
}

// ─── Sérialisation / Parsing ─────────────────────────────────────────────────
function serialize(s: EditorState, classId: number | string, className: string): string {
  const parts: string[] = [];
  parts.push(`<rule_set id="${classId || 0}" document_type="${className || "Document"}">`);
  parts.push(`  <GlobalInstruction>${s.global || ""}</GlobalInstruction>`);
  s.blocks.forEach((b) =>
    parts.push(`  <Property name="${b.name}">${b.content || ""}</Property>`)
  );
  parts.push(`</rule_set>`);
  return parts.join("\n");
}

function parse(raw: string): EditorState {
  if (!raw?.trim()) return { global: "", blocks: [] };
  const gi = raw.match(/<GlobalInstruction>([\s\S]*?)<\/GlobalInstruction>/);
  const props = [...raw.matchAll(/<Property name="([^"]*)">([\s\S]*?)<\/Property>/g)];
  
  if (!gi && props.length === 0) {
    const cleanText = raw.replace(/<[^>]*>/g, "").trim();
    return { global: cleanText, blocks: [] };
  }
  
  return {
    global: gi ? gi[1].trim() : "",
    blocks: props.map((m, i) => ({ 
      id: `b${i}_${m[1]}`, 
      name: m[1], 
      content: m[2].trim() 
    })),
  };
}

// ─── Position du caret pour le menu @ ────────────────────────────────────────
function caretPos(ta: HTMLTextAreaElement) {
  const pos = ta.selectionStart ?? 0;
  const cs = getComputedStyle(ta);
  const m = document.createElement("div");
  ["paddingTop","paddingRight","paddingBottom","paddingLeft",
   "borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth",
   "boxSizing","fontFamily","fontSize","fontWeight","fontStyle",
   "lineHeight","letterSpacing","whiteSpace","overflowWrap","wordBreak",
  ].forEach((p) => { (m.style as any)[p] = (cs as any)[p]; });
  
  const tr = ta.getBoundingClientRect();
  
  Object.assign(m.style, {
    position:"fixed", top: tr.top + "px", left: tr.left + "px", visibility:"hidden",
    pointerEvents:"none", whiteSpace:"pre-wrap", wordWrap:"break-word",
    width: ta.offsetWidth + "px", height: ta.offsetHeight + "px", overflow:"hidden",
  });
  
  const sp = document.createElement("span");
  sp.textContent = "\u200b";
  m.appendChild(document.createTextNode(ta.value.slice(0, pos)));
  m.appendChild(sp);
  document.body.appendChild(m);
  const sr = sp.getBoundingClientRect();
  document.body.removeChild(m);
  
  const lh = parseFloat(cs.lineHeight) || 20;
  return {
    top:  sr.top - ta.scrollTop + lh,
    left: sr.left,
  };
}

interface CustomEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  properties?: PropertyItem[];
  classId?: number | string;
  className?: string;
}

export const CustomEditor: React.FC<CustomEditorProps> = ({
  value,
  onChange,
  placeholder,
  properties: initialProperties, // On garde la prop au cas où, mais on va privilégier l'API
  classId = 0,
  className = "Document",
}) => {

  const { t } = useTranslation();
  const [state, setState] = useState<EditorState>(() => parse(value));
  const [_, setFocusedId] = useState<string | null>(null);
  const [showMenu, setShowMenu]   = useState(false);
  const [query, setQuery]         = useState("");
  const [menuPos, setMenuPos]     = useState({ top: 0, left: 0 });
  const [activeIdx, setActiveIdx] = useState(0);
  
  const [apiProperties, setApiProperties] = useState<PropertyItem[]>([]);
  
  const { getClassStructure, classStructure, isLoading: isLoadingProps } = useAdmin();

  const taRef   = useRef<HTMLTextAreaElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastVal = useRef(value);

  // ─── Récupération de la structure via le Hook Admin ─────────────────────────
  useEffect(() => {
    if (classId) {
      getClassStructure(classId, className);
    }
  }, [classId, className]);

  // Synchronisation des propriétés du store vers l'état local du menu
  useEffect(() => {
    if (classStructure?.properties) {
      const mapped: PropertyItem[] = Object.keys(classStructure.properties).map(key => {
        const prop = classStructure.properties[key];
        const rawType = prop.type || "string";
        const rawFormat = prop.format;
        
        let uiType = t("instructions.types.text");
        
        if (rawFormat) {
          // Si format existe, on l'utilise (ex: date, email, uuid...)
          uiType = t(`instructions.types.${rawFormat.toLowerCase()}`, { defaultValue: rawFormat.charAt(0).toUpperCase() + rawFormat.slice(1) });
        } else {
          // Sinon fallback sur le type
          if (rawType.includes("number") || rawType.includes("integer")) uiType = t("instructions.types.number");
          else if (rawType.includes("date")) uiType = t("instructions.types.date");
          else if (rawType.includes("boolean")) uiType = t("instructions.types.lookup");
          else if (rawType.includes("array")) uiType = t("instructions.types.list");
        }

        return { key, label: key, type: uiType };
      });
      setApiProperties(mapped);
    } else {
      setApiProperties([]);
    }
  }, [classStructure]);

  // Utilisation des propriétés de l'API en priorité
  const currentProperties = apiProperties.length > 0 ? apiProperties : (initialProperties || []);

  console.log("currentProperties", initialProperties);
  useEffect(() => {
    const parsed = parse(value);
    if (value !== lastVal.current) {
      setState(parsed);
      lastVal.current = value;
    }
  }, [value]);

  // ─── Auto-expansion des textareas ──────────────────────────────────────────
  useLayoutEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = `${taRef.current.scrollHeight}px`;
    }
  }, [state.global]);

  useLayoutEffect(() => {
    state.blocks.forEach((block) => {
      const el = document.getElementById(`prop-${block.name}`) as HTMLTextAreaElement;
      if (el) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    });
  }, [state.blocks]);

  useEffect(() => {
    const s = serialize(state, classId, className);
    if (s !== value) {
      lastVal.current = s;
      onChange(s);
    }
  }, [classId, className, state, onChange, value]);

  const push = useCallback((next: EditorState) => {
    setState(next);
    const s = serialize(next, classId, className);
    lastVal.current = s;
    onChange(s);
  }, [onChange, classId, className]);

  const onGlobalChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val    = e.target.value;
    const cursor = e.target.selectionStart ?? 0;
    push({ ...state, global: val });

    const before = val.slice(0, cursor);
    const atIdx  = before.lastIndexOf("@");
    if (atIdx !== -1) {
      const q = before.slice(atIdx + 1);
      if (!q.includes(" ") && !q.includes("\n")) {
        setQuery(q);
        setActiveIdx(0);
        if (!showMenu && taRef.current)
          setMenuPos(caretPos(taRef.current));
        setShowMenu(true);
        return;
      }
    }
    setShowMenu(false);
    setQuery("");
  }, [state, push, showMenu]);

  const insertProp = useCallback((item: PropertyItem) => {
    const ta     = taRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart ?? 0;
    const before = state.global.slice(0, cursor);
    const atIdx  = before.lastIndexOf("@");
    const newGlobal = atIdx !== -1
      ? state.global.slice(0, atIdx) + state.global.slice(cursor)
      : state.global;
    
    const exists = state.blocks.some((b) => b.name === item.key);
    const newBlocks = exists
      ? state.blocks
      : [...state.blocks, { id: `b_${Date.now()}_${item.key}`, name: item.key, content: "" }];
    
    push({ global: newGlobal, blocks: newBlocks });
    setShowMenu(false);
    setQuery("");
    
    if (!exists) {
      requestAnimationFrame(() => {
        const el = document.getElementById(`prop-${item.key}`);
        el?.focus();
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }, [state, push]);

  const filtered = currentProperties.filter(
    (p) => p.label.toLowerCase().includes(query.toLowerCase()) ||
           p.key.toLowerCase().includes(query.toLowerCase())
  );

  const onGlobalKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMenu) return;
    if (e.key === "ArrowDown")   { e.preventDefault(); setActiveIdx((i) => (i + 1) % Math.max(filtered.length, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)); }
    else if (e.key === "Enter" || e.key === "Tab") { if (filtered[activeIdx]) { e.preventDefault(); insertProp(filtered[activeIdx]); } }
    else if (e.key === "Escape") { e.preventDefault(); setShowMenu(false); setQuery(""); }
  }, [showMenu, filtered, activeIdx, insertProp]);

  const removeBlock = (id: string) => push({ ...state, blocks: state.blocks.filter((b) => b.id !== id) });
  const updateBlock = (id: string, content: string) =>
    push({ ...state, blocks: state.blocks.map((b) => b.id === id ? { ...b, content } : b) });

  const handleAddClick = () => {
    if (taRef.current) {
      taRef.current.focus();
      const val = state.global;
      const newVal = val + (val.endsWith("\n") || val === "" ? "@" : "\n@");
      push({ ...state, global: newVal });
      // On déclenche manuellement la position du menu
      setTimeout(() => {
        if (taRef.current && wrapRef.current) {
          taRef.current.selectionStart = taRef.current.value.length;
          taRef.current.selectionEnd = taRef.current.value.length;
          setMenuPos(caretPos(taRef.current));
          setQuery("");
          setShowMenu(true);
        }
      }, 50);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-xs overflow-hidden flex flex-col border border-outline-variant/10">
      
      {/* ── Global Instruction Section (Docked Top) ────────────────────────── */}
      <div className="p-6 bg-on-bg-gray-100 border-b border-outline-variant/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SvgIcon name="instruction" className="text-primary" />
            <h3 className="font-headline font-bold text-on-surface tracking-tight text-sm">{t("instructions.globalInstruction")}</h3>
            {isLoadingProps && (
              <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin ml-2"></div>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full border border-outline-variant/10">
            {t("instructions.required")}
          </span>
        </div>
        
        <div ref={wrapRef} className="relative">
          <textarea
            ref={taRef}
            value={state.global}
            onChange={onGlobalChange}
            onKeyDown={onGlobalKeyDown}
            onFocus={() => setFocusedId("global")}
            onBlur={() => { setFocusedId(null); setTimeout(() => setShowMenu(false), 150); }}
            placeholder={placeholder || t("instructions.editorPlaceholder", "Define the overarching logic for this document extraction session...")}
            className="w-full bg-surface-container-lowest border-0 rounded-xl p-4 text-sm font-body text-on-surface-variant focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant/50 resize-none min-h-[100px] overflow-hidden transition-[border,box-shadow,height] duration-200"
          />
          <div className="absolute bottom-3 right-4 flex items-center gap-2 pointer-events-none">
            <span className="text-[10px] text-outline-variant/60 font-medium">{t("instructions.mentionHint")}</span>
          </div>

          {showMenu && (
            <AtMentionMenu
              items={currentProperties}
              query={query}
              activeIndex={activeIdx}
              onSelect={insertProp}
              onClose={() => { setShowMenu(false); setQuery(""); }}
              position={menuPos}
            />
          )}
        </div>
      </div>

      {/* ── Property Blocks Container ──────────────────────────────────────── */}
      <div className="flex flex-col">
        {state.blocks.map((block) => {
          const propertyInfo = currentProperties.find(p => p.key === block.name);
          return (
            <React.Fragment key={block.id}>
              <div className="p-4 flex flex-col hover:bg-surface-container-low/30 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-headline font-bold text-on-surface text-sm">{block.name}</span>
                    <div className={`flex items-center px-2 py-0.5 rounded-full ${
                      propertyInfo?.type === 'Nombre' ? 'bg-secondary-container text-on-secondary-container' : 
                      propertyInfo?.type === 'Date' ? 'bg-primary-container text-on-primary-container' :
                      'bg-tertiary-container text-on-tertiary-container'
                    }`}>
                      <span className="text-[9px] font-bold uppercase tracking-wider">{propertyInfo?.type || t("instructions.types.text")}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="p-1.5 text-outline-variant hover:text-error transition-colors cursor-pointer rounded-xl hover:bg-error/5 opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <textarea
                  id={`prop-${block.name}`}
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  onFocus={() => setFocusedId(block.id)}
                  onBlur={() => setFocusedId(null)}
                  placeholder={t("instructions.propertyPlaceholder", { name: block.name.toLowerCase() })}
                  rows={2}
                  className="w-full bg-transparent border-0 p-1 px-2 text-xs font-body text-on-surface-variant focus:ring-0 placeholder:text-outline-variant/40 resize-none leading-relaxed overflow-hidden"
                />
              </div>
              <div className="h-[1px] mx-4 bg-outline-variant/20" />
            </React.Fragment>
          );
        })}

        {/* ── Add New Property Button ────────────────────────────────────────── */}
        <button
          onClick={handleAddClick}
          className="m-4 p-4 py-2 rounded-xl cursor-pointer border border-dashed border-outline-variant/30 hover:bg-surface-container-low hover:border-primary/50 transition-all flex items-center justify-center gap-2 group"
        >
          <SvgIcon name="add" />
          <span className="font-label text-[11px] font-bold uppercase tracking-[0.15em] text-primary">{t("instructions.linkProperty")}</span>
        </button>
      </div>
    </div>
  );
};
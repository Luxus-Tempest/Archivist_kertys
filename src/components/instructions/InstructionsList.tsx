import React from "react";
import { useTranslation } from "react-i18next";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import { Button } from "../Button";
import { formatRelativeDate } from "../../utils/LocalTime.heler";
import { SvgIcon } from "../SvgIcon";
export interface Instruction {
  id: string;
  classId: number;
  className: string;
  content: string;
  updatedAt?: string;
}

interface Props {
  data: Instruction[];
  selectedId?: string;
  onSelect: (item: Instruction) => void;
  onCreate: () => void;
}

export const InstructionsList: React.FC<Props> = ({
  data,
  selectedId,
  onSelect,
  onCreate,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.className?.toLowerCase().includes(searchLower)
      // item.classId?.toString().includes(searchLower)
    );
  });

  return (
    <section className="w-full md:w-[400px] h-full flex-shrink-0 flex flex-col border-r border-outline-variant/30  overflow-hidden">
      {/* Library Header */}
      <div className="p-6 space-y-4 border-b border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline text-xl font-bold text-primary">{t("instructions.title", "Instructions")}</h3>
            <p className="text-xs font-medium text-outline">{t("instructions.itemsTotal", "{{count}} items total", { count: filteredData.length })}</p>
          </div>
          <Button 
            onClick={onCreate}
            variant="solid"
            className="w-max px-3"
            btnClass="rounded-md text-xs py-1"
            icon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="left"
          >
            {t("instructions.newInstruction", "Nouvelle")}
          </Button>
        </div>
        <div className="space-y-2">
          {/* <div className="relative">
            <SelectField
              id="filter-class"
              options={[{ label: "Filtrer par Classe", value: "" }]}
              inputClassName="py-2.5 text-sm bg-surface-container-lowest border-1 border-outline-variant/40"
              rightElement={<ExpandMoreRoundedIcon className="text-outline pointer-events-none" />}
            />
          </div> */}
          <div className="relative">
            <SearchRoundedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" />
            <input 
              className="w-full pl-10  pr-4 py-2.5 bg-surface-container-lowest border-1 border-outline-variant/40  rounded-xl text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant" 
              placeholder={t("instructions.searchPlaceholder", "Rechercher une classe...")} 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
         
        </div>
      </div>

      {/* Instruction List */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6 space-y-2 custom-scrollbar">
        {filteredData.length > 0 ? (
          filteredData.map((item) => {
            const active = item.id === selectedId;

            return (
              <div
                key={item.id+item.classId}
                onClick={() => onSelect(item)}
                className={
                  active
                    ? "bg-surface-container-lowest p-4 rounded-xl shadow-sm active-item ring-1 ring-primary/10 cursor-pointer group hover:bg-surface-container-high transition-colors relative"
                    : "p-4 rounded-xl cursor-pointer shadow-card border border-outline-variant/40 hover:bg-surface-container-high transition-all"
                }
              >
                {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm"></div>}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={
                      active
                        ? "bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded tracking-tighter"
                        : "bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded tracking-tighter"
                    }>
                      [{item.classId}]
                    </span>
                    <span className={`font-headline font-bold text-sm uppercase tracking-wide ${active ? 'text-primary' : 'text-on-surface'}`}>
                      {item.className}
                    </span>
                  </div>
                  {active && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.id === "draft_new" ? "text-outline bg-surface-container-high" : "text-tertiary bg-tertiary-container/30"}`}>
                      {item.id === "draft_new" ? t("instructions.draft", "DRAFT") : t("instructions.active", "ACTIVE")}
                    </span>
                  )}
                </div>
                {/* <p className="text-xs text-on-surface-variant line-clamp-1 leading-relaxed mb-3">
                  {item.content || t("instructions.noContent", "Aucun contenu...")}
                </p> */}
                <div className="flex items-center text-[10px] text-outline font-bold  tracking-widest ">
                  <ScheduleRoundedIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  {formatRelativeDate(item.updatedAt)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 mb-4 opacity-20">
              <SvgIcon name="search" width="100%" height="100%" />
            </div>
            <p className="text-sm font-medium text-outline">{t("instructions.noResults", "Aucun résultat ne correspond à votre recherche")}</p>
            <p className="text-xs text-outline-variant mt-1">{t("instructions.noResultsHint", "Essayez de modifier vos mots-clés ou de créer une nouvelle instruction.")}</p>
          </div>
        )}
      </div>
    </section>
  );
};

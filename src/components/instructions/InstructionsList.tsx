import React from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Button } from "../Button";
import { Divider } from "@mui/material";

export interface Instruction {
  id: string;
  classId: number;
  className: string;
  content: string;
  updatedAt: string;
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
  return (
    <div className="flex flex-col h-[calc(100%+2rem)] -mx-6 -mt-12">
      {/* Top Section with Glass Effect and Demarcation */}
      <div className="glass-panel shadow-card bg-surface-container-lowest/70 border-b-2 border-outline-variant/30 px-6 pt-8 pb-4 flex flex-col gap-6 z-20">
        <div className="flex items-center justify-between">
          <h1 className="font-headline font-extrabold text-4xl text-primary tracking-tight">Instructions</h1>
          <Button
            variant="solid"
            onClick={onCreate}
            className="w-max px-2 rounded-md"
          >
            <AddRoundedIcon sx={{ fontSize: 24 }} />
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative group">
            <SearchRoundedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" sx={{ fontSize: 20 }} />
            <input 
              className="w-full pl-10 pr-4 py-3 bg-white outline border-outline/40 rounded-xl focus:outline-2 placeholder:text-outline transition-all text-sm" 
              placeholder="Rechercher une classe..." 
              type="text"
            />
          </div>
          
        </div>
      </div>

      {/* Scrollable List Section */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto flex flex-col gap-3 px-6 pt-4 pb-0 custom-scrollbar">
          {data.map((item) => {
            const active = item.id === selectedId;

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  active
                    ? "bg-surface-container-lowest shadow-sm border-l-4 border-teal-600"
                    : "bg-surface-container-lowest border border-outline-variant/40 shadow-card hover:bg-surface-container-low"
                } group border border-outline-variant/5`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                    active ? "text-teal-700 bg-tertiary-container" : "text-slate-500 bg-surface-container-highest"
                  }`}>
                    [{item.classId}] {item.className}
                  </span>
                  {/* <span className="text-[10px] text-outline font-medium uppercase">
                    MODIFIED {item.updatedAt}
                  </span> */}
                </div>
                <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                  {item.content || "Aucun contenu..."}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

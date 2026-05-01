import React, { useState, useEffect } from "react";
import type { Instruction } from "./InstructionsList";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { CustomEditor } from "./CustomEditor";
import { SelectField } from "../SelectField";
import { Button } from "../Button";

interface Props {
  instruction?: Instruction;
  isNew?: boolean;
  isActionLoading?: boolean;
  classes?: { id: number; name: string }[];
  onSave: (data: Instruction) => void;
  onDelete: (id: string) => void;
}

export const InstructionCore: React.FC<Props> = ({
  instruction,
  isNew,
  isActionLoading,
  classes = [],
  onSave,
  onDelete,
}) => {
  const [form, setForm] = useState<Instruction | undefined>(instruction);

  useEffect(() => {
    setForm(instruction);
  }, [instruction]);

  if (!form) {
    return <div className="p-10 text-gray-400">Aucune instruction sélectionnée</div>;
  }

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = parseInt(e.target.value);
    const selectedClass = classes.find((c) => c.id === classId);
    if (selectedClass) {
      setForm({ ...form, classId, className: selectedClass.name });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="glass-panel p-4 rounded-lg shadow-card border-1 border-outline-variant/30">
        <header className="flex justify-between items-center mb-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline font-bold text-2xl text-primary">
              Instruction • {form.className} (#{form.classId})
            </h2>
            <span className="text-xs font-medium text-outline uppercase tracking-widest">Instruction Layer</span>
          </div>
          {/* <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-on-surface-variant">ACTIVE</span>
            <div className="w-12 h-6 bg-teal-600 rounded-full relative cursor-pointer shadow-inner transition-colors">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
            </div>
          </div> */}
        </header>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <SelectField
            id="class-selection"
            label="Classe (Nom)"
            value={form.classId}
            onChange={handleClassChange}
            options={classes.map((c) => ({ label: c.name, value: c.id.toString() }))}
          />
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-outline tracking-widest uppercase ml-1">ID de la Classe</label>
            <input 
              className="w-full px-4 py-3 bg-surface-container-high/50 border-none rounded-xl text-on-surface-variant font-mono text-sm opacity-60 cursor-not-allowed" 
              disabled 
              type="text" 
              value={form.classId}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-0">
          <label className="text-[10px] font-bold text-outline tracking-widest uppercase ml-1 flex justify-between">
            Content
            <span className="font-mono lowercase normal-case opacity-60 tracking-normal italic text-[9px]">supports markdown syntax</span>
          </label>
          <div className="mb-8">
            <CustomEditor 
              value={form.content}
              onChange={(val) => setForm({ ...form, content: val })}
            />
          </div>
        </div>

        {/* Preview Area */}
        {/* <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <QueryStatsRoundedIcon sx={{ fontSize: 20 }} />
            <h3 className="text-xs font-bold tracking-widest uppercase">Aperçu rendu dans le prompt</h3>
          </div>
          <div className="font-mono text-xs text-on-surface-variant leading-loose bg-white/40 p-4 rounded-lg border border-white/60">
            &lt;instruction class="{form.className}" id="{form.classId}"&gt;<br/>
            {form.content.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}<br/>
              </React.Fragment>
            ))}<br/>
            &lt;/instruction&gt;
          </div>
        </div> */}

        <footer className="flex justify-between items-center pt-2 border-t border-surface-container-highest">
          <Button
            variant="danger"
            onClick={() => onDelete(form.id)}
            className="w-max px-4"
            disabled={isActionLoading}
            icon={<DeleteRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="left"
            btnClass="capitalize text-sm whitespace-nowrap rounded-md"
          >
            Supprimer
          </Button>

          <div className="flex items-center gap-4">
            <Button variant="ghost" disabled={isActionLoading}>Annuler</Button>
            <Button
              variant="solid"
              onClick={() => onSave(form)}
              className="px-4"
              btnClass="capitalize text-sm whitespace-nowrap rounded-md"
              disabled={isActionLoading}
              icon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
            >
              {isActionLoading ? "Traitement..." : (isNew ? "Créer l'instruction" : "Mettre à jour")}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { InstructionsList } from "../components/instructions/InstructionsList";
import { InstructionCore } from "../components/instructions/InstructionCore";
import type { Instruction } from "../components/instructions/InstructionsList";
import { DashboardLayoutNew } from "../components/layout/DashboardLayoutNew";
import { useMFilesDocsHook } from "../hooks/useMFilesDocsHook";
import { useInstructions } from "../hooks/useInstructions";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export const InstructionPage = () => {
  const { fetchVaultClasses } = useMFilesDocsHook();
  const { 
    instructions,
    fetchInstructions, 
    createInstruction, 
    updateInstruction, 
    deleteInstruction,
    isLoading: isActionLoading 
  } = useInstructions();

  const [selected, setSelected] = useState<Instruction | undefined>(undefined);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsInitialLoading(true);
      try {
        const [classList, instructionList] = await Promise.all([
          fetchVaultClasses(),
          fetchInstructions()
        ]);
        
        if (classList) setClasses(classList);
        if (instructionList && instructionList.instructions.length > 0) {
          setSelected(instructionList.instructions[0]);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    init();
  }, [fetchVaultClasses, fetchInstructions]);

  const handleSave = async (updated: Instruction) => {
    // Check if it's a new instruction (temporary ID from Date.now())
    const isNew = !instructions.find(i => i.id === updated.id);
    
    try {
      if (isNew) {
        const created = await createInstruction({
          classId: updated.classId,
          className: updated.className,
          content: updated.content
        });
        toast.success("Instruction créée avec succès");
        setLocalDraft(null);
        setSelected(created);
      } else {
        const result = await updateInstruction(updated.id, updated);
        toast.success("Instruction mise à jour avec succès");
        setSelected(result);
      }
    } catch (err: any) {
      toast.error(err || "Une erreur est survenue");
    }
  };

  const handleDelete = async (id: string) => {
    // If it's a local unsaved item (ID from Date.now())
    if (id.length > 15 || !instructions.find(i => i.id === id)) {
        setLocalDraft(null);
        if (instructions.length > 0) setSelected(instructions[0]);
        else setSelected(undefined);
        return;
    }

    try {
      await deleteInstruction(id);
      toast.success("Instruction supprimée");
      
      // Fluid selection: select the next available item in the current list
      const currentIndex = instructions.findIndex(i => i.id === id);
      const nextItem = instructions[currentIndex + 1] || instructions[currentIndex - 1];
      
      if (nextItem && nextItem.id !== id) {
        setSelected(nextItem);
      } else {
        const fallback = instructions.find(i => i.id !== id);
        setSelected(fallback);
      }
    } catch (err: any) {
      toast.error(err || "Erreur lors de la suppression");
    }
  };

  const [localDraft, setLocalDraft] = useState<Instruction | null>(null);

  const handleCreate = () => {
    const newItem: Instruction = {
      id: Date.now().toString(), // Temporary ID
      classId: classes[0]?.id || 0,
      className: classes[0]?.name || "New Class",
      content: "",
      updatedAt: "NOW",
    };

    setLocalDraft(newItem);
    setSelected(newItem);
  };

  const handleCoreChange = (updated: Instruction) => {
    setSelected(prev => {
        // Only update if something actually changed to avoid excessive re-renders
        if (prev?.id === updated.id && 
            (prev.content !== updated.content || prev.classId !== updated.classId || prev.className !== updated.className)) {
            return updated;
        }
        return prev;
    });
  };

  const combinedInstructions = (localDraft ? [localDraft, ...instructions] : instructions).map(inst => 
    inst.id === selected?.id ? selected : inst
  );

  return (
    <DashboardLayoutNew isFullWidth isChildPaddingBottom={false}>
      <div className="relative h-[calc(100vh-64px)] flex overflow-hidden  ">

        {isInitialLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-outline font-medium">Chargement des instructions...</p>
            </div>
          </div>
        ) : (
          <>
            <InstructionsList
              data={combinedInstructions}
              selectedId={selected?.id}
              onSelect={(i) => {
                setSelected(i);
                if (localDraft && i.id !== localDraft.id) setLocalDraft(null);
              }}
              onCreate={handleCreate}
            />
            {selected ? (
              <InstructionCore
                instruction={selected}
                allInstructions={instructions.map(i => ({ id: i.id, classId: i.classId }))}
                isNew={!instructions.find(i => i.id === selected.id)}
                isActionLoading={isActionLoading}
                classes={classes}
                onSave={handleSave}
                onDelete={handleDelete}
                onChange={handleCoreChange}
              />
            ) : (
              <section className="flex-1 bg-surface-container-lowest flex flex-col items-center justify-center text-center p-20 text-outline opacity-40">
                <p className="text-xl font-bold">Aucune instruction</p>
                <p className="text-sm mt-2">Cliquez sur Nouvelle pour en créer une.</p>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayoutNew>
  );
};

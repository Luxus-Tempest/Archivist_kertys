import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { InstructionsList } from "../components/instructions/InstructionsList";
import { InstructionCore } from "../components/instructions/InstructionCore";
import type { Instruction } from "../components/instructions/InstructionsList";
import { DashboardLayoutNew } from "../components/layout/DashboardLayoutNew";
import { useMFilesDocsHook } from "../hooks/useMFilesDocsHook";
import { useInstructions } from "../hooks/useInstructions";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { SvgIcon } from "../components/SvgIcon";

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
  const [localDraft, setLocalDraft] = useState<Instruction | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentId = searchParams.get("id");
  const { fetchInstructionById } = useInstructions();

  useEffect(() => {
    const init = async () => {
      setIsInitialLoading(true);
      try {
        const [classList] = await Promise.all([
          fetchVaultClasses(),
          fetchInstructions()
        ]);
        
        if (classList) setClasses(classList);
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    init();
  }, [fetchVaultClasses, fetchInstructions]);

  useEffect(() => {
    if (currentId) {
      // If it's a local draft (not in the list yet)
      const existing = instructions.find(i => i.id === currentId);
      if (existing) {
        // We could fetch details here if the list only has partial data
        fetchInstructionById(currentId).then(setSelected).catch(() => {
            // Fallback to existing list data if detail fetch fails
            setSelected(existing);
        });
      } else if (localDraft && localDraft.id === currentId) {
        setSelected(localDraft);
      } else {
        // Try fetching from server anyway (deep link case)
        fetchInstructionById(currentId).then(setSelected).catch(() => {
            setSelected(undefined);
        });
      }
    } else {
      setSelected(undefined);
    }
  }, [currentId, instructions, localDraft, fetchInstructionById]);

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
        await fetchInstructions();
        setSearchParams({ id: created.id });
      } else {
        const result = await updateInstruction(updated.id, updated);
        toast.success("Instruction mise à jour avec succès");
        await fetchInstructions();
        // keep the locally updated state to ensure UI remains fluid
        // even if backend response is minimal
        setSelected(updated);
      }
    } catch (err: any) {
      toast.error(err || "Une erreur est survenue");
    }
  };

  const handleDelete = async (id: string) => {
    console.log("Attempting to delete instruction with ID:", id);
    // If it's a local unsaved item (not yet in the server-provided instructions list)
    if (!instructions.find(i => i.id === id)) {
        console.log("Local draft detected, removing from state");
        setLocalDraft(null);
        if (instructions.length > 0) setSelected(instructions[0]);
        else setSelected(undefined);
        return;
    }

    try {
      console.log("Calling deleteInstruction API...");
      await deleteInstruction(id);
      toast.success("Instruction supprimée");
      await fetchInstructions();
      
      // Fluid selection: select the next available item in the current list
      const currentIndex = instructions.findIndex(i => i.id === id);
      const nextItem = instructions[currentIndex + 1] || instructions[currentIndex - 1];
      
      if (nextItem && nextItem.id !== id) {
        setSearchParams({ id: nextItem.id });
      } else {
        const fallback = instructions.find(i => i.id !== id);
        if (fallback) setSearchParams({ id: fallback.id });
        else setSearchParams({});
      }
    } catch (err: any) {
      toast.error(err || "Erreur lors de la suppression");
    }
  };



  const handleCreate = () => {
    const newItem: Instruction = {
      id: Date.now().toString(), // Temporary ID
      classId: classes[0]?.id || 0,
      className: classes[0]?.name || "New Class",
      content: "",
      updatedAt: "NOW",
    };

    setLocalDraft(newItem);
    setSearchParams({ id: newItem.id });
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
                setSearchParams({ id: i.id });
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
              <div className="flex-1 bg-surface-container-lowest flex flex-col items-center justify-center text-center p-20 animate-fade-in">
                <div className="w-24 h-24 mb-8 text-primary opacity-20 animate-bounce-subtle">
                  <SvgIcon name="click" width="100%" height="100%" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface mb-3">Prêt à configurer ?</h3>
                <p className="text-outline max-w-sm leading-relaxed">
                  Sélectionnez une instruction dans la liste à gauche pour la modifier, ou cliquez sur 
                  <span className="text-primary font-bold mx-1">Nouvelle</span> 
                  pour commencer une nouvelle configuration.
                </p>
                <div className="mt-10 flex gap-4">
                  <div className="px-4 py-2 bg-surface-container-high rounded-full text-[10px] font-bold text-outline uppercase tracking-widest border border-outline-variant/30">
                    Mode Consultation
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayoutNew>
  );
};

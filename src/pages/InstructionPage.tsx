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
  const [showToast, setShowToast] = useState(false);
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
        if (instructionList && instructionList.length > 0) {
          setSelected(instructionList[0]);
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
        await createInstruction({
          classId: updated.classId,
          className: updated.className,
          content: updated.content
        });
        toast.success("Instruction créée avec succès");
        setLocalDraft(null);
        // The slice handles updating the list
      } else {
        await updateInstruction(updated.id, updated);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err: any) {
      toast.error(err || "Une erreur est survenue");
    }
  };

  const handleDelete = async (id: string) => {
    // If it's a local unsaved item, it won't be in Redux yet (but wait, handleCreate adds it to local state? No, in Redux version we might need a local state for the new item or just use handles better)
    // Actually handleCreate in this context was adding it to 'data' which was local state.
    // Let's refine handleCreate to not touch Redux until save.
    
    // Check if ID is likely a temporary local ID
    if (id.length > 15) {
        // Since it's not in Redux, we need to handle this local UI state
        // But with Redux, we should ideally only show saved items in the list OR have a draft state.
        // For now, let's keep the local state for 'instructions' if we want to show drafts.
        // Or just let the user know we can't delete what's not saved yet (or just reset selected).
        setSelected(instructions[0]);
        return;
    }

    try {
      await deleteInstruction(id);
      toast.success("Instruction supprimée");
      if (instructions.length > 0) setSelected(instructions[0]);
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

  const combinedInstructions = localDraft ? [localDraft, ...instructions] : instructions;

  return (
    <DashboardLayoutNew isFullWidth isChildPaddingBottom={false}>
      <div className="relative h-[calc(100vh-64px)] flex overflow-hidden  ">
        {/* Success Toast */}
        {showToast && (
          <div className="fixed top-24 right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="glass-panel flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border border-teal-500/20">
              <CheckCircleRoundedIcon className="text-teal-600" sx={{ fontSize: 20 }} />
              <span className="font-body font-medium text-on-surface">Instruction enregistrée</span>
            </div>
          </div>
        )}

        {/* Zone 1: Instructions List (Fixed Sidebar) */}
        <aside className="w-[370px] shrink-0 h-full border-r border-outline-variant/20 bg-white flex flex-col overflow-hidden pt-8 px-6 pb-0 z-10">
          {isInitialLoading ? (
            <div className="flex flex-col gap-4 p-4 animate-pulse">
              <div className="h-10 bg-surface-container-low rounded-xl w-3/4"></div>
              <div className="h-24 bg-surface-container-low rounded-2xl w-full"></div>
              <div className="h-24 bg-surface-container-low rounded-2xl w-full"></div>
            </div>
          ) : (
            <InstructionsList
              data={combinedInstructions}
              selectedId={selected?.id}
              onSelect={(i) => {
                setSelected(i);
                if (localDraft && i.id !== localDraft.id) setLocalDraft(null);
              }}
              onCreate={handleCreate}
            />
          )}
        </aside>

        {/* Zone 2: Edition (Scrollable Content) */}
        <main className=" flex-1 h-full overflow-y-auto pt-8 px-8 pb-24   custom-scrollbar relative z-10">
          <div className="max-w-5xl mx-auto">
            {isInitialLoading ? (
               <div className="glass-panel p-8 h-96 flex flex-col gap-6 animate-pulse">
                  <div className="h-8 bg-surface-container-low rounded-lg w-1/2"></div>
                  <div className="h-64 bg-surface-container-low rounded-2xl w-full"></div>
               </div>
            ) : selected ? (
              <InstructionCore
                instruction={selected}
                isNew={!instructions.find(i => i.id === selected.id)}
                isActionLoading={isActionLoading}
                classes={classes}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-20 text-outline opacity-40">
                <p className="text-xl font-bold">Aucune instruction</p>
                <p className="text-sm mt-2">Cliquez sur le bouton + pour en créer une nouvelle.</p>
              </div>
            )}
          </div>
        </main>

        {/* Visual Polish: Light gradients for soul */}
        <div className="fixed -bottom-64 -right-64 w-[512px] h-[512px] bg-teal-600/5 blur-[120px] pointer-events-none rounded-full z-0"></div>
        <div className="fixed -top-64 -left-64 w-[512px] h-[512px] bg-primary/5 blur-[120px] pointer-events-none rounded-full z-0"></div>
      </div>
    </DashboardLayoutNew>
  );
};

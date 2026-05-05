import { useTranslation, Trans } from "react-i18next";
import { InstructionsList } from "../components/instructions/InstructionsList";
import { InstructionCore } from "../components/instructions/InstructionCore";
import type { Instruction } from "../components/instructions/InstructionsList";
import { DashboardLayoutNew } from "../components/layout/DashboardLayoutNew";
import { useMFilesDocsHook } from "../hooks/useMFilesDocsHook";
import { useInstructions } from "../hooks/useInstructions";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { SvgIcon } from "../components/SvgIcon";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export const InstructionPage = () => {
  const { t } = useTranslation();
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [duplicatingData, setDuplicatingData] = useState<Instruction | null>(null);
  
  const mode = searchParams.get("mode");
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
    if (mode === "create") {
      const newItem: Instruction = {
        id: "draft_new",
        classId: duplicatingData?.classId || classes[0]?.id || 0,
        className: duplicatingData?.className || classes[0]?.name || t("instructions.newInstruction", "New Class"),
        content: duplicatingData?.content || "",
        updatedAt: "NOW",
      };
      setSelected(newItem);
      if (duplicatingData) setDuplicatingData(null);
    } else if (currentId) {
      const existing = instructions.find(i => i.id === currentId);
      if (existing) {
        setSelected(existing);
      } else {
        fetchInstructionById(currentId).then(setSelected).catch(() => {
          setSelected(undefined);
          setSearchParams({});
        });
      }
    } else {
      setSelected(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, currentId, instructions, classes, fetchInstructionById, t]);

  const handleSave = async (updated: Instruction) => {
    const isNew = mode === "create";
    
    try {
      if (isNew) {
        const created = await createInstruction({
          classId: updated.classId,
          className: updated.className,
          content: updated.content
        });
        toast.success(t("instructions.toasts.createSuccess", "Instruction créée avec succès"));
        await fetchInstructions();
        setSearchParams({ mode: "view", id: created.entity.id });
      } else {
        await updateInstruction(updated.id, updated);
        toast.success(t("instructions.toasts.updateSuccess", "Instruction mise à jour avec succès"));
        await fetchInstructions();
        setSelected(updated);
      }
    } catch (err: any) {
      toast.error(err || t("instructions.toasts.error", "Une erreur est survenue"));
    }
  };

  const handleDelete = async (id: string) => {
    if (mode === "create") {
        setSearchParams({});
        return;
    }

    try {
      await deleteInstruction(id);
      toast.success(t("instructions.toasts.deleteSuccess", "Instruction supprimée"));
      await fetchInstructions();
      
      const currentIndex = instructions.findIndex(i => i.id === id);
      const nextItem = instructions[currentIndex + 1] || instructions[currentIndex - 1];
      
      if (nextItem) {
        setSearchParams({ mode: "view", id: nextItem.id });
      } else {
        setSearchParams({});
      }
    } catch (err: any) {
      toast.error(err || t("instructions.toasts.deleteError", "Erreur lors de la suppression"));
    }
  };

  const handleCreate = () => {
    setDuplicatingData(null);
    setSearchParams({ mode: "create" });
  };

  const handleDuplicate = (item: Instruction) => {
    setDuplicatingData(item);
    setSearchParams({ mode: "create" });
  };

  const handleCoreChange = (updated: Instruction) => {
    setSelected(prev => {
        if (prev?.id === updated.id && 
            (prev.content !== updated.content || prev.classId !== updated.classId || prev.className !== updated.className)) {
            return updated;
        }
        return prev;
    });
  };

  const combinedInstructions = mode === "create" && selected 
    ? [selected, ...instructions.filter(i => i.id !== "draft_new")] 
    : instructions.filter(i => i.id !== "draft_new");

  return (
    <DashboardLayoutNew isFullWidth isChildPaddingBottom={false}>
      <div className="relative h-[calc(100vh-64px)] flex overflow-hidden  ">

        {isInitialLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-outline font-medium">{t("instructions.loading", "Chargement des instructions...")}</p>
            </div>
          </div>
        ) : (
          <>
            <InstructionsList
              data={combinedInstructions}
              selectedId={mode === "create" ? "draft_new" : selected?.id}
              onSelect={(i) => {
                setSearchParams({ mode: "view", id: i.id });
              }}
              onCreate={handleCreate}
            />
            {selected ? (
              <InstructionCore
                instruction={selected}
                allInstructions={instructions.map(i => ({ id: i.id, classId: i.classId }))}
                isNew={mode === "create"}
                isActionLoading={isActionLoading}
                classes={classes}
                onSave={handleSave}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onChange={handleCoreChange}
              />
            ) : (
              <div className="flex-1 bg-surface-container-lowest flex flex-col items-center justify-center text-center p-20 animate-fade-in">
                <div className="w-24 h-24 mb-8 text-primary opacity-20 animate-bounce-subtle">
                  <SvgIcon name="click" width="100%" height="100%" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface mb-3">{t("instructions.readyToConfigure", "Prêt à configurer ?")}</h3>
                <p className="text-outline max-w-sm leading-relaxed">
                  {/* <Trans i18nKey="instructions.readyHint">
                    Sélectionnez une instruction dans la liste à gauche pour la modifier, ou cliquez sur 
                    <span className="text-primary font-bold mx-1">Nouvelle</span> 
                    pour commencer une nouvelle configuration.
                  </Trans> */}
                  <Trans
                    i18nKey="instructions.readyHint"
                    values={{ name: t("instructions.newInstruction") }}
                    components={[<span className="font-semibold" />]}
                  />

                </p>
                <div className="mt-10 flex gap-4">
                  <div className="px-4 py-2 bg-surface-container-high rounded-full text-[10px] font-bold text-outline uppercase tracking-widest border border-outline-variant/30">
                    {t("instructions.consultationMode", "Mode Consultation")}
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

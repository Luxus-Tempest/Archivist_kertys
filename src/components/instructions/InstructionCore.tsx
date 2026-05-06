import React, { useState, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import type { Instruction } from "./InstructionsList";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import { CustomEditor } from "./CustomEditor";
import { Button } from "../Button";
import { SelectField } from "../SelectField";
import { Menu } from "../Menu";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { instructionSchema } from "../../utils/validations/instruction.validation";
import { Input } from "../Input";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";

export interface InstructionsIds extends Pick<Instruction, "id" | "classId"> { }

interface Props {
  instruction?: Instruction;
  allInstructions?: InstructionsIds[];
  isNew?: boolean;
  isActionLoading?: boolean;
  classes?: { id: number; name: string }[];
  onSave: (data: Instruction) => Promise<void> | void;
  onDelete: (id: string) => void;
  onDuplicate?: (data: Instruction) => void;
  onChange?: (data: Instruction) => void;
}

export const InstructionCore: React.FC<Props> = ({
  instruction,
  allInstructions = [],
  isNew,
  isActionLoading,
  classes = [],
  onSave,
  onDelete,
  onDuplicate,
  onChange,
}) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset, setValue, watch, formState: { isValid, isSubmitting } } = useForm<Instruction>({
    resolver: zodResolver(instructionSchema) as any,
    defaultValues: instruction,
    mode: "all"
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    reset(instruction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instruction?.id, reset]);

  const watchedForm = watch();

  useEffect(() => {
    if (onChange && watchedForm && Object.keys(watchedForm).length > 0) {
      onChange(watchedForm);
    }
  }, [watchedForm, onChange]);

  if (!watchedForm || Object.keys(watchedForm).length === 0) {
    return <div className="p-10 text-gray-400">{t("instructions.emptySelection", "Aucune instruction sélectionnée")}</div>;
  }

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = parseInt(e.target.value);
    const selectedClass = classes.find((c) => c.id === classId);
    if (selectedClass) {
      setValue("classId", classId, { shouldValidate: true });
      setValue("className", selectedClass.name);
    }
  };

  const onSubmit: SubmitHandler<Instruction> = async (data) => {
    await onSave(data);
  };

  const saveText = isNew ? t("instructions.save", "Enregistrer") : t("instructions.update", "Mettre à jour");
  const disableActions = isActionLoading || isSubmitting;

  return (
    <section className="flex-1 bg-surface-container-lowest flex flex-col overflow-hidden relative h-full">
      {/* Editor Header */}
      <div className="px-8 py-3 flex items-center justify-between border-b border-outline-variant/40 shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-headline text-lg font-bold text-primary">
              {isNew 
                ? t("instructions.newInstruction", "Nouvelle instruction") 
                : t("instructions.editInstruction", "Editer : {{className}} (#{{classId}})", { className: watchedForm.className, classId: watchedForm.classId })
              }
            </h3>
            <p className="text-xs text-outline font-medium">{t("instructions.configRules", "Configuration des règles globales d'extraction des données")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex justify-end w-full sm:w-max gap-2">
            <Button 
              variant="ghost"
              onClick={() => {
                reset(instruction);
              }}
              disabled={disableActions}
              className="w-max px-4"
              btnClass="rounded-md text-sm py-1"
              iconPosition="left"
            >
              {t("instructions.cancel", "Annuler")}
            </Button>
            <div className="flex-1"></div>

            <Button 
              variant="solid"
              onClick={handleSubmit(onSubmit)}
              disabled={disableActions || !isValid}
              className="w-max px-3"
              btnClass="rounded-md text-xs py-1"
              icon={isSubmitting ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <SaveRoundedIcon sx={{ fontSize: 15 }} />
              )}
              iconPosition="left"
            >
              {isSubmitting ? t("instructions.saving", "En cours...") : saveText}
            </Button>
          </div>
          <div className="relative">
            <Button 
              variant="ghost" 
              className="text-on-surface-variant px-3"
              btnClass="rounded-md text-xs py-1 hover:bg-surface-container-highest"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              disabled={disableActions}
              icon={<MoreVertRoundedIcon sx={{ fontSize: 20 }} />}
              iconPosition="left"
            >
            </Button>
            <Menu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              align="right"
              items={[
                ...(!isNew ? [{
                  label: t("instructions.duplicate", "Dupliquer"),
                  icon: <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />,
                  onClick: () => {
                    setIsMenuOpen(false);
                    if (onDuplicate) onDuplicate(watchedForm);
                  }
                }] : []),
                {
                  label: t("instructions.delete", "Supprimer"),
                  icon: <DeleteRoundedIcon sx={{ fontSize: 18 }} />,
                  onClick: () => {
                    setIsMenuOpen(false);
                    setIsDeleteModalOpen(true);
                  },
                  variant: "danger" as const
                }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Basic Info Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Input
              id="class-id"
              label={t("instructions.classId", "Class ID")}
              type="number"
              inputClassName="font-mono text-sm opacity-60 cursor-not-allowed bg-surface-container-low"
              readOnly
              value={watchedForm.classId || ""}
            />
            
            <Controller
              name="classId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <SelectField
                  id="class-name"
                  label={t("instructions.className", "Class Name")}
                  className="md:col-span-3"
                  inputClassName="font-headline font-bold text-sm bg-surface-container-low"
                  value={field.value?.toString() || ""}
                  onChange={handleClassChange}
                  options={classes.map((c) => ({ 
                    label: c.name, 
                    value: c.id.toString(),
                    disabled: allInstructions.some(inst => inst.classId === c.id && inst.id !== instruction?.id)
                  }))}
                  error={error?.message}
                  readOnly={!isNew}
                />
              )}
            />
          </div>

          {/* Rich Text Editor Container */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary uppercase tracking-wider block">{t("instructions.instructionContent", "Instruction Content")}</label>
            <Controller
              name="content"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <CustomEditor 
                    value={field.value || ""}
                    onChange={field.onChange}
                    classId={watchedForm.classId}
                    className={watchedForm.className}
                    height="h-[300px]"
                  />
                  {error && <p className="text-xs text-error mt-2 ml-1">{error.message}</p>}
                </div>
              )}
            />
          </div>

          {/* Preview Section */}
          <div className="bg-surface-container-high/40 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                <PsychologyRoundedIcon />
              </span>
              <h4 className="font-headline font-bold text-sm text-on-surface">{t("instructions.preview", "Aperçu")}</h4>
            </div>
            <div className="bg-[#1a1f2e] text-slate-300 p-5 rounded-xl font-mono text-[11px] leading-[1.8] shadow-lg overflow-x-auto">
              {/* Ligne commentaire */}
              <div><span className="text-slate-500">// SYSTEM_PROMPT_INJECTION</span></div>

              {/* rule_set ouvrant */}
              <div>
                <span className="text-teal-400">&lt;rule_set</span>
                {" "}<span className="text-amber-400">id</span>
                <span className="text-slate-400">=&quot;</span>
                <span className="text-orange-300">{watchedForm.classId}</span>
                <span className="text-slate-400">&quot;</span>
                {" "}<span className="text-amber-400">name</span>
                <span className="text-slate-400">=&quot;</span>
                <span className="text-orange-300">{watchedForm.className}</span>
                <span className="text-slate-400">&quot;</span>
                <span className="text-teal-400">&gt;</span>
              </div>

              {/* Contenu parsé */}
              {(() => {
                const raw = watchedForm.content || "";
                const giMatch  = raw.match(/<GlobalInstruction>([\s\S]*?)<\/GlobalInstruction>/);
                const propMatches = [...raw.matchAll(/<Property name="([^"]*)">([\s\S]*?)<\/Property>/g)];

                // Fallback: ancien format plain text
                if (!giMatch && propMatches.length === 0) {
                  return raw.split("\n").map((line: string, i: number) => (
                    <div key={i} className="pl-4 text-slate-300">{line || "\u00a0"}</div>
                  ));
                }

                return (
                  <>
                    {/* GlobalInstruction */}
                    {giMatch && (
                      <div className="pl-4">
                        <span className="text-teal-400">&lt;GlobalInstruction&gt;</span>
                        {giMatch[1].split("\n").map((l: string, i: number) => (
                          <div key={i} className="pl-4 text-slate-200">{l || "\u00a0"}</div>
                        ))}
                        <span className="text-teal-400">&lt;/GlobalInstruction&gt;</span>
                      </div>
                    )}

                    {/* Property blocks */}
                    {propMatches.map((m, i) => (
                      <div key={i} className="pl-4">
                        <span className="text-teal-400">&lt;Property</span>
                        {" "}<span className="text-amber-400">name</span>
                        <span className="text-slate-400">=&quot;</span>
                        <span className="text-orange-300">{m[1]}</span>
                        <span className="text-slate-400">&quot;</span>
                        <span className="text-teal-400">&gt;</span>
                        {m[2].split("\n").map((l: string, j: number) => (
                          <div key={j} className="pl-4 text-slate-200">{l || "\u00a0"}</div>
                        ))}
                        <span className="text-teal-400">&lt;/Property&gt;</span>
                      </div>
                    ))}
                  </>
                );
              })()}

              {/* rule_set fermant */}
              <div><span className="text-teal-400">&lt;/rule_set&gt;</span></div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(watchedForm.id!);
          setIsDeleteModalOpen(false);
        }}
        description={
          <Trans
            i18nKey="instructions.deleteDescription"
            values={{ name: watchedForm.className }}
            components={[<span className="font-semibold" />]}
          />
        }
      />
    </section>
  );
};
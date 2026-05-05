import { useTranslation } from "react-i18next";
import { CustomModal } from "../CustomModal";
import { Button } from "../Button";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  question?: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  question,
  description,
  confirmLabel,
  cancelLabel,
}) => {
  const { t } = useTranslation();
  
  const displayTitle = title || t("instructions.deleteConfirmTitle", "Confirmer la suppression");
  const displayQuestion = question || t("instructions.deleteConfirmQuestion", "Êtes-vous sûr ?");
  const displayConfirmLabel = confirmLabel || t("instructions.deleteConfirmButton", "Oui, supprimer");
  const displayCancelLabel = cancelLabel || t("instructions.cancel", "Annuler");

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={displayTitle}
      width={400}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-sm font-medium"
          >
            {displayCancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
            }}
            btnClass="rounded-md"
            className="text-xs"
          >
            {displayConfirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center">
          <DeleteRoundedIcon fontSize="medium" />
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-on-surface">{displayQuestion}</h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </CustomModal>
  );
};

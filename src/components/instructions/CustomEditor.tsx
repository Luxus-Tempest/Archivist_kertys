import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatItalicRoundedIcon from "@mui/icons-material/FormatItalicRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulleted";

interface CustomEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export const CustomEditor: React.FC<CustomEditorProps> = ({
  value,
  onChange,
  placeholder,
  height = "h-40",
}) => {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [selection, setSelection] = useState(false);
  
  const displayPlaceholder = placeholder || t("instructions.editorPlaceholder", "Saisissez vos instructions...");

  const btn =
    "w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 text-outline/70 hover:text-primary hover:bg-surface-container-high/60 active:scale-95";

  return (
    <div
      className={`
        relative flex flex-col rounded-lg overflow-hidden
        border transition-all duration-300
        bg-gradient-to-b from-surface-container-lowest to-surface
        ${
          focused
            ? "border-primary/30 shadow-[0_0_0_4px_rgba(0,150,136,0.08)]"
            : "border-outline/10"
        }
      `}
    >
      {/* EDITOR SURFACE */}
      <div className="relative flex-1">
        {/* subtle “paper glow” effect */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_0%,rgba(0,150,136,0.06),transparent_60%)]" />

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSelect={() => setSelection(true)}
          onKeyUp={() => setSelection(false)}
          placeholder={displayPlaceholder}
          className={`
            relative z-10 w-full ${height}
            px-7 py-6
            bg-transparent
            resize-none outline-none
            text-[14px] leading-relaxed
            text-on-surface
            placeholder:text-outline/40
            font-[450]
            tracking-[0.01em]
          `}
        />

        {/* bottom fade hint (scroll depth perception) */}
        <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
      </div>

      {/* subtle status bar */}
      <div className="flex items-center justify-between px-5 py-2 text-[10px] text-outline/60 border-t border-outline/10">
        <span>{t("instructions.editorChars", "{{count}} caractères", { count: value.length })}</span>
        <span className={focused ? "text-primary/60" : ""}>
          {focused ? t("instructions.editorStatus.editing", "édition") : t("instructions.editorStatus.idle", "en attente")}
        </span>
      </div>
    </div>
  );
};
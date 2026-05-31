"use client";

import type { LanguageCode } from "@/lib/game-data";
import { languageOptions } from "@/lib/i18n";

type LanguageToggleProps = {
  language: LanguageCode;
  label: string;
  onChange: (language: LanguageCode) => void;
};

export default function LanguageToggle({
  language,
  label,
  onChange,
}: LanguageToggleProps) {
  return (
    <div
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-white/90 p-1 shadow-sm"
      role="group"
    >
      {languageOptions.map((option) => {
        const isSelected = option.code === language;

        return (
          <button
            key={option.code}
            aria-label={`${label}: ${option.label}`}
            aria-pressed={isSelected}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-full text-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 ${
              isSelected
                ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                : "text-rose-700 hover:bg-rose-50"
            }`}
            title={option.tooltip}
            type="button"
            onClick={() => onChange(option.code)}
          >
            <span aria-hidden="true">{option.flag}</span>
            <span className="sr-only">{option.shortLabel}</span>
            <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-rose-950 px-3 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
              {option.tooltip}
            </span>
          </button>
        );
      })}
    </div>
  );
}

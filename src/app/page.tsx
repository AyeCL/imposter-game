"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiHeart, FiUsers } from "react-icons/fi";
import LanguageToggle from "@/app/components/LanguageToggle";
import {
  DEFAULT_LANGUAGE,
  STORAGE_KEY,
  normalizeSetupState,
  type LanguageCode,
} from "@/lib/game-data";
import { getCopy } from "@/lib/i18n";

const loadLanguage = (): LanguageCode => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_LANGUAGE;

  try {
    return normalizeSetupState(JSON.parse(raw)).language;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

const saveLanguage = (language: LanguageCode) => {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  let setup = normalizeSetupState(null);

  try {
    setup = raw ? normalizeSetupState(JSON.parse(raw)) : setup;
  } catch {
    setup = normalizeSetupState(null);
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...setup, language })
  );
};

export default function Home() {
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const copy = getCopy(language);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLanguage(loadLanguage());
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const updateLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    saveLanguage(nextLanguage);
  };

  return (
    <div className="min-h-screen nepal-sky text-[#fffdf3]">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 h-7 w-full opacity-70 nepal-prayer-flags" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full opacity-70 nepal-hills" />

        <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 py-20 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-600 shadow-sm nepal-dhaka">
              <FiHeart />
              {copy.home.eyebrow}
            </span>
            <LanguageToggle
              label={copy.languageLabel}
              language={language}
              onChange={updateLanguage}
            />
          </div>
          <Image
            src="/nepali-imposter-logo.png"
            alt={copy.appName}
            width={180}
            height={180}
            priority
            className="h-36 w-36 object-contain drop-shadow-[0_18px_30px_rgba(0,56,147,0.18)] sm:h-44 sm:w-44"
          />
          <h1 className="font-[var(--font-display)] text-4xl font-semibold text-[#fffdf3] drop-shadow-[0_3px_10px_rgba(6,20,54,0.55)] sm:text-6xl">
            {copy.home.title}
          </h1>
          <p className="max-w-2xl text-base text-[#fff3c8] drop-shadow-[0_2px_8px_rgba(6,20,54,0.5)] sm:text-lg">
            {copy.home.intro}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
              href="/setup"
            >
              {copy.home.startSetup} <FiArrowRight />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-6 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300"
              href="/round"
            >
              {copy.home.jumpToRound} <FiUsers />
            </Link>
          </div>

          <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
            {copy.home.steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/70 bg-white/80 p-4 text-left text-sm text-rose-700 shadow-sm nepal-dhaka"
              >
                <p className="font-semibold text-rose-900">{step.title}</p>
                <p className="mt-1">{step.body}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

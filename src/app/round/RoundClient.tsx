"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiEye,
  FiHeart,
  FiRefreshCw,
  FiShield,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import LanguageToggle from "@/app/components/LanguageToggle";
import {
  DEFAULT_IMPOSTER_COUNT,
  DEFAULT_LANGUAGE,
  STORAGE_KEY,
  normalizeImposterCount,
  normalizeSetupState,
  type Category,
  type LanguageCode,
  type Player,
  type SetupState,
} from "@/lib/game-data";
import { getCategoryDisplayName, getCopy } from "@/lib/i18n";

type Round = {
  id: string;
  categoryId: string;
  word: string;
  imposterIds: string[];
  order: string[];
  currentIndex: number;
  revealOpen: boolean;
  completed: boolean;
};

const loadSetupState = (): SetupState | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalizeSetupState(JSON.parse(raw));
  } catch {
    return null;
  }
};

const makeId = () => `round-${Math.random().toString(36).slice(2, 9)}`;

const shuffle = (items: string[]) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[nextIndex]] = [
      shuffled[nextIndex],
      shuffled[index],
    ];
  }
  return shuffled;
};

export default function RoundClient() {
  const searchParams = useSearchParams();
  const autoStart = searchParams.get("autostart") === "1";
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [roundError, setRoundError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  const language = setup?.language ?? DEFAULT_LANGUAGE;
  const copy = getCopy(language);

  useEffect(() => {
    const stored = loadSetupState();
    const timeout = setTimeout(() => {
      setSetup(stored ?? normalizeSetupState(null));
      setHasLoaded(true);
    }, 0);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const players = useMemo(() => setup?.players ?? [], [setup]);
  const categories = useMemo(() => setup?.categories ?? [], [setup]);
  const activePlayers = useMemo(
    () => players.filter((player) => player.active),
    [players]
  );
  const imposterCount = useMemo(
    () =>
      normalizeImposterCount(
        setup?.imposterCount ?? DEFAULT_IMPOSTER_COUNT,
        activePlayers.length
      ),
    [activePlayers.length, setup?.imposterCount]
  );
  const selectedCategories = useMemo(
    () => categories.filter((category) => category.selected),
    [categories]
  );
  const eligibleCategories = useMemo(
    () => selectedCategories.filter((category) => category.words.length > 0),
    [selectedCategories]
  );

  const roundCategory = useMemo<Category | null>(() => {
    if (!round) return null;
    return categories.find((category) => category.id === round.categoryId) ?? null;
  }, [categories, round]);

  const roundCategoryName = roundCategory
    ? getCategoryDisplayName(language, roundCategory.id, roundCategory.name)
    : null;

  const currentRoundPlayer = useMemo<Player | null>(() => {
    if (!round || round.completed) return null;
    const playerId = round.order[round.currentIndex];
    return players.find((player) => player.id === playerId) ?? null;
  }, [players, round]);

  const isCurrentPlayerImposter = useMemo(
    () =>
      Boolean(
        round &&
          currentRoundPlayer &&
          round.imposterIds.includes(currentRoundPlayer.id)
      ),
    [currentRoundPlayer, round]
  );

  const canStart =
    activePlayers.length >= 3 &&
    imposterCount <= activePlayers.length - 1 &&
    eligibleCategories.length > 0 &&
    hasLoaded;

  const updateLanguage = (nextLanguage: LanguageCode) => {
    const nextSetup = {
      ...(setup ?? normalizeSetupState(null)),
      language: nextLanguage,
    };

    setSetup(nextSetup);
    setRoundError(null);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSetup));
    }
  };

  const startRound = useCallback(() => {
    if (!canStart) {
      setRoundError(
        activePlayers.length < 3
          ? copy.setup.needsPlayers
          : imposterCount > activePlayers.length - 1
            ? copy.setup.needsImposterCap
            : copy.setup.needsCategory
      );
      setRound(null);
      return;
    }
    const chosenCategory =
      eligibleCategories[Math.floor(Math.random() * eligibleCategories.length)];
    const chosenWord =
      chosenCategory.words[
        Math.floor(Math.random() * chosenCategory.words.length)
      ];
    const order = shuffle(activePlayers.map((player) => player.id));
    const imposterIds = shuffle(order).slice(0, imposterCount);
    setRound({
      id: makeId(),
      categoryId: chosenCategory.id,
      word: chosenWord,
      imposterIds,
      order,
      currentIndex: 0,
      revealOpen: false,
      completed: false,
    });
    setRoundError(null);
    setShowRoles(false);
  }, [activePlayers, canStart, copy, eligibleCategories, imposterCount]);

  useEffect(() => {
    if (!autoStart || autoStarted || !canStart) return;
    const timeout = setTimeout(() => {
      startRound();
      setAutoStarted(true);
    }, 0);
    return () => {
      clearTimeout(timeout);
    };
  }, [autoStart, autoStarted, canStart, startRound]);

  const revealRole = () => {
    setRound((prev) =>
      prev ? { ...prev, revealOpen: true, completed: false } : prev
    );
  };

  const nextPlayer = () => {
    setRound((prev) => {
      if (!prev) return prev;
      if (prev.currentIndex >= prev.order.length - 1) {
        return { ...prev, revealOpen: false, completed: true };
      }
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        revealOpen: false,
      };
    });
  };

  const resetRound = () => {
    setRound(null);
    setRoundError(null);
    setAutoStarted(false);
    setShowRoles(false);
  };

  return (
    <div className="min-h-screen nepal-sky text-rose-900">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 h-7 w-full opacity-70 nepal-prayer-flags" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full opacity-70 nepal-hills" />

        <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10">
          <header className="flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-[0_22px_70px_rgba(0,56,147,0.28)] backdrop-blur nepal-dhaka">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/setup"
                    className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-500"
                  >
                    <FiArrowLeft /> {copy.round.backToSetup}
                  </Link>
                  <LanguageToggle
                    label={copy.languageLabel}
                    language={language}
                    onChange={updateLanguage}
                  />
                </div>
                <h1 className="font-[var(--font-display)] text-4xl font-semibold text-rose-950 sm:text-5xl">
                  {copy.round.title}
                </h1>
                <p className="max-w-2xl text-base text-rose-700 sm:text-lg">
                  {copy.round.intro}
                </p>
              </div>
              <div className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-rose-100 bg-white/90 p-4 text-sm text-rose-700 nepal-dhaka">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <FiUsers /> {copy.common.players}
                  </span>
                  <span>{activePlayers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <FiShield /> {copy.common.imposters}
                  </span>
                  <span>{imposterCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <FiStar /> {copy.common.categories}
                  </span>
                  <span>{eligibleCategories.length}</span>
                </div>
                <button
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
                  type="button"
                  onClick={startRound}
                >
                  {copy.round.newRound} <FiRefreshCw />
                </button>
                {roundError ? (
                  <p className="text-xs font-semibold text-rose-500">
                    {roundError}
                  </p>
                ) : (
                  <p className="text-xs text-rose-500">
                    {copy.round.editHint}
                  </p>
                )}
              </div>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-rose-100 bg-white/85 p-8 shadow-[0_18px_50px_rgba(0,56,147,0.18)] backdrop-blur nepal-dhaka">
              {round ? (
                round.completed ? (
                  <div className="flex flex-col gap-4">
                    <div className="rounded-2xl bg-rose-50/80 px-4 py-4 text-sm">
                      <p className="text-base font-semibold text-rose-900">
                        {copy.round.everyoneReady}
                      </p>
                      <p className="mt-1 text-sm text-rose-600">
                        {copy.round.startQuestions}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-white px-4 py-4 text-sm text-rose-600">
                      <p className="font-semibold text-rose-900">
                        {copy.round.endRevealTitle}
                      </p>
                      <p className="mt-1 text-sm text-rose-500">
                        {copy.round.endRevealHint}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                          type="button"
                          onClick={() => setShowRoles((prev) => !prev)}
                        >
                          {showRoles
                            ? copy.round.hideRoles
                            : copy.round.showRoles}
                        </button>
                      </div>
                    </div>
                    {showRoles ? (
                      <div className="rounded-2xl border border-rose-100 bg-white px-4 py-4 text-sm text-rose-700">
                        <div className="flex items-center justify-between text-xs text-rose-500">
                          <span>{copy.round.finalRoles}</span>
                          <span>
                            {copy.round.imposterCount(round.imposterIds.length)}{" "}
                            · {roundCategoryName ?? "-"}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2">
                          {round.order.map((playerId) => {
                            const player = players.find(
                              (item) => item.id === playerId
                            );
                            const isImposter =
                              round.imposterIds.includes(playerId);
                            return (
                              <div
                                key={playerId}
                                className="flex items-center justify-between rounded-2xl bg-rose-50/70 px-3 py-2 text-xs"
                              >
                                <span className="flex items-center gap-2 font-semibold text-rose-900">
                                  <span className="text-base">
                                    {player?.emoji ?? "❓"}
                                  </span>
                                  {player?.name ?? copy.common.player}
                                </span>
                                <span className="text-rose-600">
                                  {isImposter
                                    ? copy.common.imposterRole
                                    : round.word}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                        type="button"
                        onClick={startRound}
                      >
                        {copy.round.newRound} <FiRefreshCw />
                      </button>
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-300"
                        type="button"
                        onClick={resetRound}
                      >
                        {copy.round.clear}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs text-rose-500">
                      <span>
                        {copy.common.player} {round.currentIndex + 1} /{" "}
                        {round.order.length}
                      </span>
                      <span>
                        {copy.common.category}: {roundCategoryName ?? "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 rounded-3xl bg-rose-50/80 px-5 py-4">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                        {currentRoundPlayer?.emoji ?? "❓"}
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-rose-900">
                          {currentRoundPlayer?.name ?? copy.common.player}
                        </p>
                        <p className="text-sm text-rose-600">
                          {copy.round.keepPhone}
                        </p>
                      </div>
                    </div>

                    {round.revealOpen ? (
                      isCurrentPlayerImposter ? (
                        <div className="rounded-2xl border border-rose-100 bg-white px-4 py-4">
                          <p className="text-sm font-semibold text-rose-900">
                            {copy.round.imposterMessage(
                              round.imposterIds.length
                            )}
                          </p>
                          <p className="mt-1 text-xs text-rose-500">
                            {copy.common.category}: {roundCategoryName ?? "-"}
                          </p>
                          <p className="mt-2 text-sm text-rose-600">
                            {copy.round.blendIn}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-rose-100 bg-white px-4 py-4">
                          <p className="text-sm font-semibold text-rose-900">
                            {copy.round.secretWord}
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-rose-900">
                            {round.word}
                          </p>
                          <p className="mt-1 text-xs text-rose-500">
                            {copy.common.category}: {roundCategoryName ?? "-"}
                          </p>
                        </div>
                      )
                    ) : (
                      <button
                        className="w-full rounded-2xl border border-dashed border-rose-200 bg-white/90 px-4 py-4 text-left text-sm text-rose-500 transition hover:border-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
                        type="button"
                        onClick={revealRole}
                      >
                        {copy.round.tapReveal}
                      </button>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {round.revealOpen ? (
                        <button
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                          type="button"
                          onClick={nextPlayer}
                        >
                          {round.currentIndex >= round.order.length - 1
                            ? copy.round.finishRound
                            : copy.round.nextPlayer}
                        </button>
                      ) : (
                        <button
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                          type="button"
                          onClick={revealRole}
                        >
                          {copy.round.revealRole} <FiEye />
                        </button>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl bg-rose-50/80 px-4 py-4 text-sm">
                    <p className="text-base font-semibold text-rose-900">
                      {copy.round.noRound}
                    </p>
                    <p className="mt-1 text-sm text-rose-600">
                      {copy.round.startShuffle}
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                    type="button"
                    onClick={startRound}
                  >
                    {copy.common.startRound} <FiRefreshCw />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-rose-100 bg-white/85 p-6 shadow-[0_18px_50px_rgba(0,56,147,0.18)] backdrop-blur nepal-dhaka">
                <h2 className="flex items-center gap-2 font-[var(--font-display)] text-2xl text-rose-900">
                  <FiHeart /> {copy.round.checklistTitle}
                </h2>
                <p className="mt-2 text-sm text-rose-600">
                  {copy.round.checklistHint}
                </p>
                <div className="mt-4 grid gap-3 text-sm text-rose-700">
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50/80 px-4 py-3">
                    <span>{copy.round.activePlayers}</span>
                    <span className="font-semibold">
                      {activePlayers.length} / {players.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50/80 px-4 py-3">
                    <span>{copy.common.imposters}</span>
                    <span className="font-semibold">{imposterCount}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50/80 px-4 py-3">
                    <span>{copy.setup.selectedCategories}</span>
                    <span className="font-semibold">
                      {selectedCategories.length} / {categories.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50/80 px-4 py-3">
                    <span>{copy.round.wordsAvailable}</span>
                    <span className="font-semibold">
                      {eligibleCategories.reduce(
                        (sum, category) => sum + category.words.length,
                        0
                      )}
                    </span>
                  </div>
                </div>

                {!canStart ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-rose-200 bg-white/90 px-4 py-4 text-sm text-rose-500">
                    {copy.round.notReady}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-rose-100 bg-white/90 px-4 py-4 text-sm text-rose-600">
                    {copy.round.ready}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-rose-100 bg-white/85 p-6 text-sm text-rose-600 shadow-[0_18px_50px_rgba(0,56,147,0.18)] backdrop-blur nepal-dhaka">
                <p className="font-semibold text-rose-800">
                  {copy.round.tipsTitle}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {copy.round.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

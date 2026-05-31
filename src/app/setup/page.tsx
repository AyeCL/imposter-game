"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiEdit3,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShield,
  FiStar,
  FiTag,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import LanguageToggle from "@/app/components/LanguageToggle";
import {
  DEFAULT_IMPOSTER_COUNT,
  STORAGE_KEY,
  emojiPool,
  getMaxImposterCount,
  makeId,
  normalizeImposterCount,
  normalizeSetupState,
  starterCategories,
  starterPlayers,
  type Category,
  type LanguageCode,
  type Player,
  type SetupState,
} from "@/lib/game-data";
import { getCategoryDisplayName, getCopy } from "@/lib/i18n";

const loadSetupState = (): SetupState => {
  if (typeof window === "undefined") {
    return normalizeSetupState(null);
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return normalizeSetupState(null);
  }
  try {
    return normalizeSetupState(JSON.parse(raw));
  } catch {
    return normalizeSetupState(null);
  }
};

export default function SetupPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>(starterPlayers);
  const [categories, setCategories] = useState<Category[]>(starterCategories);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [imposterCount, setImposterCount] = useState(DEFAULT_IMPOSTER_COUNT);
  const [playerName, setPlayerName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [newWord, setNewWord] = useState("");
  const [focusedCategoryId, setFocusedCategoryId] = useState(
    starterCategories[0]?.id ?? ""
  );
  const [startError, setStartError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const copy = getCopy(language);

  useEffect(() => {
    const stored = loadSetupState();
    const timeout = setTimeout(() => {
      setPlayers(stored.players);
      setCategories(stored.categories);
      setLanguage(stored.language);
      setImposterCount(stored.imposterCount);
      setFocusedCategoryId(stored.categories[0]?.id ?? "");
      setHasLoaded(true);
    }, 0);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const activePlayers = useMemo(
    () => players.filter((player) => player.active),
    [players]
  );
  const maxImposterCount = useMemo(
    () => getMaxImposterCount(activePlayers.length),
    [activePlayers.length]
  );
  const minImposterCount =
    maxImposterCount === 0 ? 0 : DEFAULT_IMPOSTER_COUNT;
  const clampedImposterCount = useMemo(
    () => normalizeImposterCount(imposterCount, activePlayers.length),
    [activePlayers.length, imposterCount]
  );
  const wordHolderCount = Math.max(
    0,
    activePlayers.length - clampedImposterCount
  );
  const selectedCategories = useMemo(
    () => categories.filter((category) => category.selected),
    [categories]
  );
  const focusedCategory = useMemo(
    () => categories.find((category) => category.id === focusedCategoryId),
    [categories, focusedCategoryId]
  );
  const focusedCategoryName = focusedCategory
    ? getCategoryDisplayName(language, focusedCategory.id, focusedCategory.name)
    : "";
  const totalWords = useMemo(
    () => categories.reduce((sum, category) => sum + category.words.length, 0),
    [categories]
  );
  const selectedWordsCount = useMemo(
    () =>
      selectedCategories.reduce(
        (sum, category) => sum + category.words.length,
        0
      ),
    [selectedCategories]
  );

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        players,
        categories,
        language,
        imposterCount: clampedImposterCount,
      })
    );
  }, [categories, clampedImposterCount, hasLoaded, language, players]);

  const updateLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    setStartError(null);
  };

  const updateImposterCount = (value: number) => {
    setImposterCount(normalizeImposterCount(value, activePlayers.length));
    setStartError(null);
  };

  const addPlayer = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = playerName.trim();
    if (!trimmed) return;
    const nextEmoji = emojiPool[players.length % emojiPool.length];
    setPlayers((prev) => [
      ...prev,
      {
        id: makeId(),
        name: trimmed,
        emoji: nextEmoji,
        active: true,
      },
    ]);
    setPlayerName("");
    setStartError(null);
  };

  const togglePlayer = (id: string) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? { ...player, active: !player.active } : player
      )
    );
    setStartError(null);
  };

  const addCategory = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    const id = makeId();
    setCategories((prev) => [
      ...prev,
      {
        id,
        name: trimmed,
        emoji: "🪁",
        selected: true,
        words: [],
      },
    ]);
    setFocusedCategoryId(id);
    setCategoryName("");
    setStartError(null);
  };

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id
          ? { ...category, selected: !category.selected }
          : category
      )
    );
    setStartError(null);
  };

  const addWord = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = newWord.trim();
    if (!trimmed || !focusedCategory) return;
    setCategories((prev) =>
      prev.map((category) =>
        category.id === focusedCategory.id
          ? { ...category, words: [...category.words, trimmed] }
          : category
      )
    );
    setNewWord("");
    setStartError(null);
  };

  const startRound = () => {
    const eligiblePlayers = players.filter((player) => player.active);
    const eligibleCategories = categories.filter(
      (category) => category.selected && category.words.length > 0
    );
    if (eligiblePlayers.length < 3) {
      setStartError(copy.setup.needsPlayers);
      return;
    }
    if (eligibleCategories.length === 0) {
      setStartError(copy.setup.needsCategory);
      return;
    }
    if (clampedImposterCount > eligiblePlayers.length - 1) {
      setStartError(copy.setup.needsImposterCap);
      return;
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        players,
        categories,
        language,
        imposterCount: clampedImposterCount,
      })
    );
    router.push("/round?autostart=1");
  };

  return (
    <div className="min-h-screen nepal-sky text-rose-900">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 h-7 w-full opacity-70 nepal-prayer-flags" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full opacity-70 nepal-hills" />

        <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
          <header className="flex w-full flex-col gap-6 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_20px_60px_rgba(250,143,190,0.2)] backdrop-blur nepal-dhaka sm:p-8">
            <div className="grid w-full min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] xl:items-start">
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link
                    href="/"
                    className="inline-flex max-w-full items-center gap-2 break-words text-xs font-semibold uppercase tracking-[0.24em] text-rose-500 sm:tracking-[0.3em]"
                  >
                    <FiHeart /> {copy.appName}
                  </Link>
                  <LanguageToggle
                    label={copy.languageLabel}
                    language={language}
                    onChange={updateLanguage}
                  />
                </div>
                <h1 className="font-[var(--font-display)] text-3xl font-semibold text-rose-950 sm:text-5xl">
                  {copy.setup.title}
                </h1>
                <p className="max-w-2xl text-base text-rose-700 sm:text-lg">
                  {copy.setup.intro}
                </p>
              </div>
              <div className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-rose-100 bg-white/90 p-4 text-sm text-rose-700 nepal-dhaka">
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
                  <span>
                    {clampedImposterCount} / {maxImposterCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <FiTag /> {copy.common.categories}
                  </span>
                  <span>
                    {selectedCategories.length} / {categories.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <FiStar /> {copy.common.wordsReady}
                  </span>
                  <span>{selectedWordsCount}</span>
                </div>
                <button
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
                  type="button"
                  onClick={startRound}
                >
                  {copy.common.startRound} <FiArrowRight />
                </button>
                {startError ? (
                  <p className="text-xs font-semibold text-rose-500">
                    {startError}
                  </p>
                ) : (
                  <p className="text-xs text-rose-500">
                    {copy.setup.buildHint}
                  </p>
                )}
              </div>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_16px_40px_rgba(255,143,193,0.18)] backdrop-blur nepal-dhaka">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 font-[var(--font-display)] text-2xl text-rose-900">
                      <FiUsers /> {copy.setup.playersTitle}
                    </h2>
                    <p className="text-sm text-rose-600">
                      {copy.setup.playersHint}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                    🎭 {activePlayers.length} {copy.common.active}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {players.map((player) => (
                    <button
                      key={player.id}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                        player.active
                          ? "border-rose-200 bg-rose-50/80"
                          : "border-transparent bg-white/70 text-rose-400"
                      }`}
                      type="button"
                      onClick={() => togglePlayer(player.id)}
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                          {player.emoji}
                        </span>
                        <span>
                          <span className="flex items-center gap-2 text-sm font-semibold text-rose-900">
                            <FiUser className="text-base" /> {player.name}
                          </span>
                          <span className="text-xs text-rose-500">
                            {player.active
                              ? copy.common.inRound
                              : copy.common.sittingOut}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                          player.active
                            ? "bg-rose-500 text-white"
                            : "bg-rose-100 text-rose-400"
                        }`}
                      >
                        <FiCheck />
                      </span>
                    </button>
                  ))}
                </div>

                <form
                  className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-white/90 p-4"
                  onSubmit={addPlayer}
                >
                  <input
                    className="flex-1 rounded-full border border-rose-100 bg-white px-4 py-2 text-sm text-rose-900 outline-none transition placeholder:text-rose-300 focus:border-rose-300"
                    placeholder={copy.setup.addPlayerPlaceholder}
                    value={playerName}
                    onChange={(event) => setPlayerName(event.target.value)}
                  />
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                    type="submit"
                  >
                    <FiPlus /> {copy.setup.addPlayer}
                  </button>
                </form>

                <div className="mt-5 rounded-2xl border border-rose-100 bg-white/90 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-900">
                        <FiShield /> {copy.setup.impostersTitle}
                      </h3>
                      <p className="mt-1 text-xs text-rose-500">
                        {copy.setup.impostersHint}
                      </p>
                    </div>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                      {copy.setup.max} {maxImposterCount}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      aria-label={copy.setup.decreaseImposters}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-700 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                      type="button"
                      onClick={() => updateImposterCount(clampedImposterCount - 1)}
                      disabled={clampedImposterCount <= minImposterCount}
                    >
                      <FiMinus />
                    </button>
                    <div className="flex min-w-24 flex-1 items-center justify-center rounded-2xl bg-rose-50/80 px-4 py-3 text-center">
                      <span className="text-3xl font-semibold text-rose-900">
                        {clampedImposterCount}
                      </span>
                    </div>
                    <button
                      aria-label={copy.setup.increaseImposters}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-md shadow-rose-200 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                      type="button"
                      onClick={() => updateImposterCount(clampedImposterCount + 1)}
                      disabled={clampedImposterCount >= maxImposterCount}
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <input
                    aria-label={copy.setup.numberOfImposters}
                    className="mt-4 w-full accent-rose-600"
                    type="range"
                    min={minImposterCount}
                    max={maxImposterCount}
                    value={clampedImposterCount}
                    onChange={(event) =>
                      updateImposterCount(Number(event.target.value))
                    }
                    disabled={maxImposterCount <= minImposterCount}
                  />
                  <p className="mt-2 text-xs text-rose-500">
                    {copy.setup.wordHolderCount(wordHolderCount)}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_16px_40px_rgba(255,143,193,0.18)] backdrop-blur nepal-dhaka">
                <h2 className="flex items-center gap-2 font-[var(--font-display)] text-2xl text-rose-900">
                  <FiStar /> {copy.setup.snapshotTitle}
                </h2>
                <p className="mt-2 text-sm text-rose-600">
                  {copy.setup.snapshotHint}
                </p>

                <div className="mt-4 grid gap-3 text-sm text-rose-700">
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50/80 px-4 py-3">
                    <span>{copy.setup.playersReady}</span>
                    <span className="font-semibold">
                      {activePlayers.length} / {players.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50/80 px-4 py-3">
                    <span>{copy.common.imposters}</span>
                    <span className="font-semibold">
                      {clampedImposterCount} / {maxImposterCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50/80 px-4 py-3">
                    <span>{copy.setup.selectedCategories}</span>
                    <span className="font-semibold">
                      {selectedCategories.length} / {categories.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50/80 px-4 py-3">
                    <span>{copy.setup.totalWords}</span>
                    <span className="font-semibold">{totalWords}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCategories.length === 0 ? (
                    <p className="text-xs text-rose-500">
                      {copy.setup.pickCategory}
                    </p>
                  ) : (
                    selectedCategories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm"
                      >
                        <span className="text-sm">{category.emoji}</span>
                        {getCategoryDisplayName(
                          language,
                          category.id,
                          category.name
                        )}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_16px_40px_rgba(255,143,193,0.18)] backdrop-blur nepal-dhaka">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 font-[var(--font-display)] text-2xl text-rose-900">
                      <FiTag /> {copy.setup.categoriesTitle}
                    </h2>
                    <p className="text-sm text-rose-600">
                      {copy.setup.categoriesHint}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                    🇳🇵 {copy.setup.selectedBadge(selectedCategories.length)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {categories.map((category) => {
                    const isFocused = category.id === focusedCategoryId;
                    const categoryDisplayName = getCategoryDisplayName(
                      language,
                      category.id,
                      category.name
                    );
                    return (
                      <div
                        key={category.id}
                        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                          isFocused
                            ? "border-rose-200 bg-rose-50/80"
                            : "border-transparent bg-white/70"
                        }`}
                      >
                        <button
                          className="flex flex-1 items-center gap-3 text-left"
                          type="button"
                          onClick={() => setFocusedCategoryId(category.id)}
                        >
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                            {category.emoji}
                          </span>
                          <span>
                            <span className="text-sm font-semibold text-rose-900">
                              {categoryDisplayName}
                            </span>
                            <span className="block text-xs text-rose-500">
                              {copy.setup.wordCount(category.words.length)}
                            </span>
                          </span>
                        </button>
                        <button
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
                            category.selected
                              ? "bg-rose-500 text-white"
                              : "bg-rose-100 text-rose-500"
                          }`}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <FiCheck />
                          {category.selected
                            ? copy.common.selected
                            : copy.common.off}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <form
                  className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-white/90 p-4"
                  onSubmit={addCategory}
                >
                  <input
                    className="flex-1 rounded-full border border-rose-100 bg-white px-4 py-2 text-sm text-rose-900 outline-none transition placeholder:text-rose-300 focus:border-rose-300"
                    placeholder={copy.setup.addCategoryPlaceholder}
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                  />
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                    type="submit"
                  >
                    <FiPlus /> {copy.setup.addCategory}
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_16px_40px_rgba(255,143,193,0.18)] backdrop-blur nepal-dhaka">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 font-[var(--font-display)] text-2xl text-rose-900">
                      <FiEdit3 /> {copy.setup.wordListTitle}
                    </h2>
                    <p className="text-sm text-rose-600">
                      {copy.setup.editing}:{" "}
                      {focusedCategoryName || copy.setup.pickCategory}
                    </p>
                  </div>
                  {focusedCategory ? (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                      {copy.setup.wordCount(focusedCategory.words.length)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {focusedCategory?.words.length ? (
                    focusedCategory.words.map((word, index) => (
                      <span
                        key={`${focusedCategory.id}-${word}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm"
                      >
                        <span className="text-base">💌</span>
                        {word}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-rose-500">{copy.setup.noWords}</p>
                  )}
                </div>

                <form
                  className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-white/90 p-4"
                  onSubmit={addWord}
                >
                  <input
                    className="flex-1 rounded-full border border-rose-100 bg-white px-4 py-2 text-sm text-rose-900 outline-none transition placeholder:text-rose-300 focus:border-rose-300"
                    placeholder={copy.setup.addWordPlaceholder(
                      focusedCategoryName || copy.setup.wordListTitle
                    )}
                    value={newWord}
                    onChange={(event) => setNewWord(event.target.value)}
                    disabled={!focusedCategory}
                  />
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                    type="submit"
                    disabled={!focusedCategory}
                  >
                    <FiPlus /> {copy.setup.addWord}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

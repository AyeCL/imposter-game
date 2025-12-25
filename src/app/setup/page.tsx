"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiEdit3,
  FiHeart,
  FiPlus,
  FiStar,
  FiTag,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import {
  STORAGE_KEY,
  emojiPool,
  makeId,
  starterCategories,
  starterPlayers,
  type Category,
  type Player,
  type SetupState,
} from "@/lib/game-data";

const loadSetupState = (): SetupState => {
  if (typeof window === "undefined") {
    return { players: starterPlayers, categories: starterCategories };
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { players: starterPlayers, categories: starterCategories };
  }
  try {
    const parsed = JSON.parse(raw) as SetupState;
    if (!parsed?.players?.length || !parsed?.categories?.length) {
      return { players: starterPlayers, categories: starterCategories };
    }
    return parsed;
  } catch {
    return { players: starterPlayers, categories: starterCategories };
  }
};

export default function SetupPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>(starterPlayers);
  const [categories, setCategories] = useState<Category[]>(starterCategories);
  const [playerName, setPlayerName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [newWord, setNewWord] = useState("");
  const [focusedCategoryId, setFocusedCategoryId] = useState(
    starterCategories[0]?.id ?? ""
  );
  const [startError, setStartError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const stored = loadSetupState();
    const timeout = setTimeout(() => {
      setPlayers(stored.players);
      setCategories(stored.categories);
      setFocusedCategoryId(stored.categories[0]?.id ?? "");
      setHasLoaded(true);
    }, 0);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ players, categories })
    );
  }, [players, categories, hasLoaded]);

  const activePlayers = useMemo(
    () => players.filter((player) => player.active),
    [players]
  );
  const selectedCategories = useMemo(
    () => categories.filter((category) => category.selected),
    [categories]
  );
  const focusedCategory = useMemo(
    () => categories.find((category) => category.id === focusedCategoryId),
    [categories, focusedCategoryId]
  );
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
        player.id === id
          ? { ...player, active: !player.active }
          : player
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
        emoji: "💗",
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
      setStartError("Pick at least 3 active players to start.");
      return;
    }
    if (eligibleCategories.length === 0) {
      setStartError("Select at least one category with words.");
      return;
    }
    router.push("/round?autostart=1");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,205,227,0.85),_rgba(255,236,246,0.6)_45%,_rgba(255,250,252,0.95)_100%)] text-rose-900">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-200/70 blur-3xl" />
        <div className="pointer-events-none absolute top-24 right-10 h-40 w-40 rounded-full bg-pink-200/70 blur-2xl" />
        <div className="pointer-events-none absolute bottom-10 left-6 h-52 w-52 rounded-full bg-amber-100/70 blur-3xl" />

        <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
          <header className="flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-[0_20px_60px_rgba(250,143,190,0.2)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-500"
                >
                  <FiHeart /> imposter game
                </Link>
                <h1 className="font-[var(--font-display)] text-4xl font-semibold text-rose-950 sm:text-5xl">
                  Round setup
                </h1>
                <p className="max-w-2xl text-base text-rose-700 sm:text-lg">
                  Set the players, choose categories, then add words inside each
                  one. You can always tweak later.
                </p>
              </div>
              <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-rose-100 bg-white/90 p-4 text-sm text-rose-700">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <FiUsers /> Players
                  </span>
                  <span>{activePlayers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <FiTag /> Categories
                  </span>
                  <span>
                    {selectedCategories.length} / {categories.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <FiStar /> Words ready
                  </span>
                  <span>{selectedWordsCount}</span>
                </div>
                <button
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
                  type="button"
                  onClick={startRound}
                >
                  Start round <FiArrowRight />
                </button>
                {startError ? (
                  <p className="text-xs font-semibold text-rose-500">
                    {startError}
                  </p>
                ) : (
                  <p className="text-xs text-rose-500">
                    Build your setup, then jump into reveal mode.
                  </p>
                )}
              </div>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_16px_40px_rgba(255,143,193,0.18)] backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 font-[var(--font-display)] text-2xl text-rose-900">
                      <FiUsers /> Players
                    </h2>
                    <p className="text-sm text-rose-600">
                      Tap a card to toggle someone in or out.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                    🎀 {activePlayers.length} active
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
                            {player.active ? "In the round" : "Sitting out"}
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
                    placeholder="Add a player name"
                    value={playerName}
                    onChange={(event) => setPlayerName(event.target.value)}
                  />
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                    type="submit"
                  >
                    <FiPlus /> Add player
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_16px_40px_rgba(255,143,193,0.18)] backdrop-blur">
                <h2 className="flex items-center gap-2 font-[var(--font-display)] text-2xl text-rose-900">
                  <FiStar /> Setup snapshot
                </h2>
                <p className="mt-2 text-sm text-rose-600">
                  Quick totals so you know you are ready to go.
                </p>

                <div className="mt-4 grid gap-3 text-sm text-rose-700">
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50/80 px-4 py-3">
                    <span>Players ready</span>
                    <span className="font-semibold">
                      {activePlayers.length} / {players.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50/80 px-4 py-3">
                    <span>Selected categories</span>
                    <span className="font-semibold">
                      {selectedCategories.length} / {categories.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50/80 px-4 py-3">
                    <span>Total words</span>
                    <span className="font-semibold">{totalWords}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCategories.length === 0 ? (
                    <p className="text-xs text-rose-500">
                      Pick a category to see it here.
                    </p>
                  ) : (
                    selectedCategories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm"
                      >
                        <span className="text-sm">{category.emoji}</span>
                        {category.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_16px_40px_rgba(255,143,193,0.18)] backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 font-[var(--font-display)] text-2xl text-rose-900">
                      <FiTag /> Categories
                    </h2>
                    <p className="text-sm text-rose-600">
                      Select what kinds of words you want in the round.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                    💖 {selectedCategories.length} selected
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {categories.map((category) => {
                    const isFocused = category.id === focusedCategoryId;
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
                              {category.name}
                            </span>
                            <span className="block text-xs text-rose-500">
                              {category.words.length} words
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
                          {category.selected ? "Selected" : "Off"}
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
                    placeholder="Add a new category"
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                  />
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                    type="submit"
                  >
                    <FiPlus /> Add category
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_16px_40px_rgba(255,143,193,0.18)] backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 font-[var(--font-display)] text-2xl text-rose-900">
                      <FiEdit3 /> Word list
                    </h2>
                    <p className="text-sm text-rose-600">
                      Editing: {focusedCategory?.name ?? "Pick a category"}
                    </p>
                  </div>
                  {focusedCategory ? (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                      {focusedCategory.words.length} words
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
                    <p className="text-xs text-rose-500">
                      No words yet. Add your first word below.
                    </p>
                  )}
                </div>

                <form
                  className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-white/90 p-4"
                  onSubmit={addWord}
                >
                  <input
                    className="flex-1 rounded-full border border-rose-100 bg-white px-4 py-2 text-sm text-rose-900 outline-none transition placeholder:text-rose-300 focus:border-rose-300"
                    placeholder={`Add a word to ${
                      focusedCategory?.name ?? "this category"
                    }`}
                    value={newWord}
                    onChange={(event) => setNewWord(event.target.value)}
                    disabled={!focusedCategory}
                  />
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                    type="submit"
                    disabled={!focusedCategory}
                  >
                    <FiPlus /> Add word
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

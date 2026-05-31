export type Player = {
  id: string;
  name: string;
  emoji: string;
  active: boolean;
};

export type Category = {
  id: string;
  name: string;
  emoji: string;
  selected: boolean;
  words: string[];
};

export type SetupState = {
  players: Player[];
  categories: Category[];
  imposterCount: number;
};

export const STORAGE_KEY = "imposter-game-setup-v1";
export const DEFAULT_IMPOSTER_COUNT = 1;

export const emojiPool = ["🏔️", "🥟", "☀️", "🌙", "🪷", "🪁", "🎭", "🔥"];

export const starterPlayers: Player[] = [
  { id: "p1", name: "aayush", emoji: "🦋", active: true },
  { id: "p2", name: "sima", emoji: "🍓", active: true },
  { id: "p3", name: "sristi", emoji: "🌸", active: true },
  { id: "p4", name: "vv", emoji: "🧁", active: false },
];

export const starterCategories: Category[] = [
  {
    id: "c1",
    name: "Foods",
    emoji: "🍛",
    selected: true,
    words: [
      "momo",
      "titaura",
      "sel roti",
      "dal bhat",
      "gundruk",
      "yomari",
      "chatpate",
      "chiya",
      "bara",
      "kheer",
      "laphing",
      "thukpa",
      "pani puri",
      "chowmein",
      "alu tama",
    ],
  },
  {
    id: "c2",
    name: "Places",
    emoji: "🗺️",
    selected: true,
    words: [
      "Kathmandu",
      "Pokhara",
      "Bhaktapur",
      "Lalitpur",
      "Chitwan",
      "Lumbini",
      "Nagarkot",
      "Phewa Lake",
      "Durbar Square",
      "Swayambhu",
      "Boudha",
      "Thamel",
      "Everest Base Camp",
      "Mustang",
      "Bandipur",
    ],
  },
  {
    id: "c3",
    name: "Animals",
    emoji: "🐒",
    selected: true,
    words: [
      "red panda",
      "snow leopard",
      "yak",
      "tiger",
      "elephant",
      "monkey",
      "dog",
      "cat",
      "cow",
      "goat",
      "buffalo",
      "rabbit",
      "deer",
      "peacock",
    ],
  },
  {
    id: "c4",
    name: "Things",
    emoji: "🎒",
    selected: false,
    words: [
      "khukuri",
      "sari",
      "tika",
      "bangle",
      "backpack",
      "phone",
      "notebook",
      "camera",
      "headphones",
      "umbrella",
      "sunglasses",
      "water bottle",
      "lantern",
      "bicycle",
    ],
  },
  {
    id: "c5",
    name: "Activities",
    emoji: "🎉",
    selected: false,
    words: [
      "hiking",
      "dancing",
      "singing",
      "football",
      "cricket",
      "shopping",
      "picnic",
      "road trip",
      "temple visit",
      "cooking",
      "movie night",
      "study group",
      "karaoke",
      "festival",
    ],
  },
  {
    id: "c6",
    name: "Movies & Shows",
    emoji: "🎬",
    selected: false,
    words: [
      "3 Idiots",
      "Dangal",
      "RRR",
      "Kantara",
      "Lagaan",
      "Kuch Kuch Hota Hai",
      "Kabhi Khushi Kabhie Gham",
      "Titanic",
      "Harry Potter",
      "Spider-Man",
      "Stranger Things",
      "Money Heist",
      "Breaking Bad",
      "Friends",
    ],
  },
];

export const getMaxImposterCount = (activePlayerCount: number) =>
  Math.max(0, activePlayerCount - 1);

export const normalizeImposterCount = (
  value: unknown,
  activePlayerCount: number
) => {
  const parsed = Math.floor(Number(value));
  const requested = Number.isFinite(parsed) ? parsed : DEFAULT_IMPOSTER_COUNT;
  const maxImposterCount = getMaxImposterCount(activePlayerCount);
  if (maxImposterCount === 0) return 0;

  return Math.min(Math.max(requested, DEFAULT_IMPOSTER_COUNT), maxImposterCount);
};

export const normalizeSetupState = (value: unknown): SetupState => {
  const candidate = value as Partial<SetupState> | null | undefined;
  const players = candidate?.players?.length
    ? candidate.players
    : starterPlayers;
  const categories = candidate?.categories?.length
    ? candidate.categories
    : starterCategories;
  const activePlayerCount = players.filter((player) => player.active).length;

  return {
    players,
    categories,
    imposterCount: normalizeImposterCount(
      candidate?.imposterCount,
      activePlayerCount
    ),
  };
};

export const makeId = () => `id-${Math.random().toString(36).slice(2, 9)}`;

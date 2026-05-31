import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiHeart, FiUsers } from "react-icons/fi";

export default function Home() {
  return (
    <div className="min-h-screen nepal-sky text-rose-900">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 h-7 w-full opacity-70 nepal-prayer-flags" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full opacity-70 nepal-hills" />

        <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-600 shadow-sm nepal-dhaka">
            <FiHeart />
            नमस्ते · imposter game
          </span>
          <Image
            src="/nepali-imposter-logo.png"
            alt="Nepali Imposter logo"
            width={180}
            height={180}
            priority
            className="h-36 w-36 object-contain drop-shadow-[0_18px_30px_rgba(0,56,147,0.18)] sm:h-44 sm:w-44"
          />
          <h1 className="font-[var(--font-display)] text-4xl font-semibold text-rose-950 sm:text-6xl">
            Ready for a Nepali red-and-blue imposter night?
          </h1>
          <p className="max-w-2xl text-base text-rose-700 sm:text-lg">
            Build your crew, stack the categories, and pass the phone around.
            Momo, chiya, mountain vibes, and as many imposters as the group can
            survive.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
              href="/setup"
            >
              Start setup <FiArrowRight />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-6 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300"
              href="/round"
            >
              Jump to round <FiUsers />
            </Link>
          </div>

          <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-left text-sm text-rose-700 shadow-sm nepal-dhaka">
              <p className="font-semibold text-rose-900">
                1. Set the cast (साथीहरू)
              </p>
              <p className="mt-1">Toggle who is playing and add new names.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-left text-sm text-rose-700 shadow-sm nepal-dhaka">
              <p className="font-semibold text-rose-900">
                2. Pick imposters + topics
              </p>
              <p className="mt-1">
                Set the hidden count, then fill categories with words.
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-left text-sm text-rose-700 shadow-sm nepal-dhaka">
              <p className="font-semibold text-rose-900">
                3. Reveal roles (खुलासा समय)
              </p>
              <p className="mt-1">Start the round and pass the phone along.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

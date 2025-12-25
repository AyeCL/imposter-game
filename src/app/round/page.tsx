import { Suspense } from "react";
import RoundClient from "./RoundClient";

export default function RoundPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,205,227,0.85),_rgba(255,236,246,0.6)_45%,_rgba(255,250,252,0.95)_100%)] text-rose-900">
          <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
            <div className="rounded-3xl border border-rose-100 bg-white/85 px-6 py-6 text-sm text-rose-600 shadow-[0_18px_50px_rgba(255,143,193,0.18)]">
              Loading round setup…
            </div>
          </div>
        </div>
      }
    >
      <RoundClient />
    </Suspense>
  );
}

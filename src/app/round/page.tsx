import { Suspense } from "react";
import RoundClient from "./RoundClient";

export default function RoundPage() {
  return (
    <Suspense
      fallback={
        <div className="relative isolate min-h-screen overflow-hidden nepal-sky text-rose-900">
          <div className="pointer-events-none absolute left-0 top-0 h-7 w-full opacity-70 nepal-prayer-flags" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full opacity-70 nepal-hills" />
          <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
            <div className="rounded-3xl border border-rose-100 bg-white/85 px-6 py-6 text-sm text-rose-600 shadow-[0_18px_50px_rgba(255,143,193,0.18)] nepal-dhaka">
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

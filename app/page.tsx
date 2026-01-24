import { Suspense } from "react";
import Image from "next/image";
import { TransactionExplainer } from "./components/TransactionExplainer";

function LoadingFallback() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - matches home view */}
      <header className="border-b border-slate-200 px-4 py-6 md:py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Image
            src="/logo.png"
            alt="Mull"
            width={200}
            height={80}
            className="-my-4 h-[72px] w-auto md:h-20"
            priority
          />
          <div className="flex items-center gap-2">
            {/* Network selector skeleton */}
            <div className="skeleton h-9 w-36 rounded-lg" />
            {/* Theme toggle skeleton */}
            <div className="skeleton h-9 w-9 rounded-lg" />
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="flex-1 px-4 pb-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Hero section skeleton */}
          <div className="pt-12 pb-8 text-center">
            <div className="skeleton mx-auto mb-4 h-10 w-80 rounded-lg" />
            <div className="skeleton mx-auto mb-8 h-6 w-96 rounded-lg" />
            {/* Search input skeleton */}
            <div className="mx-auto max-w-2xl">
              <div className="skeleton h-14 rounded-xl" />
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>

          {/* Recent transactions skeleton */}
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TransactionExplainer />
    </Suspense>
  );
}

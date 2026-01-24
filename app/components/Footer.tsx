"use client";

import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/50 px-4 py-6 md:py-8 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl">
        {/* Mobile Layout - Vertical Stack */}
        <div className="flex flex-col items-center gap-5 md:hidden">
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="Mull"
            width={100}
            height={40}
            className="h-8 w-auto opacity-80"
          />

          {/* Tagline */}
          <p className="px-4 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Adding colors to the monotonous world of blockchain transactions.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/getMullWeb3"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="X (Twitter)"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com/leopard627/mull"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="GitHub"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
          </div>

          {/* Provider */}
          <div className="w-full border-t border-slate-200 pt-2 text-center dark:border-slate-700">
            <a
              href="https://alpsoft.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400"
            >
              © 2026 Alpsoft Inc.
            </a>
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between">
            {/* Left - Logo & Tagline */}
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Mull"
                width={120}
                height={48}
                className="h-10 w-auto opacity-80"
              />
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Adding colors to the monotonous world of blockchain transactions.
              </p>
            </div>

            {/* Right - Links & Provider */}
            <div className="flex items-center gap-6">
              {/* Social Links */}
              <div className="flex items-center gap-1">
                <a
                  href="https://x.com/getMullWeb3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>@getMullWeb3</span>
                </a>
                <a
                  href="https://github.com/leopard627/mull"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub</span>
                </a>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

              {/* Provider */}
              <a
                href="https://alpsoft.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400"
              >
                © 2026 Alpsoft Inc.
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

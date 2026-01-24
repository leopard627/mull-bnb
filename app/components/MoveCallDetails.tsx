"use client";

import { useState } from "react";
import type { MoveCallInfo } from "@/lib/types";
import { shortenAddress } from "@/lib/format-utils";

interface MoveCallDetailsProps {
  calls: MoveCallInfo[];
  network?: "mainnet" | "testnet";
}

export function MoveCallDetails({ calls, network = "mainnet" }: MoveCallDetailsProps) {
  const [expandedCalls, setExpandedCalls] = useState<Record<number, boolean>>({});

  if (calls.length === 0) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard access denied
    }
  };

  const getPackageUrl = (packageId: string) => {
    return network === "mainnet"
      ? `https://bscscan.com/address/${packageId}`
      : `https://testnet.bscscan.com/address/${packageId}`;
  };

  const toggleExpand = (index: number) => {
    setExpandedCalls((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50">
            <svg
              className="h-4 w-4 text-violet-600 dark:text-violet-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Contract Calls
          </h3>
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
            {calls.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 p-4">
        {calls.map((call, index) => {
          const isExpanded = expandedCalls[index];
          const hasTypeArgs = call.typeArguments.length > 0;

          return (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
            >
              {/* Call Header */}
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
                  {index + 1}
                </span>
                {call.packageName && (
                  <span className="rounded-md bg-gradient-to-r from-purple-500 to-violet-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                    {call.packageName}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-1">
                  <a
                    href={getPackageUrl(call.package)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-sky-500 dark:hover:bg-slate-700 dark:hover:text-sky-400"
                    title="View contract on BSCScan"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Function Signature */}
              <div className="px-4 py-3">
                <div className="font-mono text-sm leading-relaxed">
                  <span className="text-slate-400 dark:text-slate-500">
                    {call.packageName || shortenAddress(call.package, 6)}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">::</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {call.module}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">::</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {call.function}
                  </span>
                  {hasTypeArgs && (
                    <span className="text-amber-600 dark:text-amber-400">
                      {"<"}...{">"}
                    </span>
                  )}
                </div>

                {/* Package ID */}
                <div className="group mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Package:</span>
                  <code className="font-mono text-xs text-slate-500 dark:text-slate-500">
                    {shortenAddress(call.package, 10)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(call.package)}
                    className="rounded p-1 text-slate-400 opacity-0 transition-colors group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    title="Copy package ID"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Type Arguments */}
                {hasTypeArgs && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleExpand(index)}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    >
                      <svg
                        className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      Type Arguments ({call.typeArguments.length})
                    </button>
                    {isExpanded && (
                      <div className="mt-2 space-y-1 pl-5">
                        {call.typeArguments.map((arg, i) => (
                          <div key={i} className="group flex items-center gap-2">
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              T{i}:
                            </span>
                            <code className="max-w-[300px] truncate font-mono text-xs text-amber-600 dark:text-amber-400">
                              {arg}
                            </code>
                            <button
                              onClick={() => copyToClipboard(arg)}
                              className="shrink-0 rounded p-1 text-slate-400 opacity-0 transition-colors group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                              title="Copy type argument"
                            >
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

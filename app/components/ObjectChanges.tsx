"use client";

import { useState } from "react";
import type { ObjectChangeInfo } from "@/lib/types";
import { shortenAddress, extractTypeName } from "@/lib/format-utils";

interface ObjectChangesProps {
  changes: ObjectChangeInfo[];
  network?: "mainnet" | "testnet";
}

const changeTypeStyles: Record<
  ObjectChangeInfo["type"],
  { label: string; bgColor: string; textColor: string; icon: string; borderColor: string }
> = {
  created: {
    label: "Created",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800/50",
    icon: "+",
  },
  mutated: {
    label: "Modified",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800/50",
    icon: "~",
  },
  deleted: {
    label: "Deleted",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800/50",
    icon: "-",
  },
  transferred: {
    label: "Transferred",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800/50",
    icon: "→",
  },
  published: {
    label: "Published",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    textColor: "text-pink-600 dark:text-pink-400",
    borderColor: "border-pink-200 dark:border-pink-800/50",
    icon: "★",
  },
  wrapped: {
    label: "Wrapped",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800/50",
    icon: "◎",
  },
};

export function ObjectChanges({ changes, network = "mainnet" }: ObjectChangesProps) {
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({});

  if (changes.length === 0) return null;

  const copyObjectId = async (objectId: string) => {
    try {
      await navigator.clipboard.writeText(objectId);
    } catch {
      // Clipboard access denied
    }
  };

  const getObjectUrl = (objectId: string) => {
    return network === "mainnet"
      ? `https://bscscan.com/address/${objectId}`
      : `https://testnet.bscscan.com/address/${objectId}`;
  };

  // Group by type
  const grouped = changes.reduce(
    (acc, change) => {
      if (!acc[change.type]) acc[change.type] = [];
      acc[change.type].push(change);
      return acc;
    },
    {} as Record<string, ObjectChangeInfo[]>
  );

  const toggleExpand = (type: string) => {
    setExpandedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
            <svg
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Object Changes
          </h3>
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
            {changes.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 p-4">
        {Object.entries(grouped).map(([type, items]) => {
          const style = changeTypeStyles[type as ObjectChangeInfo["type"]];
          const isExpanded = expandedTypes[type];
          const displayItems = isExpanded ? items : items.slice(0, 3);
          const hasMore = items.length > 3;

          return (
            <div
              key={type}
              className={`rounded-xl border ${style.borderColor} ${style.bgColor} overflow-hidden`}
            >
              {/* Type Header */}
              <div className="flex items-center gap-2 px-3 py-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold ${style.textColor} bg-white/50 dark:bg-slate-800/50`}
                >
                  {style.icon}
                </span>
                <span className={`text-sm font-semibold ${style.textColor}`}>{style.label}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">({items.length})</span>
              </div>

              {/* Objects List */}
              <div className="space-y-1.5 px-3 pb-3">
                {displayItems.map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 rounded-lg bg-white/70 p-2 dark:bg-slate-800/70"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-slate-600 dark:text-slate-400">
                        {extractTypeName(item.objectType)}
                      </div>
                      <code className="font-mono text-xs text-slate-500 dark:text-slate-500">
                        {shortenAddress(item.objectId, 8)}
                      </code>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => copyObjectId(item.objectId)}
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                        title="Copy Object ID"
                      >
                        <svg
                          className="h-3.5 w-3.5"
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
                      <a
                        href={getObjectUrl(item.objectId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-sky-500 dark:hover:bg-slate-700 dark:hover:text-sky-400"
                        title="View on BSCScan"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
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
                ))}

                {hasMore && (
                  <button
                    onClick={() => toggleExpand(type)}
                    className="w-full py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    {isExpanded ? "Show less" : `Show ${items.length - 3} more`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

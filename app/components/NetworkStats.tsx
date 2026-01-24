"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Network } from "@/lib/types";

interface NetworkStatsData {
  latestBlock: string;
  totalTransactions: number;
  avgGasPrice: string;
  avgTps: number;
  blockTime: number;
}

interface NetworkStatsProps {
  network: Network;
}

// Animated counter hook
function useAnimatedCounter(targetValue: number, duration: number = 1000): number {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    if (targetValue === 0) {
      setDisplayValue(0);
      return;
    }

    const startValue = previousValue.current;
    const startTime = performance.now();
    const diff = targetValue - startValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + diff * easeOutQuart);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = targetValue;
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return displayValue;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const animatedValue = useAnimatedCounter(value, 800);
  return (
    <>
      {formatNumber(animatedValue)}
      {suffix}
    </>
  );
}

export function NetworkStats({ network }: NetworkStatsProps) {
  const [stats, setStats] = useState<NetworkStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/stats?network=${network}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
        setError(null);
      } else {
        setError(data.error?.message || "Failed to fetch stats");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  }, [network]);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const statCards = [
    {
      label: "Latest Block",
      value: stats?.latestBlock ? parseInt(stats.latestBlock) : 0,
      format: (v: number) => <AnimatedNumber value={v} />,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Recent Txns",
      value: stats?.totalTransactions || 0,
      format: (v: number) => <AnimatedNumber value={v} />,
      subtitle: "last 5 blocks",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Gas Price",
      value: stats?.avgGasPrice ? parseFloat(stats.avgGasPrice) : 0,
      format: (v: number) => (
        <>
          {v.toFixed(1)} <span className="text-sm font-normal">Gwei</span>
        </>
      ),
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
          />
        </svg>
      ),
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/30",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Avg. TPS",
      value: stats?.avgTps || 0,
      format: (v: number) => <AnimatedNumber value={v} />,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
      textColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  if (error) {
    return null; // Silently hide on error
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <div
          key={card.label}
          className={`hover-lift relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-800 ${
            isLoading ? "animate-pulse" : ""
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Gradient accent */}
          <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${card.color}`} />

          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              <p className="text-xl font-bold text-slate-900 tabular-nums md:text-2xl dark:text-slate-100">
                {isLoading ? (
                  <span className="skeleton inline-block h-7 w-20 rounded" />
                ) : (
                  card.format(card.value)
                )}
              </p>
              {card.subtitle && !isLoading && (
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{card.subtitle}</p>
              )}
            </div>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <span className={card.textColor}>{card.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Position,
  MarkerType,
  Handle,
  EdgeLabelRenderer,
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Action } from "@/lib/types";
import { shortenAddress, getInitials } from "@/lib/format-utils";
import { getBridgeLogo, getDexLogo } from "@/lib/known-packages";

interface TransactionFlowProps {
  actions: Action[];
}

type NodeRole =
  | "sender"
  | "recipient"
  | "trader"
  | "dex"
  | "contract"
  | "coin"
  | "merged_coin"
  | "validator"
  | "pool"
  | "buyer"
  | "seller"
  | "bridge"
  | "package"
  | "created"
  | "reward"
  | "protocol";

interface CustomNodeData extends Record<string, unknown> {
  label: string;
  address: string;
  role: NodeRole;
  amount?: string;
  coinName?: string;
  logo?: string;
}

interface CustomEdgeData extends Record<string, unknown> {
  label?: string;
  labels?: string[];
  bgColor: string;
  textColor: string;
}

type CustomNode = Node<CustomNodeData>;

const roleColors: Record<NodeRole, { bg: string; border: string; text: string }> = {
  sender: { bg: "#3b82f6", border: "#1d4ed8", text: "#ffffff" },
  trader: { bg: "#3b82f6", border: "#1d4ed8", text: "#ffffff" },
  recipient: { bg: "#10b981", border: "#059669", text: "#ffffff" },
  dex: { bg: "#8b5cf6", border: "#7c3aed", text: "#ffffff" },
  contract: { bg: "#f59e0b", border: "#d97706", text: "#ffffff" },
  coin: { bg: "#06b6d4", border: "#0891b2", text: "#ffffff" },
  merged_coin: { bg: "#10b981", border: "#059669", text: "#ffffff" },
  validator: { bg: "#ec4899", border: "#db2777", text: "#ffffff" },
  pool: { bg: "#8b5cf6", border: "#7c3aed", text: "#ffffff" },
  buyer: { bg: "#3b82f6", border: "#1d4ed8", text: "#ffffff" },
  seller: { bg: "#10b981", border: "#059669", text: "#ffffff" },
  bridge: { bg: "#14b8a6", border: "#0d9488", text: "#ffffff" },
  package: { bg: "#6366f1", border: "#4f46e5", text: "#ffffff" },
  created: { bg: "#f97316", border: "#ea580c", text: "#ffffff" },
  reward: { bg: "#eab308", border: "#ca8a04", text: "#ffffff" },
  protocol: { bg: "#0ea5e9", border: "#0284c7", text: "#ffffff" },
};

function CustomNodeComponent({ data }: { data: CustomNodeData }) {
  const colors = roleColors[data.role] || roleColors.contract;
  const isCoinNode = data.role === "coin" || data.role === "merged_coin";
  const hasLogo = data.logo && data.role === "bridge";

  // Icon for different roles
  const getIcon = () => {
    if (data.role === "dex") return "DEX";
    if (data.role === "coin") return "💰";
    if (data.role === "merged_coin") return "🔗";
    if (data.role === "validator") return "🔒";
    if (data.role === "pool") return "💧";
    if (data.role === "buyer") return "🛒";
    if (data.role === "seller") return "🏷️";
    if (data.role === "bridge") return "🌉";
    if (data.role === "package") return "📦";
    if (data.role === "created") return "🎨";
    if (data.role === "reward") return "🎁";
    if (data.role === "protocol") return "📊";
    return getInitials(data.address);
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-slate-400" />
      <div
        className="flex min-w-[100px] flex-col items-center gap-2 rounded-xl p-3 shadow-lg"
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        {hasLogo ? (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
            <img src={data.logo} alt={data.label} className="h-8 w-8 object-contain" />
          </div>
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: colors.border, color: colors.text }}
          >
            {getIcon()}
          </div>
        )}
        <div className="text-center">
          {isCoinNode && data.amount ? (
            <>
              <div className="text-xs font-bold" style={{ color: colors.text }}>
                {data.amount}
              </div>
              <div className="text-[10px] opacity-80" style={{ color: colors.text }}>
                {data.coinName || "BNB"}
              </div>
            </>
          ) : (
            <>
              <div className="text-xs font-medium capitalize" style={{ color: colors.text }}>
                {data.role === "merged_coin" ? "Merged" : data.role}
              </div>
              <div className="font-mono text-[10px] opacity-80" style={{ color: colors.text }}>
                {shortenAddress(data.address, 4)}
              </div>
            </>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-slate-400" />
    </div>
  );
}

// Custom edge component with label positioned above the path
function CustomEdgeComponent({
  id: _id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const edgeData = data as CustomEdgeData | undefined;

  // Support multiple labels (for grouped calls)
  const labels = edgeData?.labels as string[] | undefined;
  const singleLabel = edgeData?.label;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {(singleLabel || labels) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -100%) translate(${labelX}px,${labelY - 8}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            {labels ? (
              // Multiple labels - stack vertically
              <div className="flex flex-col items-center gap-1">
                {labels.map((label, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border px-2 py-1 text-xs font-semibold whitespace-nowrap shadow-sm"
                    style={{
                      backgroundColor: edgeData?.bgColor || "#f1f5f9",
                      color: edgeData?.textColor || "#334155",
                      borderColor: edgeData?.textColor ? `${edgeData.textColor}30` : "#e2e8f0",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            ) : (
              // Single label
              <div
                className="rounded-md border px-2 py-1 text-xs font-semibold whitespace-nowrap shadow-sm"
                style={{
                  backgroundColor: edgeData?.bgColor || "#f1f5f9",
                  color: edgeData?.textColor || "#334155",
                  borderColor: edgeData?.textColor ? `${edgeData.textColor}30` : "#e2e8f0",
                }}
              >
                {singleLabel}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// Custom edge for swap return (bottom path)
function CustomEdgeReturnComponent({
  id: _id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
    offset: 50,
  });

  const edgeData = data as CustomEdgeData | undefined;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + 20}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            <div
              className="rounded-md border px-2 py-1 text-xs font-semibold whitespace-nowrap shadow-sm"
              style={{
                backgroundColor: edgeData.bgColor || "#f1f5f9",
                color: edgeData.textColor || "#334155",
                borderColor: edgeData.textColor ? `${edgeData.textColor}30` : "#e2e8f0",
              }}
            >
              {edgeData.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = {
  custom: CustomNodeComponent,
};

const edgeTypes = {
  custom: CustomEdgeComponent,
  customReturn: CustomEdgeReturnComponent,
};

export function TransactionFlow({ actions }: TransactionFlowProps) {
  // Filter to displayable flow actions
  const flowActions = useMemo(
    () =>
      actions.filter(
        (a) =>
          a.type === "transfer" ||
          a.type === "nft_transfer" ||
          a.type === "swap" ||
          a.type === "move_call" ||
          a.type === "split_coins" ||
          a.type === "merge_coins" ||
          a.type === "stake" ||
          a.type === "unstake" ||
          a.type === "nft_purchase" ||
          a.type === "liquidity_add" ||
          a.type === "liquidity_remove" ||
          a.type === "bridge_in" ||
          a.type === "bridge_out" ||
          a.type === "publish" ||
          a.type === "mint" ||
          a.type === "claim_rewards" ||
          a.type === "airdrop_claim" ||
          a.type === "open_position" ||
          a.type === "close_position"
      ),
    [actions]
  );

  const { nodes, edges } = useMemo(() => {
    const nodes: CustomNode[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<string, string>(); // address -> nodeId

    let nodeIndex = 0;
    const getOrCreateNode = (address: string, role: NodeRole, yOffset: number): string => {
      const existing = nodeMap.get(address);
      if (existing) return existing;

      const nodeId = `node-${nodeIndex++}`;
      nodeMap.set(address, nodeId);

      // Increase horizontal spacing for better label visibility
      // Left side: sender, trader, buyer
      // Right side: recipient, dex, contract, validator, pool, seller
      const leftRoles: NodeRole[] = ["sender", "trader", "buyer"];
      const xPos = leftRoles.includes(role) ? 0 : 400;

      nodes.push({
        id: nodeId,
        type: "custom",
        position: { x: xPos, y: yOffset },
        data: {
          label: shortenAddress(address),
          address,
          role,
        },
      });

      return nodeId;
    };

    // Group move_calls by caller-contract pair
    const moveCallGroups = new Map<string, { caller: string; package: string; calls: string[] }>();

    // First pass: collect move_calls into groups
    flowActions.forEach((action) => {
      if (action.type === "move_call") {
        const key = `${action.caller}->${action.package}`;
        if (!moveCallGroups.has(key)) {
          moveCallGroups.set(key, { caller: action.caller, package: action.package, calls: [] });
        }
        const fnDisplay =
          action.function.length > 20 ? `${action.function.slice(0, 20)}...` : action.function;
        moveCallGroups.get(key)!.calls.push(`${action.module}::${fnDisplay}`);
      }
    });

    // Count non-move_call actions for y positioning
    let flowIndex = 0;

    flowActions.forEach((action, index) => {
      // Skip move_calls in this loop - we handle them separately
      if (action.type === "move_call") return;

      const yOffset = flowIndex * 180;
      flowIndex++;

      if (action.type === "transfer") {
        const sourceId = getOrCreateNode(action.from, "sender", yOffset);
        const targetId = getOrCreateNode(action.to, "recipient", yOffset);

        edges.push({
          id: `edge-${index}`,
          source: sourceId,
          target: targetId,
          type: "custom",
          data: {
            label: `${action.amount} ${action.token}`,
            bgColor: "#eff6ff",
            textColor: "#2563eb",
          },
          style: { stroke: "#3b82f6", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
          animated: true,
        });
      }

      if (action.type === "nft_transfer") {
        const sourceId = getOrCreateNode(action.from, "sender", yOffset);
        const targetId = getOrCreateNode(action.to, "recipient", yOffset);

        edges.push({
          id: `edge-${index}`,
          source: sourceId,
          target: targetId,
          type: "custom",
          data: {
            label: action.objectType,
            bgColor: "#faf5ff",
            textColor: "#7c3aed",
          },
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
          animated: true,
        });
      }

      if (action.type === "swap") {
        const traderId = getOrCreateNode(action.trader, "trader", yOffset);
        const dexName = action.dex || "DEX";
        const dexLogo = getDexLogo(dexName);

        // Create DEX node with logo if available
        const dexNodeId = `dex-${index}`;
        if (!nodeMap.has(dexName)) {
          nodeMap.set(dexName, dexNodeId);
          nodes.push({
            id: dexNodeId,
            type: "custom",
            position: { x: 400, y: yOffset },
            data: {
              label: dexName,
              address: dexName,
              role: "dex" as NodeRole,
              logo: dexLogo || undefined,
            },
          });
        }
        const dexId = nodeMap.get(dexName) || dexNodeId;

        // Outgoing edge (token sold) - top path
        edges.push({
          id: `edge-${index}-out`,
          source: traderId,
          target: dexId,
          type: "custom",
          data: {
            label: `-${action.fromAmount} ${action.fromToken}`,
            bgColor: "#fef2f2",
            textColor: "#dc2626",
          },
          style: { stroke: "#ef4444", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
        });

        // Incoming edge (token received) - bottom path
        edges.push({
          id: `edge-${index}-in`,
          source: dexId,
          target: traderId,
          type: "customReturn",
          data: {
            label: `+${action.toAmount} ${action.toToken}`,
            bgColor: "#f0fdf4",
            textColor: "#16a34a",
          },
          style: { stroke: "#10b981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
        });
      }

      // Split Coins visualization: Owner -> multiple coins
      if (action.type === "split_coins") {
        const ownerId = getOrCreateNode(action.owner, "sender", yOffset);

        // Create coin nodes for each split amount
        action.amounts.forEach((amount, amtIdx) => {
          const coinNodeId = `coin-split-${index}-${amtIdx}`;
          const coinYOffset = yOffset + (amtIdx - (action.amounts.length - 1) / 2) * 70;

          nodes.push({
            id: coinNodeId,
            type: "custom",
            position: { x: 400, y: coinYOffset },
            data: {
              label: amount,
              address: coinNodeId,
              role: "coin" as NodeRole,
              amount: amount,
              coinName: action.coinName,
            },
          });

          edges.push({
            id: `edge-split-${index}-${amtIdx}`,
            source: ownerId,
            target: coinNodeId,
            type: "custom",
            data: {
              label: amtIdx === 0 ? "Split" : undefined,
              bgColor: "#ecfeff",
              textColor: "#0891b2",
            },
            style: { stroke: "#06b6d4", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" },
          });
        });
      }

      // Merge Coins visualization: multiple coins -> merged coin
      if (action.type === "merge_coins") {
        // Create source coin nodes
        const sourceCount = action.sourceCount || 2;
        const mergedNodeId = `coin-merged-${index}`;

        // Create merged coin node on the right
        nodes.push({
          id: mergedNodeId,
          type: "custom",
          position: { x: 400, y: yOffset },
          data: {
            label: "Merged",
            address: mergedNodeId,
            role: "merged_coin" as NodeRole,
            amount: action.resultAmount,
            coinName: action.coinName,
          },
        });

        // Create source coin nodes on the left
        for (let i = 0; i < Math.min(sourceCount, 4); i++) {
          const sourceNodeId = `coin-source-${index}-${i}`;
          const sourceYOffset = yOffset + (i - (Math.min(sourceCount, 4) - 1) / 2) * 70;

          nodes.push({
            id: sourceNodeId,
            type: "custom",
            position: { x: 0, y: sourceYOffset },
            data: {
              label: `Coin ${i + 1}`,
              address: sourceNodeId,
              role: "coin" as NodeRole,
              coinName: action.coinName,
            },
          });

          edges.push({
            id: `edge-merge-${index}-${i}`,
            source: sourceNodeId,
            target: mergedNodeId,
            type: "custom",
            data: {
              label: i === 0 ? "Merge" : undefined,
              bgColor: "#ecfdf5",
              textColor: "#059669",
            },
            style: { stroke: "#10b981", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
          });
        }

        // If more than 4 sources, show indicator
        if (sourceCount > 4) {
          const moreNodeId = `coin-more-${index}`;
          nodes.push({
            id: moreNodeId,
            type: "custom",
            position: { x: 0, y: yOffset + 2 * 70 },
            data: {
              label: `+${sourceCount - 4} more`,
              address: moreNodeId,
              role: "coin" as NodeRole,
              coinName: action.coinName,
            },
          });

          edges.push({
            id: `edge-merge-more-${index}`,
            source: moreNodeId,
            target: mergedNodeId,
            type: "custom",
            data: {
              bgColor: "#ecfdf5",
              textColor: "#059669",
            },
            style: { stroke: "#10b981", strokeWidth: 2, strokeDasharray: "5,5" },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
          });
        }
      }

      // Stake visualization: Staker -> Validator
      if (action.type === "stake") {
        const stakerId = getOrCreateNode(action.staker, "sender", yOffset);
        const validatorId = getOrCreateNode(
          action.validatorAddress || "Validator",
          "validator",
          yOffset
        );

        edges.push({
          id: `edge-stake-${index}`,
          source: stakerId,
          target: validatorId,
          type: "custom",
          data: {
            label: `Stake ${action.amount} BNB`,
            bgColor: "#fdf2f8",
            textColor: "#db2777",
          },
          style: { stroke: "#ec4899", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#ec4899" },
          animated: true,
        });
      }

      // Unstake visualization: Validator -> Staker
      if (action.type === "unstake") {
        const validatorId = getOrCreateNode(
          action.validatorAddress || "Validator",
          "validator",
          yOffset
        );
        const stakerId = getOrCreateNode(action.staker, "recipient", yOffset);

        edges.push({
          id: `edge-unstake-${index}`,
          source: validatorId,
          target: stakerId,
          type: "custom",
          data: {
            label: `Unstake ${action.amount} BNB`,
            bgColor: "#fdf2f8",
            textColor: "#db2777",
          },
          style: { stroke: "#ec4899", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#ec4899" },
          animated: true,
        });
      }

      // NFT Purchase visualization: Buyer <-> Seller (bidirectional like swap)
      if (action.type === "nft_purchase") {
        const buyerId = getOrCreateNode(action.buyer, "buyer", yOffset);
        const sellerId = getOrCreateNode(action.seller, "seller", yOffset);

        // Payment from buyer to seller (top path)
        edges.push({
          id: `edge-nft-purchase-pay-${index}`,
          source: buyerId,
          target: sellerId,
          type: "custom",
          data: {
            label: `-${action.price} BNB`,
            bgColor: "#fef2f2",
            textColor: "#dc2626",
          },
          style: { stroke: "#ef4444", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
        });

        // NFT from seller to buyer (bottom path)
        edges.push({
          id: `edge-nft-purchase-nft-${index}`,
          source: sellerId,
          target: buyerId,
          type: "customReturn",
          data: {
            label: action.objectType,
            bgColor: "#faf5ff",
            textColor: "#7c3aed",
          },
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
        });
      }

      // Liquidity Add visualization: Provider -> Pool (two tokens)
      if (action.type === "liquidity_add") {
        const providerId = getOrCreateNode(action.provider, "sender", yOffset);
        const poolId = getOrCreateNode(action.pool || action.dex || "Pool", "pool", yOffset);

        // Both tokens going to pool
        edges.push({
          id: `edge-liq-add-${index}`,
          source: providerId,
          target: poolId,
          type: "custom",
          data: {
            labels: [`+${action.amountA} ${action.tokenA}`, `+${action.amountB} ${action.tokenB}`],
            bgColor: "#f5f3ff",
            textColor: "#7c3aed",
          },
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
          animated: true,
        });
      }

      // Liquidity Remove visualization: Pool -> Provider (two tokens)
      if (action.type === "liquidity_remove") {
        const poolId = getOrCreateNode(action.pool || action.dex || "Pool", "pool", yOffset);
        const providerId = getOrCreateNode(action.provider, "recipient", yOffset);

        // Both tokens coming from pool
        edges.push({
          id: `edge-liq-remove-${index}`,
          source: poolId,
          target: providerId,
          type: "custom",
          data: {
            labels: [`-${action.amountA} ${action.tokenA}`, `-${action.amountB} ${action.tokenB}`],
            bgColor: "#f5f3ff",
            textColor: "#7c3aed",
          },
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
          animated: true,
        });
      }

      // Bridge Out visualization: User -> Bridge (to another chain)
      if (action.type === "bridge_out") {
        const userId = getOrCreateNode(action.user || action.sender || "", "sender", yOffset);
        const bridgeName = action.bridge || "Bridge";
        const bridgeNodeId = `bridge-${index}`;
        const bridgeLogo = getBridgeLogo(bridgeName);

        // Create bridge node with logo
        nodes.push({
          id: bridgeNodeId,
          type: "custom",
          position: { x: 400, y: yOffset },
          data: {
            label: bridgeName,
            address: bridgeName,
            role: "bridge" as NodeRole,
            logo: bridgeLogo || undefined,
          },
        });

        const destChain = action.destinationChain ? ` → ${action.destinationChain}` : "";
        edges.push({
          id: `edge-bridge-out-${index}`,
          source: userId,
          target: bridgeNodeId,
          type: "custom",
          data: {
            label: `${action.amount} ${action.token}${destChain}`,
            bgColor: "#ccfbf1",
            textColor: "#0d9488",
          },
          style: { stroke: "#14b8a6", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#14b8a6" },
          animated: true,
        });
      }

      // Bridge In visualization: Bridge -> User (from another chain)
      if (action.type === "bridge_in") {
        const bridgeName = action.bridge || "Bridge";
        const bridgeNodeId = `bridge-${index}`;
        const bridgeLogo = getBridgeLogo(bridgeName);

        // Create bridge node with logo
        nodes.push({
          id: bridgeNodeId,
          type: "custom",
          position: { x: 0, y: yOffset },
          data: {
            label: bridgeName,
            address: bridgeName,
            role: "bridge" as NodeRole,
            logo: bridgeLogo || undefined,
          },
        });

        const userId = getOrCreateNode(action.user || action.sender || "", "recipient", yOffset);

        const sourceChain = action.sourceChain ? `${action.sourceChain} → ` : "";
        edges.push({
          id: `edge-bridge-in-${index}`,
          source: bridgeNodeId,
          target: userId,
          type: "custom",
          data: {
            label: `${sourceChain}${action.amount} ${action.token}`,
            bgColor: "#ccfbf1",
            textColor: "#0d9488",
          },
          style: { stroke: "#14b8a6", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#14b8a6" },
          animated: true,
        });
      }

      // Publish visualization: Publisher -> Package
      if (action.type === "publish") {
        const publisherId = getOrCreateNode(action.publisher, "sender", yOffset);
        const packageId = getOrCreateNode(action.packageId, "package", yOffset);

        const moduleCount = action.modules.length;
        edges.push({
          id: `edge-publish-${index}`,
          source: publisherId,
          target: packageId,
          type: "custom",
          data: {
            label: `Deploy (${moduleCount} module${moduleCount > 1 ? "s" : ""})`,
            bgColor: "#e0e7ff",
            textColor: "#4f46e5",
          },
          style: { stroke: "#6366f1", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
          animated: true,
        });
      }

      // Mint visualization: Creator -> Created Object
      if (action.type === "mint") {
        const creatorId = getOrCreateNode(action.creator, "sender", yOffset);
        const createdId = getOrCreateNode(action.objectId, "created", yOffset);

        // Extract short type name from full object type
        const typeParts = action.objectType.split("::");
        const shortType =
          typeParts.length > 1 ? typeParts[typeParts.length - 1] : action.objectType;

        edges.push({
          id: `edge-mint-${index}`,
          source: creatorId,
          target: createdId,
          type: "custom",
          data: {
            label: `Mint ${shortType}`,
            bgColor: "#fff7ed",
            textColor: "#ea580c",
          },
          style: { stroke: "#f97316", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#f97316" },
          animated: true,
        });
      }

      // Claim Rewards visualization: Protocol -> Claimer
      if (action.type === "claim_rewards") {
        const protocolId = getOrCreateNode(action.protocol || "Protocol", "reward", yOffset);
        const claimerId = getOrCreateNode(action.claimer, "recipient", yOffset);

        edges.push({
          id: `edge-claim-${index}`,
          source: protocolId,
          target: claimerId,
          type: "custom",
          data: {
            label: `+${action.amount} ${action.token}`,
            bgColor: "#fefce8",
            textColor: "#ca8a04",
          },
          style: { stroke: "#eab308", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#eab308" },
          animated: true,
        });
      }

      // Airdrop Claim visualization: Airdrop -> Claimer
      if (action.type === "airdrop_claim") {
        const airdropId = getOrCreateNode(action.campaign || "Airdrop", "reward", yOffset);
        const claimerId = getOrCreateNode(action.claimer, "recipient", yOffset);

        edges.push({
          id: `edge-airdrop-${index}`,
          source: airdropId,
          target: claimerId,
          type: "custom",
          data: {
            label: `+${action.amount} ${action.token}`,
            bgColor: "#fefce8",
            textColor: "#ca8a04",
          },
          style: { stroke: "#eab308", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#eab308" },
          animated: true,
        });
      }

      // Open Position visualization: Trader -> Protocol
      if (action.type === "open_position") {
        const traderId = getOrCreateNode(action.trader, "trader", yOffset);
        const protocolId = getOrCreateNode(action.protocol || "Perp", "protocol", yOffset);

        const sideLabel = action.side === "long" ? "Long" : "Short";
        const leverageLabel = action.leverage ? ` ${action.leverage}x` : "";
        edges.push({
          id: `edge-open-pos-${index}`,
          source: traderId,
          target: protocolId,
          type: "custom",
          data: {
            label: `${sideLabel}${leverageLabel} ${action.size} ${action.market}`,
            bgColor: action.side === "long" ? "#dcfce7" : "#fee2e2",
            textColor: action.side === "long" ? "#16a34a" : "#dc2626",
          },
          style: { stroke: action.side === "long" ? "#22c55e" : "#ef4444", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: action.side === "long" ? "#22c55e" : "#ef4444",
          },
          animated: true,
        });
      }

      // Close Position visualization: Protocol -> Trader
      if (action.type === "close_position") {
        const protocolId = getOrCreateNode(action.protocol || "Perp", "protocol", yOffset);
        const traderId = getOrCreateNode(action.trader, "recipient", yOffset);

        const pnlLabel = action.pnl ? ` (PnL: ${action.pnl})` : "";
        edges.push({
          id: `edge-close-pos-${index}`,
          source: protocolId,
          target: traderId,
          type: "custom",
          data: {
            label: `Close ${action.size} ${action.market}${pnlLabel}`,
            bgColor: "#e0f2fe",
            textColor: "#0284c7",
          },
          style: { stroke: "#0ea5e9", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#0ea5e9" },
          animated: true,
        });
      }

      // Contract Call visualization: Caller -> Contract
      if (action.type === "contract_call") {
        const callerId = getOrCreateNode(action.caller, "sender", yOffset);
        const contractId = getOrCreateNode(action.contract, "contract", yOffset);

        const methodLabel = action.method.slice(0, 10);
        const protocolLabel = action.protocol ? ` via ${action.protocol}` : "";

        edges.push({
          id: `edge-contract-call-${index}`,
          source: callerId,
          target: contractId,
          type: "custom",
          data: {
            label: `Call ${methodLabel}${protocolLabel}`,
            bgColor: "#f1f5f9",
            textColor: "#475569",
          },
          style: { stroke: "#64748b", strokeWidth: 2, strokeDasharray: "5,5" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
        });
      }
    });

    // Second pass: create grouped move_call edges
    let moveCallIndex = 0;
    moveCallGroups.forEach((group, key) => {
      const yOffset = flowIndex * 180 + moveCallIndex * 180;
      moveCallIndex++;

      const callerId = getOrCreateNode(group.caller, "sender", yOffset);
      const contractId = getOrCreateNode(group.package, "contract", yOffset);

      // Use labels array for multiple calls, single label for one call
      const edgeData: CustomEdgeData =
        group.calls.length > 1
          ? {
              labels: group.calls,
              bgColor: "#fffbeb",
              textColor: "#d97706",
            }
          : {
              label: group.calls[0],
              bgColor: "#fffbeb",
              textColor: "#d97706",
            };

      edges.push({
        id: `edge-movecall-${key}`,
        source: callerId,
        target: contractId,
        type: "custom",
        data: edgeData,
        style: { stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "5,5" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
      });
    });

    return { nodes, edges };
  }, [flowActions]);

  const onInit = useCallback(() => {
    // Fit view on init
  }, []);

  if (flowActions.length === 0) return null;

  // Calculate height based on unique flows (grouped move_calls count as one)
  const nonMoveCallCount = flowActions.filter((a) => a.type !== "move_call").length;
  const moveCallGroupsCount = new Set(
    flowActions.filter((a) => a.type === "move_call").map((a) => `${a.caller}->${a.package}`)
  ).size;

  // Split/merge may need extra height for multiple coins
  const splitMergeExtra = flowActions.reduce((acc, a) => {
    if (a.type === "split_coins") {
      return acc + Math.max(0, (a.amounts.length - 2) * 35);
    }
    if (a.type === "merge_coins") {
      return acc + Math.max(0, (Math.min(a.sourceCount, 4) - 2) * 35);
    }
    return acc;
  }, 0);

  const totalFlows = nonMoveCallCount + moveCallGroupsCount;
  const flowHeight = Math.max(280, totalFlows * 180 + 80 + splitMergeExtra);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50">
            <svg
              className="h-4 w-4 text-sky-600 dark:text-sky-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Transaction Flow
          </h3>
        </div>
      </div>
      <div style={{ height: flowHeight }} className="min-h-[280px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onInit={onInit}
          fitView
          fitViewOptions={{ padding: 0.3, minZoom: 0.5, maxZoom: 1.5 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={true}
          zoomOnScroll={false}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          preventScrolling={true}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background color="#e2e8f0" gap={16} size={1} />
          <Controls
            showZoom={true}
            showFitView={true}
            showInteractive={false}
            position="bottom-right"
            className="!border-slate-200 !bg-white !shadow-sm dark:!border-slate-700 dark:!bg-slate-800"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

import type { Transaction, TransactionReceipt, Block } from "viem";
import type {
  TransactionType,
  ExplanationResult,
  ParsedTransaction,
  GasInfo,
  BalanceChangeInfo,
} from "./types";
import { shortenAddress, formatBnbAmount, formatTokenAmount } from "./format-utils";
import {
  getProtocolName,
  getProtocolInfo,
  identifyDex,
  identifyLendingProtocol,
  identifyNftMarketplace,
  identifyBridge,
  identifyStaking,
} from "./known-packages";
import { getTokenInfo } from "./token-images";

// Helper function to convert BigInt values to strings for JSON serialization
function serializeBigInts<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return String(obj) as T;
  if (Array.isArray(obj)) return obj.map(serializeBigInts) as T;
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInts(value);
    }
    return result as T;
  }
  return obj;
}

// Common EVM event signatures
const EVENT_SIGNATURES = {
  // ERC20
  TRANSFER: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  APPROVAL: "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
  // DEX Swaps
  SWAP_V2: "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
  SWAP_V3: "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67",
  // Liquidity
  MINT_V2: "0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f",
  BURN_V2: "0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496",
  // NFT
  TRANSFER_SINGLE: "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62",
  TRANSFER_BATCH: "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb",
  // Staking
  DEPOSIT: "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c",
  WITHDRAW: "0x884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364",
  // Bridge
  SEND_TO_CHAIN: "0x9d5c7c0b934da8fefa9c7760c98383778a12dfbfc0c3b3106c3f8b2a3f9b7f9a",
} as const;

// Common function selectors
const FUNCTION_SELECTORS = {
  // ERC20
  TRANSFER: "0xa9059cbb",
  APPROVE: "0x095ea7b3",
  TRANSFER_FROM: "0x23b872dd",
  // DEX
  SWAP_EXACT_TOKENS: "0x38ed1739",
  SWAP_TOKENS_FOR_EXACT: "0x8803dbee",
  SWAP_EXACT_ETH: "0x7ff36ab5",
  SWAP_TOKENS_FOR_ETH: "0x18cbafe5",
  SWAP_ETH_FOR_TOKENS: "0xfb3bdb41",
  MULTICALL: "0x5ae401dc",
  EXECUTE: "0x3593564c",
  // Liquidity
  ADD_LIQUIDITY: "0xe8e33700",
  ADD_LIQUIDITY_ETH: "0xf305d719",
  REMOVE_LIQUIDITY: "0xbaa2abde",
  REMOVE_LIQUIDITY_ETH: "0x02751cec",
  // Staking
  STAKE: "0xa694fc3a",
  UNSTAKE: "0x2e17de78",
  CLAIM_REWARDS: "0x372500ab",
  DEPOSIT: "0xb6b55f25",
  WITHDRAW: "0x2e1a7d4d",
  // Bridge
  SWAP_BRIDGE: "0x9fbf10fc",
  SEND_FROM: "0xc19d93fb",
} as const;

// Common revert reason signatures (reserved for future use)
const _REVERT_REASONS: Record<string, string> = {
  "0x08c379a0": "Error(string)",
  "0x4e487b71": "Panic(uint256)",
};

const _PANIC_CODES: Record<string, string> = {
  "0x00": "Generic panic",
  "0x01": "Assertion failed",
  "0x11": "Arithmetic overflow/underflow",
  "0x12": "Division by zero",
  "0x21": "Invalid enum value",
  "0x22": "Storage byte array encoding error",
  "0x31": "pop() on empty array",
  "0x32": "Array out of bounds",
  "0x41": "Too much memory allocated",
  "0x51": "Called zero-initialized function",
};

// Parse revert reason from transaction
function parseRevertReason(receipt: TransactionReceipt, input: string): string | undefined {
  if (receipt.status === "success") return undefined;

  // Try to decode common revert patterns
  // This is a simplified version - full implementation would need ABI decoding

  // Check for common failure patterns
  if (input.includes("095ea7b3")) {
    return "Token approval may have failed - check allowance";
  }

  if (input.includes("a9059cbb")) {
    return "Transfer failed - insufficient balance or not approved";
  }

  const swapSelectors = ["38ed1739", "7ff36ab5", "18cbafe5", "fb3bdb41"];
  if (swapSelectors.some((s) => input.includes(s))) {
    return "Swap failed - possibly due to slippage, insufficient liquidity, or expired deadline";
  }

  return "Transaction reverted - check contract requirements";
}

export function parseTransaction(
  tx: Transaction,
  receipt: TransactionReceipt,
  block: Block
): ParsedTransaction {
  const sender = tx.from;
  const status = receipt.status === "success" ? "success" : "failure";
  const revertReason = parseRevertReason(receipt, tx.input || "0x");

  return {
    digest: tx.hash,
    timestamp: block.timestamp ? String(Number(block.timestamp) * 1000) : null,
    sender,
    status,
    error: status === "failure" ? revertReason : undefined,
    explanation: explainTransaction(tx, receipt),
    gasInfo: extractGasInfo(tx, receipt),
    objectChanges: [],
    balanceChanges: extractBalanceChanges(tx, receipt, sender),
    moveCalls: [],
    rawTransaction: serializeBigInts({ tx, receipt }),
    checkpoint: String(receipt.blockNumber),
  };
}

function extractGasInfo(tx: Transaction, receipt: TransactionReceipt): GasInfo {
  const gasUsed = receipt.gasUsed;
  const gasPrice = receipt.effectiveGasPrice || tx.gasPrice || BigInt(0);
  const totalGas = gasUsed * gasPrice;
  const gasPriceGwei = Number(gasPrice) / 1e9;

  return {
    totalGas: formatBnbAmount(totalGas),
    computationCost: formatBnbAmount(totalGas),
    storageCost: "0",
    storageRebate: "0",
    gasPayer: tx.from,
    gasPrice: gasPriceGwei.toFixed(2),
    isSponsored: false,
  };
}

function extractBalanceChanges(
  tx: Transaction,
  receipt: TransactionReceipt,
  sender: string
): BalanceChangeInfo[] {
  const changes: BalanceChangeInfo[] = [];

  // Native BNB balance changes
  const bnbValue = BigInt(tx.value || 0);
  const gasUsed = BigInt(receipt.gasUsed || 0);
  const effectiveGasPrice = BigInt(receipt.effectiveGasPrice || tx.gasPrice || 0);
  const gasCost = gasUsed * effectiveGasPrice;

  if (bnbValue > 0 || gasCost > 0) {
    const totalSent = bnbValue + gasCost;
    if (totalSent > 0) {
      changes.push({
        owner: sender,
        coinType: "native",
        amount: formatBnbAmount(-totalSent),
        coinName: "BNB",
        isPositive: false,
      });
    }

    // Recipient gets BNB (if transfer)
    if (bnbValue > 0 && tx.to) {
      changes.push({
        owner: tx.to,
        coinType: "native",
        amount: formatBnbAmount(bnbValue),
        coinName: "BNB",
        isPositive: true,
      });
    }
  }

  // ERC-20 token balance changes
  const transferLogs = receipt.logs.filter((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);

  for (const log of transferLogs) {
    if (log.topics.length < 3) continue;

    const from = "0x" + log.topics[1]?.slice(26);
    const to = "0x" + log.topics[2]?.slice(26);
    const amount = log.data !== "0x" ? BigInt(log.data) : BigInt(0);

    const tokenInfo = getTokenInfo(log.address);
    const decimals = tokenInfo?.decimals || 18;
    const symbol = tokenInfo?.symbol || shortenAddress(log.address);

    if (from.toLowerCase() === sender.toLowerCase()) {
      changes.push({
        owner: sender,
        coinType: log.address,
        amount: formatTokenAmount(-amount, decimals),
        coinName: symbol,
        isPositive: false,
      });
    }

    if (to.toLowerCase() === sender.toLowerCase()) {
      changes.push({
        owner: sender,
        coinType: log.address,
        amount: formatTokenAmount(amount, decimals),
        coinName: symbol,
        isPositive: true,
      });
    }
  }

  return changes;
}

function detectTransactionType(tx: Transaction, receipt: TransactionReceipt): TransactionType {
  const input = tx.input || "0x";
  const selector = input.slice(0, 10).toLowerCase();
  const logs = receipt.logs;
  const to = tx.to?.toLowerCase();

  // Contract creation
  if (!tx.to && receipt.contractAddress) {
    return "publish";
  }

  // Native BNB transfer
  if (input === "0x" || input.length <= 2) {
    return "transfer";
  }

  // Token Approval
  if (selector === FUNCTION_SELECTORS.APPROVE) {
    return "approval";
  }

  // Check for swap events
  const hasSwapV2 = logs.some((log) => log.topics[0] === EVENT_SIGNATURES.SWAP_V2);
  const hasSwapV3 = logs.some((log) => log.topics[0] === EVENT_SIGNATURES.SWAP_V3);
  if (hasSwapV2 || hasSwapV3) {
    return "swap";
  }

  // Liquidity events
  const hasMint = logs.some((log) => log.topics[0] === EVENT_SIGNATURES.MINT_V2);
  const hasBurn = logs.some((log) => log.topics[0] === EVENT_SIGNATURES.BURN_V2);
  if (hasMint) return "liquidity_add";
  if (hasBurn) return "liquidity_remove";

  // Function selectors
  switch (selector) {
    case FUNCTION_SELECTORS.TRANSFER:
    case FUNCTION_SELECTORS.TRANSFER_FROM:
      const transferLogs = logs.filter((l) => l.topics[0] === EVENT_SIGNATURES.TRANSFER);
      const isNftTransfer = transferLogs.some((l) => l.topics.length === 4);
      return isNftTransfer ? "nft_transfer" : "transfer";

    case FUNCTION_SELECTORS.SWAP_EXACT_TOKENS:
    case FUNCTION_SELECTORS.SWAP_TOKENS_FOR_EXACT:
    case FUNCTION_SELECTORS.SWAP_EXACT_ETH:
    case FUNCTION_SELECTORS.SWAP_TOKENS_FOR_ETH:
    case FUNCTION_SELECTORS.SWAP_ETH_FOR_TOKENS:
      return "swap";

    case FUNCTION_SELECTORS.MULTICALL:
    case FUNCTION_SELECTORS.EXECUTE:
      if (hasSwapV2 || hasSwapV3) return "swap";
      return "generic";

    case FUNCTION_SELECTORS.ADD_LIQUIDITY:
    case FUNCTION_SELECTORS.ADD_LIQUIDITY_ETH:
      return "liquidity_add";

    case FUNCTION_SELECTORS.REMOVE_LIQUIDITY:
    case FUNCTION_SELECTORS.REMOVE_LIQUIDITY_ETH:
      return "liquidity_remove";

    case FUNCTION_SELECTORS.STAKE:
    case FUNCTION_SELECTORS.DEPOSIT:
      return "stake";

    case FUNCTION_SELECTORS.UNSTAKE:
    case FUNCTION_SELECTORS.WITHDRAW:
      if (to && identifyLendingProtocol(to)) return "withdraw";
      return "unstake";

    case FUNCTION_SELECTORS.CLAIM_REWARDS:
      return "claim_rewards";

    case FUNCTION_SELECTORS.SWAP_BRIDGE:
    case FUNCTION_SELECTORS.SEND_FROM:
      return "bridge";
  }

  // NFT events
  const hasNftTransfer = logs.some(
    (log) =>
      log.topics[0] === EVENT_SIGNATURES.TRANSFER_SINGLE ||
      log.topics[0] === EVENT_SIGNATURES.TRANSFER_BATCH
  );
  if (hasNftTransfer) {
    return "nft_transfer";
  }

  // Check by contract address
  if (to) {
    const bridge = identifyBridge(to);
    if (bridge) return "bridge";

    const staking = identifyStaking(to);
    if (staking) return "stake";

    const dex = identifyDex(to);
    if (dex) return "swap";

    const lending = identifyLendingProtocol(to);
    if (lending) {
      if (input.includes("borrow")) return "borrow";
      if (input.includes("repay")) return "repay";
      if (input.includes("supply") || input.includes("deposit")) return "supply";
      if (input.includes("withdraw")) return "withdraw";
    }

    const nftMarket = identifyNftMarketplace(to);
    if (nftMarket) return "nft_purchase";
  }

  return "generic";
}

export function explainTransaction(
  tx: Transaction,
  receipt: TransactionReceipt
): ExplanationResult {
  const type = detectTransactionType(tx, receipt);

  switch (type) {
    case "transfer":
      return explainTransfer(tx, receipt);
    case "approval":
      return explainApproval(tx, receipt);
    case "swap":
      return explainSwap(tx, receipt);
    case "liquidity_add":
    case "liquidity_remove":
      return explainLiquidity(tx, receipt, type === "liquidity_add");
    case "nft_transfer":
      return explainNftTransfer(tx, receipt);
    case "nft_purchase":
      return explainNftPurchase(tx, receipt);
    case "publish":
      return explainContractDeploy(tx, receipt);
    case "borrow":
      return explainBorrow(tx, receipt);
    case "repay":
      return explainRepay(tx, receipt);
    case "supply":
      return explainSupply(tx, receipt);
    case "withdraw":
      return explainWithdraw(tx, receipt);
    case "stake":
      return explainStake(tx, receipt);
    case "unstake":
      return explainUnstake(tx, receipt);
    case "claim_rewards":
      return explainClaimRewards(tx, receipt);
    case "bridge":
      return explainBridge(tx, receipt);
    default:
      return explainGeneric(tx, receipt);
  }
}

function explainApproval(tx: Transaction, _receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const tokenAddress = tx.to || "";
  const input = tx.input || "0x";

  // Decode approval data
  const spender = "0x" + input.slice(34, 74);
  const amountHex = input.slice(74);
  const amount = amountHex ? BigInt("0x" + amountHex) : BigInt(0);

  const tokenInfo = getTokenInfo(tokenAddress);
  const tokenSymbol = tokenInfo?.symbol || shortenAddress(tokenAddress);
  const decimals = tokenInfo?.decimals || 18;

  // Check if unlimited approval
  const isUnlimited = amount >= BigInt("0xffffffffffffffffffffffffffffffff");
  const formattedAmount = isUnlimited ? "Unlimited" : formatTokenAmount(amount, decimals);

  // Identify spender protocol
  const spenderName = getProtocolName(spender.toLowerCase()) || shortenAddress(spender);
  const spenderInfo = getProtocolInfo(spender.toLowerCase());

  const warningDetails: string[] = [];
  if (isUnlimited) {
    warningDetails.push(
      "⚠️ This is an unlimited approval - the spender can use any amount of your tokens"
    );
  }

  return {
    summary: `${shortenAddress(sender)} approved ${formattedAmount} ${tokenSymbol} for ${spenderName}.`,
    details: [
      `Token: ${tokenSymbol}`,
      `Amount: ${formattedAmount}`,
      `Spender: ${spenderName}`,
      `Spender Address: ${shortenAddress(spender)}`,
      ...warningDetails,
    ],
    type: "approval",
    participants: [
      { address: sender, role: "owner" },
      { address: spender, role: "spender" },
    ],
    actions: [
      {
        type: "approval",
        owner: sender,
        spender,
        token: tokenSymbol,
        tokenAddress,
        amount: formattedAmount,
        isUnlimited,
        spenderProtocol: spenderName,
        spenderLogo: spenderInfo?.logo,
      },
    ],
    metadata: {
      isUnlimitedApproval: isUnlimited,
      spenderLogo: spenderInfo?.logo,
    },
  };
}

function explainTransfer(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const logs = receipt.logs;

  const transferLog = logs.find((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);

  if (transferLog && transferLog.topics.length >= 3) {
    const to = "0x" + transferLog.topics[2]?.slice(26);
    const amount = transferLog.data !== "0x" ? BigInt(transferLog.data) : BigInt(0);
    const tokenInfo = getTokenInfo(transferLog.address);
    const decimals = tokenInfo?.decimals || 18;
    const symbol = tokenInfo?.symbol || shortenAddress(transferLog.address);
    const formattedAmount = formatTokenAmount(amount, decimals);

    return {
      summary: `${shortenAddress(sender)} transferred ${formattedAmount} ${symbol} to ${shortenAddress(to)}.`,
      details: [
        `Amount: ${formattedAmount} ${symbol}`,
        `From: ${shortenAddress(sender)}`,
        `To: ${shortenAddress(to)}`,
        `Token: ${transferLog.address}`,
      ],
      type: "transfer",
      participants: [
        { address: sender, role: "sender" },
        { address: to, role: "recipient" },
      ],
      actions: [
        {
          type: "transfer",
          from: sender,
          to,
          amount: formattedAmount,
          token: symbol,
          coinType: transferLog.address,
          tokenLogo: tokenInfo?.image,
        },
      ],
      metadata: {
        tokenLogo: tokenInfo?.image,
      },
    };
  }

  // Native BNB transfer
  const to = tx.to || "Unknown";
  const amount = formatBnbAmount(tx.value);

  return {
    summary: `${shortenAddress(sender)} transferred ${amount} BNB to ${shortenAddress(to)}.`,
    details: [
      `Amount: ${amount} BNB`,
      `From: ${shortenAddress(sender)}`,
      `To: ${shortenAddress(to)}`,
    ],
    type: "transfer",
    participants: [
      { address: sender, role: "sender" },
      { address: to, role: "recipient" },
    ],
    actions: [
      {
        type: "transfer",
        from: sender,
        to,
        amount,
        token: "BNB",
        coinType: "native",
      },
    ],
  };
}

function explainSwap(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const logs = receipt.logs;
  const to = tx.to?.toLowerCase() || "";

  const dexName = identifyDex(to) || getProtocolName(to);
  const dexInfo = getProtocolInfo(to);

  const transferLogs = logs.filter((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);

  let tokenIn: {
    address: string;
    amount: bigint;
    symbol: string;
    decimals: number;
    logo?: string;
  } | null = null;
  let tokenOut: {
    address: string;
    amount: bigint;
    symbol: string;
    decimals: number;
    logo?: string;
  } | null = null;

  // Track all swaps for multi-hop detection
  const swapEvents = logs.filter(
    (log) =>
      log.topics[0] === EVENT_SIGNATURES.SWAP_V2 || log.topics[0] === EVENT_SIGNATURES.SWAP_V3
  );
  const isMultiHop = swapEvents.length > 1;

  for (const log of transferLogs) {
    if (log.topics.length < 3) continue;

    const from = "0x" + log.topics[1]?.slice(26);
    const logTo = "0x" + log.topics[2]?.slice(26);
    const amount = log.data !== "0x" ? BigInt(log.data) : BigInt(0);

    const tokenInfo = getTokenInfo(log.address);
    const decimals = tokenInfo?.decimals || 18;
    const symbol = tokenInfo?.symbol || shortenAddress(log.address);

    if (from.toLowerCase() === sender.toLowerCase()) {
      tokenIn = { address: log.address, amount, symbol, decimals, logo: tokenInfo?.image };
    }
    if (logTo.toLowerCase() === sender.toLowerCase()) {
      tokenOut = { address: log.address, amount, symbol, decimals, logo: tokenInfo?.image };
    }
  }

  if (tx.value > BigInt(0) && !tokenIn) {
    tokenIn = { address: "native", amount: tx.value, symbol: "BNB", decimals: 18 };
  }

  const spentAmount = tokenIn ? formatTokenAmount(tokenIn.amount, tokenIn.decimals) : "?";
  const spentName = tokenIn?.symbol || "?";
  const receivedAmount = tokenOut ? formatTokenAmount(tokenOut.amount, tokenOut.decimals) : "?";
  const receivedName = tokenOut?.symbol || "?";

  // Calculate price impact estimate (simplified)
  let priceInfo = "";
  if (tokenIn && tokenOut && tokenIn.amount > 0 && tokenOut.amount > 0) {
    const rate = Number(tokenOut.amount) / Number(tokenIn.amount);
    priceInfo = `Rate: 1 ${spentName} = ${rate.toFixed(6)} ${receivedName}`;
  }

  const dexSuffix = dexName ? ` on ${dexName}` : "";
  const hopInfo = isMultiHop ? " (multi-hop)" : "";

  return {
    summary: `${shortenAddress(sender)} swapped ${spentAmount} ${spentName} for ${receivedAmount} ${receivedName}${dexSuffix}${hopInfo}.`,
    details: [
      `Sold: ${spentAmount} ${spentName}`,
      `Received: ${receivedAmount} ${receivedName}`,
      ...(priceInfo ? [priceInfo] : []),
      `Trader: ${shortenAddress(sender)}`,
      ...(dexName ? [`DEX: ${dexName}`] : []),
      ...(isMultiHop ? [`Route: ${swapEvents.length} hops`] : []),
    ],
    type: "swap",
    participants: [{ address: sender, role: "trader" }],
    actions: [
      {
        type: "swap",
        trader: sender,
        fromToken: spentName,
        fromAmount: spentAmount,
        fromLogo: tokenIn?.logo,
        toToken: receivedName,
        toAmount: receivedAmount,
        toLogo: tokenOut?.logo,
        dex: dexName,
        dexLogo: dexInfo?.logo,
        isMultiHop,
        hops: swapEvents.length,
      },
    ],
    metadata: {
      dexLogo: dexInfo?.logo,
      fromTokenLogo: tokenIn?.logo,
      toTokenLogo: tokenOut?.logo,
      isMultiHop,
    },
  };
}

function explainStake(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const to = tx.to?.toLowerCase() || "";
  const protocol = identifyStaking(to) || getProtocolName(to);
  const protocolInfo = getProtocolInfo(to);

  const transferLogs = receipt.logs.filter((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);
  const sent = transferLogs.find((log) => {
    const from = "0x" + log.topics[1]?.slice(26);
    return from.toLowerCase() === sender.toLowerCase();
  });

  let amount = formatBnbAmount(tx.value);
  let tokenName = "BNB";

  if (sent) {
    const tokenInfo = getTokenInfo(sent.address);
    const decimals = tokenInfo?.decimals || 18;
    tokenName = tokenInfo?.symbol || shortenAddress(sent.address);
    amount = formatTokenAmount(BigInt(sent.data || "0"), decimals);
  }

  return {
    summary: `${shortenAddress(sender)} staked ${amount} ${tokenName}${protocol ? ` on ${protocol}` : ""}.`,
    details: [
      `Staker: ${shortenAddress(sender)}`,
      `Amount: ${amount} ${tokenName}`,
      ...(protocol ? [`Protocol: ${protocol}`] : []),
    ],
    type: "stake",
    participants: [{ address: sender, role: "staker" }],
    actions: [
      {
        type: "stake",
        staker: sender,
        token: tokenName,
        amount,
        protocol: protocol || undefined,
        protocolLogo: protocolInfo?.logo,
      },
    ],
    metadata: {
      protocolLogo: protocolInfo?.logo,
    },
  };
}

function explainUnstake(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const to = tx.to?.toLowerCase() || "";
  const protocol = identifyStaking(to) || getProtocolName(to);
  const protocolInfo = getProtocolInfo(to);

  const transferLogs = receipt.logs.filter((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);
  const received = transferLogs.find((log) => {
    const logTo = "0x" + log.topics[2]?.slice(26);
    return logTo.toLowerCase() === sender.toLowerCase();
  });

  let amount = "?";
  let tokenName = "tokens";

  if (received) {
    const tokenInfo = getTokenInfo(received.address);
    const decimals = tokenInfo?.decimals || 18;
    tokenName = tokenInfo?.symbol || shortenAddress(received.address);
    amount = formatTokenAmount(BigInt(received.data || "0"), decimals);
  }

  return {
    summary: `${shortenAddress(sender)} unstaked ${amount} ${tokenName}${protocol ? ` from ${protocol}` : ""}.`,
    details: [
      `Staker: ${shortenAddress(sender)}`,
      `Amount: ${amount} ${tokenName}`,
      ...(protocol ? [`Protocol: ${protocol}`] : []),
    ],
    type: "unstake",
    participants: [{ address: sender, role: "staker" }],
    actions: [
      {
        type: "unstake",
        staker: sender,
        token: tokenName,
        amount,
        protocol: protocol || undefined,
        protocolLogo: protocolInfo?.logo,
      },
    ],
    metadata: {
      protocolLogo: protocolInfo?.logo,
    },
  };
}

function explainClaimRewards(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const to = tx.to?.toLowerCase() || "";
  const protocol = identifyStaking(to) || getProtocolName(to);
  const protocolInfo = getProtocolInfo(to);

  const transferLogs = receipt.logs.filter((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);
  const rewards: { token: string; amount: string }[] = [];

  for (const log of transferLogs) {
    const logTo = "0x" + log.topics[2]?.slice(26);
    if (logTo.toLowerCase() === sender.toLowerCase()) {
      const tokenInfo = getTokenInfo(log.address);
      const decimals = tokenInfo?.decimals || 18;
      const tokenName = tokenInfo?.symbol || shortenAddress(log.address);
      rewards.push({
        token: tokenName,
        amount: formatTokenAmount(BigInt(log.data || "0"), decimals),
      });
    }
  }

  const rewardSummary =
    rewards.length > 0 ? rewards.map((r) => `${r.amount} ${r.token}`).join(", ") : "rewards";

  return {
    summary: `${shortenAddress(sender)} claimed ${rewardSummary}${protocol ? ` from ${protocol}` : ""}.`,
    details: [
      `Claimer: ${shortenAddress(sender)}`,
      ...rewards.map((r) => `Reward: ${r.amount} ${r.token}`),
      ...(protocol ? [`Protocol: ${protocol}`] : []),
    ],
    type: "claim_rewards",
    participants: [{ address: sender, role: "claimer" }],
    actions: [
      {
        type: "claim_rewards",
        claimer: sender,
        rewards,
        protocol: protocol || undefined,
        protocolLogo: protocolInfo?.logo,
      },
    ],
    metadata: {
      protocolLogo: protocolInfo?.logo,
    },
  };
}

function explainBridge(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const to = tx.to?.toLowerCase() || "";
  const bridge = identifyBridge(to) || getProtocolName(to);
  const bridgeInfo = getProtocolInfo(to);

  const transferLogs = receipt.logs.filter((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);
  const sent = transferLogs.find((log) => {
    const from = "0x" + log.topics[1]?.slice(26);
    return from.toLowerCase() === sender.toLowerCase();
  });

  let amount = formatBnbAmount(tx.value);
  let tokenName = "BNB";

  if (sent) {
    const tokenInfo = getTokenInfo(sent.address);
    const decimals = tokenInfo?.decimals || 18;
    tokenName = tokenInfo?.symbol || shortenAddress(sent.address);
    amount = formatTokenAmount(BigInt(sent.data || "0"), decimals);
  }

  return {
    summary: `${shortenAddress(sender)} bridged ${amount} ${tokenName}${bridge ? ` via ${bridge}` : ""}.`,
    details: [
      `Sender: ${shortenAddress(sender)}`,
      `Amount: ${amount} ${tokenName}`,
      ...(bridge ? [`Bridge: ${bridge}`] : []),
    ],
    type: "bridge",
    participants: [{ address: sender, role: "sender" }],
    actions: [
      {
        type: "bridge",
        sender,
        token: tokenName,
        amount,
        bridge: bridge || undefined,
        bridgeLogo: bridgeInfo?.logo,
      },
    ],
    metadata: {
      bridgeLogo: bridgeInfo?.logo,
    },
  };
}

function explainLiquidity(
  tx: Transaction,
  receipt: TransactionReceipt,
  isAdd: boolean
): ExplanationResult {
  const sender = tx.from;
  const to = tx.to?.toLowerCase() || "";
  const dexName = identifyDex(to) || getProtocolName(to);
  const dexInfo = getProtocolInfo(to);

  const transferLogs = receipt.logs.filter((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);
  const tokens: { name: string; amount: string; logo?: string }[] = [];

  for (const log of transferLogs) {
    if (log.topics.length < 3) continue;

    const from = "0x" + log.topics[1]?.slice(26);
    const logTo = "0x" + log.topics[2]?.slice(26);
    const amount = log.data !== "0x" ? BigInt(log.data) : BigInt(0);

    const tokenInfo = getTokenInfo(log.address);
    const decimals = tokenInfo?.decimals || 18;
    const symbol = tokenInfo?.symbol || shortenAddress(log.address);

    if (isAdd && from.toLowerCase() === sender.toLowerCase()) {
      tokens.push({
        name: symbol,
        amount: formatTokenAmount(amount, decimals),
        logo: tokenInfo?.image,
      });
    }
    if (!isAdd && logTo.toLowerCase() === sender.toLowerCase()) {
      tokens.push({
        name: symbol,
        amount: formatTokenAmount(amount, decimals),
        logo: tokenInfo?.image,
      });
    }
  }

  if (isAdd && tx.value > BigInt(0)) {
    tokens.unshift({ name: "BNB", amount: formatBnbAmount(tx.value) });
  }

  const action = isAdd ? "added liquidity" : "removed liquidity";
  const dexSuffix = dexName ? ` on ${dexName}` : "";
  const tokenDesc =
    tokens.length >= 2
      ? `${tokens[0].amount} ${tokens[0].name} + ${tokens[1].amount} ${tokens[1].name}`
      : tokens.length === 1
        ? `${tokens[0].amount} ${tokens[0].name}`
        : "tokens";

  return {
    summary: `${shortenAddress(sender)} ${action}: ${tokenDesc}${dexSuffix}.`,
    details: [
      `Provider: ${shortenAddress(sender)}`,
      `Action: ${isAdd ? "Add Liquidity" : "Remove Liquidity"}`,
      ...tokens.map((t) => `${t.name}: ${t.amount}`),
      ...(dexName ? [`Protocol: ${dexName}`] : []),
    ],
    type: isAdd ? "liquidity_add" : "liquidity_remove",
    participants: [{ address: sender, role: "provider" }],
    actions: [
      {
        type: isAdd ? "liquidity_add" : "liquidity_remove",
        provider: sender,
        tokenA: tokens[0]?.name || "",
        amountA: tokens[0]?.amount || "",
        tokenALogo: tokens[0]?.logo,
        tokenB: tokens[1]?.name || "",
        amountB: tokens[1]?.amount || "",
        tokenBLogo: tokens[1]?.logo,
        dex: dexName || undefined,
        dexLogo: dexInfo?.logo,
      },
    ],
    metadata: {
      dexLogo: dexInfo?.logo,
    },
  };
}

function explainNftTransfer(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const logs = receipt.logs;

  const nftLog = logs.find(
    (log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER && log.topics.length === 4
  );

  if (nftLog) {
    const to = "0x" + nftLog.topics[2]?.slice(26);
    const tokenId = BigInt(nftLog.topics[3] || "0");

    return {
      summary: `${shortenAddress(sender)} transferred NFT #${tokenId} to ${shortenAddress(to)}.`,
      details: [
        `NFT Contract: ${shortenAddress(nftLog.address)}`,
        `Token ID: ${tokenId}`,
        `From: ${shortenAddress(sender)}`,
        `To: ${shortenAddress(to)}`,
      ],
      type: "nft_transfer",
      participants: [
        { address: sender, role: "sender" },
        { address: to, role: "recipient" },
      ],
      actions: [
        {
          type: "nft_transfer",
          from: sender,
          to,
          objectId: String(tokenId),
          objectType: nftLog.address,
        },
      ],
    };
  }

  return explainGeneric(tx, receipt);
}

function explainNftPurchase(tx: Transaction, _receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const to = tx.to?.toLowerCase() || "";
  const marketplace = identifyNftMarketplace(to) || getProtocolName(to);
  const marketplaceInfo = getProtocolInfo(to);

  const price = formatBnbAmount(tx.value);

  return {
    summary: `${shortenAddress(sender)} purchased an NFT for ${price} BNB${marketplace ? ` on ${marketplace}` : ""}.`,
    details: [
      `Buyer: ${shortenAddress(sender)}`,
      `Price: ${price} BNB`,
      ...(marketplace ? [`Marketplace: ${marketplace}`] : []),
    ],
    type: "nft_purchase",
    participants: [{ address: sender, role: "buyer" }],
    actions: [
      {
        type: "nft_purchase",
        buyer: sender,
        seller: "",
        objectId: "",
        objectType: "",
        price: `${price} BNB`,
        marketplace: marketplace || undefined,
        marketplaceLogo: marketplaceInfo?.logo,
      },
    ],
    metadata: {
      marketplaceLogo: marketplaceInfo?.logo,
    },
  };
}

function explainContractDeploy(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const contractAddress = receipt.contractAddress || "Unknown";

  return {
    summary: `${shortenAddress(sender)} deployed a new smart contract.`,
    details: [`Deployer: ${shortenAddress(sender)}`, `Contract: ${contractAddress}`],
    type: "publish",
    participants: [{ address: sender, role: "creator" }],
    actions: [
      {
        type: "publish",
        publisher: sender,
        packageId: contractAddress,
        modules: [],
      },
    ],
  };
}

function explainBorrow(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const to = tx.to?.toLowerCase() || "";
  const protocol = identifyLendingProtocol(to) || getProtocolName(to);
  const protocolInfo = getProtocolInfo(to);

  const transferLogs = receipt.logs.filter((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);
  const received = transferLogs.find((log) => {
    const logTo = "0x" + log.topics[2]?.slice(26);
    return logTo.toLowerCase() === sender.toLowerCase();
  });

  let amount = "?";
  let tokenName = "tokens";

  if (received) {
    const tokenInfo = getTokenInfo(received.address);
    const decimals = tokenInfo?.decimals || 18;
    tokenName = tokenInfo?.symbol || shortenAddress(received.address);
    amount = formatTokenAmount(BigInt(received.data || "0"), decimals);
  }

  return {
    summary: `${shortenAddress(sender)} borrowed ${amount} ${tokenName}${protocol ? ` from ${protocol}` : ""}.`,
    details: [
      `Borrower: ${shortenAddress(sender)}`,
      `Amount: ${amount} ${tokenName}`,
      ...(protocol ? [`Protocol: ${protocol}`] : []),
    ],
    type: "borrow",
    participants: [{ address: sender, role: "borrower" }],
    actions: [
      {
        type: "borrow",
        borrower: sender,
        token: tokenName,
        amount,
        protocol: protocol || undefined,
        protocolLogo: protocolInfo?.logo,
      },
    ],
    metadata: {
      protocolLogo: protocolInfo?.logo,
    },
  };
}

function explainRepay(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const to = tx.to?.toLowerCase() || "";
  const protocol = identifyLendingProtocol(to) || getProtocolName(to);
  const protocolInfo = getProtocolInfo(to);

  const transferLogs = receipt.logs.filter((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);
  const sent = transferLogs.find((log) => {
    const from = "0x" + log.topics[1]?.slice(26);
    return from.toLowerCase() === sender.toLowerCase();
  });

  let amount = "?";
  let tokenName = "tokens";

  if (sent) {
    const tokenInfo = getTokenInfo(sent.address);
    const decimals = tokenInfo?.decimals || 18;
    tokenName = tokenInfo?.symbol || shortenAddress(sent.address);
    amount = formatTokenAmount(BigInt(sent.data || "0"), decimals);
  }

  return {
    summary: `${shortenAddress(sender)} repaid ${amount} ${tokenName}${protocol ? ` on ${protocol}` : ""}.`,
    details: [
      `Borrower: ${shortenAddress(sender)}`,
      `Amount: ${amount} ${tokenName}`,
      ...(protocol ? [`Protocol: ${protocol}`] : []),
    ],
    type: "repay",
    participants: [{ address: sender, role: "borrower" }],
    actions: [
      {
        type: "repay",
        borrower: sender,
        token: tokenName,
        amount,
        protocol: protocol || undefined,
        protocolLogo: protocolInfo?.logo,
      },
    ],
    metadata: {
      protocolLogo: protocolInfo?.logo,
    },
  };
}

function explainSupply(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const to = tx.to?.toLowerCase() || "";
  const protocol = identifyLendingProtocol(to) || getProtocolName(to);
  const protocolInfo = getProtocolInfo(to);

  const transferLogs = receipt.logs.filter((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);
  const sent = transferLogs.find((log) => {
    const from = "0x" + log.topics[1]?.slice(26);
    return from.toLowerCase() === sender.toLowerCase();
  });

  let amount = "?";
  let tokenName = "tokens";

  if (sent) {
    const tokenInfo = getTokenInfo(sent.address);
    const decimals = tokenInfo?.decimals || 18;
    tokenName = tokenInfo?.symbol || shortenAddress(sent.address);
    amount = formatTokenAmount(BigInt(sent.data || "0"), decimals);
  }

  return {
    summary: `${shortenAddress(sender)} supplied ${amount} ${tokenName}${protocol ? ` to ${protocol}` : ""}.`,
    details: [
      `Supplier: ${shortenAddress(sender)}`,
      `Amount: ${amount} ${tokenName}`,
      ...(protocol ? [`Protocol: ${protocol}`] : []),
    ],
    type: "supply",
    participants: [{ address: sender, role: "lender" }],
    actions: [
      {
        type: "supply",
        supplier: sender,
        token: tokenName,
        amount,
        protocol: protocol || undefined,
        protocolLogo: protocolInfo?.logo,
      },
    ],
    metadata: {
      protocolLogo: protocolInfo?.logo,
    },
  };
}

function explainWithdraw(tx: Transaction, receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const to = tx.to?.toLowerCase() || "";
  const protocol = identifyLendingProtocol(to) || getProtocolName(to);
  const protocolInfo = getProtocolInfo(to);

  const transferLogs = receipt.logs.filter((log) => log.topics[0] === EVENT_SIGNATURES.TRANSFER);
  const received = transferLogs.find((log) => {
    const logTo = "0x" + log.topics[2]?.slice(26);
    return logTo.toLowerCase() === sender.toLowerCase();
  });

  let amount = "?";
  let tokenName = "tokens";

  if (received) {
    const tokenInfo = getTokenInfo(received.address);
    const decimals = tokenInfo?.decimals || 18;
    tokenName = tokenInfo?.symbol || shortenAddress(received.address);
    amount = formatTokenAmount(BigInt(received.data || "0"), decimals);
  }

  return {
    summary: `${shortenAddress(sender)} withdrew ${amount} ${tokenName}${protocol ? ` from ${protocol}` : ""}.`,
    details: [
      `Withdrawer: ${shortenAddress(sender)}`,
      `Amount: ${amount} ${tokenName}`,
      ...(protocol ? [`Protocol: ${protocol}`] : []),
    ],
    type: "withdraw",
    participants: [{ address: sender, role: "lender" }],
    actions: [
      {
        type: "withdraw",
        withdrawer: sender,
        token: tokenName,
        amount,
        protocol: protocol || undefined,
        protocolLogo: protocolInfo?.logo,
      },
    ],
    metadata: {
      protocolLogo: protocolInfo?.logo,
    },
  };
}

function explainGeneric(tx: Transaction, _receipt: TransactionReceipt): ExplanationResult {
  const sender = tx.from;
  const to = tx.to || "Contract Creation";
  const input = tx.input || "0x";
  const selector = input.slice(0, 10);

  const protocolName = getProtocolName(to.toLowerCase());
  const protocolInfo = getProtocolInfo(to.toLowerCase());
  const details: string[] = [];

  if (tx.value > BigInt(0)) {
    details.push(`Value: ${formatBnbAmount(tx.value)} BNB`);
  }

  details.push(`Sender: ${shortenAddress(sender)}`);
  details.push(`To: ${shortenAddress(to)}`);

  if (selector.length === 10) {
    details.push(`Method: ${selector}`);
  }

  if (protocolName) {
    details.push(`Protocol: ${protocolName}`);
  }

  const summary = protocolName
    ? `${shortenAddress(sender)} interacted with ${protocolName}.`
    : `${shortenAddress(sender)} called ${shortenAddress(to)}.`;

  return {
    summary,
    details,
    type: "generic",
    participants: [{ address: sender, role: "sender" }],
    actions: [
      {
        type: "contract_call",
        caller: sender,
        contract: to,
        method: selector,
        protocol: protocolName || undefined,
        protocolLogo: protocolInfo?.logo,
      },
    ],
    metadata: {
      protocolLogo: protocolInfo?.logo,
    },
  };
}

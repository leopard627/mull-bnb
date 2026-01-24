export type Network = "mainnet" | "testnet";

export type TransactionType =
  | "transfer"
  | "approval"
  | "nft_transfer"
  | "nft_mint"
  | "nft_burn"
  | "nft_list"
  | "nft_purchase"
  | "nft_cancel_listing"
  | "nft_make_offer"
  | "nft_accept_offer"
  | "swap"
  | "liquidity_add"
  | "liquidity_remove"
  | "mint"
  | "burn"
  | "merge_coins"
  | "split_coins"
  | "stake"
  | "unstake"
  | "claim_rewards"
  | "borrow"
  | "repay"
  | "supply"
  | "withdraw"
  | "liquidate"
  | "open_position"
  | "close_position"
  | "perp_trade"
  | "flash_loan_arbitrage"
  | "bridge"
  | "bridge_in"
  | "bridge_out"
  | "register_name"
  | "renew_name"
  | "vote"
  | "propose"
  | "publish"
  | "upgrade"
  | "airdrop_claim"
  | "multisig"
  | "sponsored"
  // System transactions
  | "system_consensus"
  | "system_epoch_change"
  | "system_genesis"
  | "system_checkpoint"
  | "system_authenticator"
  | "system_randomness"
  | "generic";

export interface Participant {
  address: string;
  role:
    | "sender"
    | "recipient"
    | "trader"
    | "creator"
    | "validator"
    | "sponsor"
    | "buyer"
    | "seller"
    | "borrower"
    | "lender"
    | "liquidator"
    | "voter"
    | "proposer"
    | "signer"
    | "arbitrageur"
    | "owner"
    | "spender"
    | "staker"
    | "claimer"
    | "provider";
}

export interface TransferAction {
  type: "transfer";
  from: string;
  to: string;
  amount: string;
  token: string;
  coinType: string;
  tokenLogo?: string;
}

export interface ApprovalAction {
  type: "approval";
  owner: string;
  spender: string;
  token: string;
  tokenAddress: string;
  amount: string;
  isUnlimited: boolean;
  spenderProtocol?: string;
  spenderLogo?: string;
}

export interface NftTransferAction {
  type: "nft_transfer";
  from: string;
  to: string;
  objectId: string;
  objectType: string;
}

export interface NftMintAction {
  type: "nft_mint";
  creator: string;
  objectId: string;
  objectType: string;
  collection?: string;
}

export interface NftBurnAction {
  type: "nft_burn";
  owner: string;
  objectId: string;
  objectType: string;
}

export interface NftListAction {
  type: "nft_list";
  seller: string;
  objectId: string;
  objectType: string;
  price?: string;
  marketplace?: string;
}

export interface NftPurchaseAction {
  type: "nft_purchase";
  buyer: string;
  seller: string;
  objectId: string;
  objectType: string;
  price: string;
  marketplace?: string;
  marketplaceLogo?: string;
}

export interface SwapAction {
  type: "swap";
  trader: string;
  fromToken: string;
  fromAmount: string;
  fromLogo?: string;
  toToken: string;
  toAmount: string;
  toLogo?: string;
  dex: string | null;
  dexLogo?: string;
  isMultiHop?: boolean;
  hops?: number;
}

export interface LiquidityAction {
  type: "liquidity_add" | "liquidity_remove";
  provider: string;
  tokenA: string;
  amountA: string;
  tokenALogo?: string;
  tokenB: string;
  amountB: string;
  tokenBLogo?: string;
  pool?: string;
  dex?: string;
  dexLogo?: string;
}

export interface MintAction {
  type: "mint";
  creator: string;
  objectId: string;
  objectType: string;
}

export interface BurnAction {
  type: "burn";
  owner: string;
  objectId: string;
  objectType: string;
  amount?: string;
}

export interface MergeCoinsAction {
  type: "merge_coins";
  owner: string;
  coinType: string;
  coinName: string;
  sourceCount: number;
  resultAmount?: string;
}

export interface SplitCoinsAction {
  type: "split_coins";
  owner: string;
  coinType: string;
  coinName: string;
  originalAmount?: string;
  amounts: string[];
}

export interface StakeAction {
  type: "stake" | "unstake";
  staker: string;
  amount: string;
  token?: string;
  protocol?: string;
  protocolLogo?: string;
  validatorAddress?: string;
  validatorName?: string;
}

export interface ClaimRewardsAction {
  type: "claim_rewards";
  claimer: string;
  token?: string;
  amount?: string;
  rewards?: Array<{ token: string; amount: string }>;
  protocol?: string;
  protocolLogo?: string;
}

export interface MoveCallAction {
  type: "move_call";
  caller: string;
  package: string;
  module: string;
  function: string;
}

export interface ContractCallAction {
  type: "contract_call";
  caller: string;
  contract: string;
  method: string;
  protocol?: string;
  protocolLogo?: string;
}

export interface PublishAction {
  type: "publish";
  publisher: string;
  packageId: string;
  modules: string[];
}

export interface UpgradeAction {
  type: "upgrade";
  publisher: string;
  packageId: string;
  previousVersion?: string;
}

export interface AirdropClaimAction {
  type: "airdrop_claim";
  claimer: string;
  token: string;
  amount: string;
  campaign?: string;
}

// DeFi Lending Actions
export interface BorrowAction {
  type: "borrow";
  borrower: string;
  token: string;
  amount: string;
  protocol?: string;
  protocolLogo?: string;
}

export interface RepayAction {
  type: "repay";
  borrower: string;
  token: string;
  amount: string;
  protocol?: string;
  protocolLogo?: string;
}

export interface SupplyAction {
  type: "supply";
  supplier: string;
  token: string;
  amount: string;
  protocol?: string;
  protocolLogo?: string;
}

export interface WithdrawAction {
  type: "withdraw";
  withdrawer: string;
  token: string;
  amount: string;
  protocol?: string;
  protocolLogo?: string;
}

export interface LiquidateAction {
  type: "liquidate";
  liquidator: string;
  borrower: string;
  collateralToken: string;
  debtToken: string;
  amount: string;
  protocol?: string;
}

// Perpetuals Actions
export interface OpenPositionAction {
  type: "open_position";
  trader: string;
  market: string;
  side: "long" | "short";
  size: string;
  leverage?: string;
  protocol?: string;
}

export interface ClosePositionAction {
  type: "close_position";
  trader: string;
  market: string;
  size: string;
  pnl?: string;
  protocol?: string;
}

export interface PerpTradeAction {
  type: "perp_trade";
  trader: string;
  market: string;
  side: "long" | "short" | "unknown";
  size?: string;
  price?: string;
  protocol?: string;
}

// Flash Loan Arbitrage Action
export interface FlashLoanArbitrageAction {
  type: "flash_loan_arbitrage";
  arbitrageur: string;
  flashLoanProtocol?: string;
  borrowedToken?: string;
  borrowedAmount?: string;
  dexes: string[];
  swapCount: number;
  profit?: string;
  profitToken?: string;
}

// Bridge Actions
export interface BridgeAction {
  type: "bridge" | "bridge_in" | "bridge_out";
  user?: string;
  sender?: string;
  token: string;
  amount: string;
  sourceChain?: string;
  destinationChain?: string;
  bridge?: string;
  bridgeLogo?: string;
}

// Name Service Actions (BNS/SpaceID)
export interface RegisterNameAction {
  type: "register_name";
  registrant: string;
  name: string;
  duration?: string;
}

export interface RenewNameAction {
  type: "renew_name";
  owner: string;
  name: string;
  duration?: string;
}

// NFT Marketplace Additional Actions
export interface NftCancelListingAction {
  type: "nft_cancel_listing";
  seller: string;
  objectId: string;
  objectType: string;
  marketplace?: string;
}

export interface NftMakeOfferAction {
  type: "nft_make_offer";
  buyer: string;
  objectId: string;
  objectType: string;
  offerAmount: string;
  marketplace?: string;
}

export interface NftAcceptOfferAction {
  type: "nft_accept_offer";
  seller: string;
  buyer: string;
  objectId: string;
  objectType: string;
  price: string;
  marketplace?: string;
}

// Governance Actions
export interface VoteAction {
  type: "vote";
  voter: string;
  proposalId: string;
  choice: string;
  protocol?: string;
}

export interface ProposeAction {
  type: "propose";
  proposer: string;
  proposalId: string;
  title?: string;
  protocol?: string;
}

// Multisig Action
export interface MultisigAction {
  type: "multisig";
  signer: string;
  action: string;
  multisigAddress?: string;
}

export type Action =
  | TransferAction
  | ApprovalAction
  | NftTransferAction
  | NftMintAction
  | NftBurnAction
  | NftListAction
  | NftPurchaseAction
  | NftCancelListingAction
  | NftMakeOfferAction
  | NftAcceptOfferAction
  | SwapAction
  | LiquidityAction
  | MintAction
  | BurnAction
  | MergeCoinsAction
  | SplitCoinsAction
  | StakeAction
  | ClaimRewardsAction
  | BorrowAction
  | RepayAction
  | SupplyAction
  | WithdrawAction
  | LiquidateAction
  | OpenPositionAction
  | ClosePositionAction
  | PerpTradeAction
  | FlashLoanArbitrageAction
  | BridgeAction
  | RegisterNameAction
  | RenewNameAction
  | VoteAction
  | ProposeAction
  | MoveCallAction
  | ContractCallAction
  | PublishAction
  | UpgradeAction
  | AirdropClaimAction
  | MultisigAction;

export interface ExplanationResult {
  summary: string;
  details: string[];
  type: TransactionType;
  participants: Participant[];
  actions: Action[];
  isSponsored?: boolean;
  sponsor?: string;
  metadata?: Record<string, unknown>;
}

export interface GasInfo {
  totalGas: string;
  computationCost: string;
  storageCost: string;
  storageRebate: string;
  gasPayer: string;
  gasPrice: string;
  isSponsored: boolean;
}

export interface ObjectChangeInfo {
  type: "created" | "mutated" | "deleted" | "transferred" | "published" | "wrapped";
  objectId: string;
  objectType: string;
  owner?: string;
}

export interface BalanceChangeInfo {
  owner: string;
  coinType: string;
  amount: string;
  coinName: string;
  isPositive: boolean;
}

export interface ParsedTransaction {
  digest: string;
  timestamp: string | null;
  sender: string;
  status: "success" | "failure";
  error?: string;
  explanation: ExplanationResult;
  gasInfo: GasInfo;
  objectChanges: ObjectChangeInfo[];
  balanceChanges: BalanceChangeInfo[];
  moveCalls: MoveCallInfo[];
  rawTransaction: unknown;
  checkpoint?: string;
}

export interface MoveCallInfo {
  package: string;
  packageName: string | null;
  module: string;
  function: string;
  typeArguments: string[];
}

export interface TransactionError {
  type: "INVALID_DIGEST" | "NOT_FOUND" | "NETWORK_ERROR" | "RATE_LIMITED" | "PARSE_ERROR";
  message: string;
}

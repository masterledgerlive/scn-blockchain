import {
  bigint,
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  address: varchar("address", { length: 64 }).notNull().unique(),
  publicKey: text("publicKey").notNull(),
  sbtTokenId: varchar("sbtTokenId", { length: 64 }).unique(),
  trustScore: int("trustScore").default(0).notNull(),
  trustTier: mysqlEnum("trustTier", ["newcomer", "verified", "certified_shop", "master_trader", "verified_player"]).default("newcomer").notNull(),
  stainCount: int("stainCount").default(0).notNull(),
  web2Links: json("web2Links").$type<{ google?: string; twitter?: string; tiktok?: string }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;

export const cards = mysqlTable("cards", {
  id: int("id").autoincrement().primaryKey(),
  tokenId: varchar("tokenId", { length: 64 }).notNull().unique(),
  mintedBy: int("mintedBy").notNull(),
  ownerWalletId: int("ownerWalletId").notNull(),
  athleteName: varchar("athleteName", { length: 128 }).notNull(),
  sport: varchar("sport", { length: 64 }).notNull(),
  cardYear: int("cardYear").notNull(),
  series: varchar("series", { length: 128 }),
  cardNumber: varchar("cardNumber", { length: 32 }),
  edition: mysqlEnum("edition", ["base", "rare", "ultra_rare", "legendary", "1_of_1"]).default("base").notNull(),
  imageUrl: text("imageUrl"),
  aiScrubbed: boolean("aiScrubbed").default(false).notNull(),
  nilOnly: boolean("nilOnly").default(true).notNull(),
  pufHash: varchar("pufHash", { length: 128 }).unique(),
  pufFiberPattern: text("pufFiberPattern"),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "pending", "verified", "disputed"]).default("unverified").notNull(),
  gradeScore: decimal("gradeScore", { precision: 4, scale: 1 }),
  marketValue: decimal("marketValue", { precision: 12, scale: 2 }).default("0.00"),
  isInSlab: boolean("isInSlab").default(false).notNull(),
  isListed: boolean("isListed").default(false).notNull(),
  isBurned: boolean("isBurned").default(false).notNull(),
  burnedAt: timestamp("burnedAt"),
  tearCode: varchar("tearCode", { length: 32 }).unique(),
  tearCodeRevealed: boolean("tearCodeRevealed").default(false).notNull(),
  seriesTotal: int("seriesTotal"),
  seriesRemaining: int("seriesRemaining"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  mintedAt: timestamp("mintedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Card = typeof cards.$inferSelect;

export const slabs = mysqlTable("slabs", {
  id: int("id").autoincrement().primaryKey(),
  slabId: varchar("slabId", { length: 64 }).notNull().unique(),
  creatorWalletId: int("creatorWalletId").notNull(),
  ownerWalletId: int("ownerWalletId").notNull(),
  slabType: mysqlEnum("slabType", ["single", "mystery_pack", "set"]).default("single").notNull(),
  status: mysqlEnum("status", ["sealed", "opened", "listed", "sold"]).default("sealed").notNull(),
  totalCards: int("totalCards").default(0).notNull(),
  isMysterySlab: boolean("isMysterySlab").default(false).notNull(),
  onChainOdds: json("onChainOdds").$type<{ base: number; rare: number; ultra_rare: number; legendary: number; one_of_one: number }>(),
  remainingInventory: json("remainingInventory").$type<Record<string, number>>(),
  faradayShielded: boolean("faradayShielded").default(false).notNull(),
  posaActivated: boolean("posaActivated").default(false).notNull(),
  posaCode: varchar("posaCode", { length: 64 }).unique(),
  cryptoLiquidity: decimal("cryptoLiquidity", { precision: 12, scale: 2 }).default("0.00"),
  marketValue: decimal("marketValue", { precision: 12, scale: 2 }).default("0.00"),
  isListed: boolean("isListed").default(false).notNull(),
  breadcrumbHash: varchar("breadcrumbHash", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Slab = typeof slabs.$inferSelect;

export const slabCards = mysqlTable("slab_cards", {
  id: int("id").autoincrement().primaryKey(),
  slabId: int("slabId").notNull(),
  cardId: int("cardId").notNull(),
  position: int("position").default(0),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export const custodyRecords = mysqlTable("custody_records", {
  id: int("id").autoincrement().primaryKey(),
  txHash: varchar("txHash", { length: 128 }).notNull().unique(),
  assetType: mysqlEnum("assetType", ["card", "slab"]).notNull(),
  assetId: int("assetId").notNull(),
  fromWalletId: int("fromWalletId"),
  toWalletId: int("toWalletId").notNull(),
  transferType: mysqlEnum("transferType", ["mint", "sale", "transfer", "slab_seal", "slab_open", "verification"]).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }),
  blockNumber: bigint("blockNumber", { mode: "number" }).notNull(),
  gasUsed: decimal("gasUsed", { precision: 12, scale: 6 }).default("0.000021"),
  daoFee: decimal("daoFee", { precision: 12, scale: 6 }).default("0.000001"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustodyRecord = typeof custodyRecords.$inferSelect;

export const marketplaceListings = mysqlTable("marketplace_listings", {
  id: int("id").autoincrement().primaryKey(),
  listingId: varchar("listingId", { length: 64 }).notNull().unique(),
  sellerWalletId: int("sellerWalletId").notNull(),
  buyerWalletId: int("buyerWalletId"),
  assetType: mysqlEnum("assetType", ["card", "slab"]).notNull(),
  assetId: int("assetId").notNull(),
  askPrice: decimal("askPrice", { precision: 12, scale: 2 }).notNull(),
  finalPrice: decimal("finalPrice", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 16 }).default("SCN").notNull(),
  status: mysqlEnum("status", ["active", "sold", "cancelled", "expired"]).default("active").notNull(),
  description: text("description"),
  expiresAt: timestamp("expiresAt"),
  soldAt: timestamp("soldAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;

export const daoTreasury = mysqlTable("dao_treasury", {
  id: int("id").autoincrement().primaryKey(),
  totalAccumulated: decimal("totalAccumulated", { precision: 18, scale: 6 }).default("0.000000").notNull(),
  totalDeployed: decimal("totalDeployed", { precision: 18, scale: 6 }).default("0.000000").notNull(),
  currentBalance: decimal("currentBalance", { precision: 18, scale: 6 }).default("0.000000").notNull(),
  totalTransactions: bigint("totalTransactions", { mode: "number" }).default(0).notNull(),
  targetMilestone: decimal("targetMilestone", { precision: 18, scale: 2 }).default("1000000000.00"),
  milestoneLabel: varchar("milestoneLabel", { length: 256 }).default("MLB Licensing Rights Acquisition"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const governanceProposals = mysqlTable("governance_proposals", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: varchar("proposalId", { length: 64 }).notNull().unique(),
  proposerWalletId: int("proposerWalletId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["treasury_deployment", "protocol_upgrade", "licensing_bid", "community_fund", "rule_change"]).notNull(),
  requestedAmount: decimal("requestedAmount", { precision: 18, scale: 2 }),
  status: mysqlEnum("status", ["active", "passed", "rejected", "executed", "cancelled"]).default("active").notNull(),
  votesFor: int("votesFor").default(0).notNull(),
  votesAgainst: int("votesAgainst").default(0).notNull(),
  quorumRequired: int("quorumRequired").default(100).notNull(),
  votingEndsAt: timestamp("votingEndsAt").notNull(),
  executedAt: timestamp("executedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GovernanceProposal = typeof governanceProposals.$inferSelect;

export const proposalVotes = mysqlTable("proposal_votes", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull(),
  voterWalletId: int("voterWalletId").notNull(),
  vote: mysqlEnum("vote", ["for", "against", "abstain"]).notNull(),
  votingPower: int("votingPower").default(1).notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const scnTransactions = mysqlTable("scn_transactions", {
  id: int("id").autoincrement().primaryKey(),
  txHash: varchar("txHash", { length: 128 }).notNull().unique(),
  blockNumber: bigint("blockNumber", { mode: "number" }).notNull(),
  txType: mysqlEnum("txType", ["mint", "transfer", "sale", "slab_create", "slab_open", "verify", "dao_deposit", "dao_vote", "governance", "burn", "burn_pool_contribute", "burn_pool_claim"]).notNull(),
  fromAddress: varchar("fromAddress", { length: 64 }),
  toAddress: varchar("toAddress", { length: 64 }),
  value: decimal("value", { precision: 12, scale: 6 }).default("0.000000"),
  gasUsed: decimal("gasUsed", { precision: 12, scale: 6 }).default("0.000021"),
  status: mysqlEnum("status", ["confirmed", "pending", "failed"]).default("confirmed").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScnTransaction = typeof scnTransactions.$inferSelect;

// ─── Burn Mechanism Tables ────────────────────────────────────────────────────

export const burnPools = mysqlTable("burn_pools", {
  id: int("id").autoincrement().primaryKey(),
  poolId: varchar("poolId", { length: 64 }).notNull().unique(),
  cardId: int("cardId").notNull(),
  cardTokenId: varchar("cardTokenId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["open", "threshold_met", "claimed", "expired", "cancelled"]).default("open").notNull(),
  totalContributed: decimal("totalContributed", { precision: 18, scale: 6 }).default("0.000000").notNull(),
  thresholdAmount: decimal("thresholdAmount", { precision: 18, scale: 6 }).notNull(),
  cardMarketValue: decimal("cardMarketValue", { precision: 12, scale: 2 }).default("0.00"),
  contributorCount: int("contributorCount").default(0).notNull(),
  burnTxHash: varchar("burnTxHash", { length: 128 }),
  claimedAt: timestamp("claimedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BurnPool = typeof burnPools.$inferSelect;

export const burnPoolContributions = mysqlTable("burn_pool_contributions", {
  id: int("id").autoincrement().primaryKey(),
  poolId: int("poolId").notNull(),
  contributorWalletId: int("contributorWalletId").notNull(),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  txHash: varchar("txHash", { length: 128 }).notNull().unique(),
  refunded: boolean("refunded").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BurnPoolContribution = typeof burnPoolContributions.$inferSelect;

export const burnEvents = mysqlTable("burn_events", {
  id: int("id").autoincrement().primaryKey(),
  burnId: varchar("burnId", { length: 64 }).notNull().unique(),
  cardId: int("cardId").notNull(),
  cardTokenId: varchar("cardTokenId", { length: 64 }).notNull(),
  burnerWalletId: int("burnerWalletId").notNull(),
  tearCodeSubmitted: varchar("tearCodeSubmitted", { length: 32 }).notNull(),
  txHash: varchar("txHash", { length: 128 }).notNull().unique(),
  blockNumber: bigint("blockNumber", { mode: "number" }).notNull(),
  poolId: int("poolId"),
  poolAmountClaimed: decimal("poolAmountClaimed", { precision: 18, scale: 6 }).default("0.000000"),
  scarcityDividendPerCard: decimal("scarcityDividendPerCard", { precision: 18, scale: 6 }).default("0.000000"),
  seriesBeforeBurn: int("seriesBeforeBurn"),
  seriesAfterBurn: int("seriesAfterBurn"),
  burnedAt: timestamp("burnedAt").defaultNow().notNull(),
});

export type BurnEvent = typeof burnEvents.$inferSelect;

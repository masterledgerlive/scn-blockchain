import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Card,
  CustodyRecord,
  GovernanceProposal,
  InsertUser,
  MarketplaceListing,
  Slab,
  User,
  Wallet,
  cards,
  custodyRecords,
  daoTreasury,
  governanceProposals,
  marketplaceListings,
  proposalVotes,
  scnTransactions,
  slabCards,
  slabs,
  users,
  wallets,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Wallets ──────────────────────────────────────────────────────────────────

export async function getWalletByUserId(userId: number): Promise<Wallet | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return result[0];
}

export async function getWalletByAddress(address: string): Promise<Wallet | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(wallets).where(eq(wallets.address, address)).limit(1);
  return result[0];
}

export async function createWallet(data: {
  userId: number;
  address: string;
  publicKey: string;
  sbtTokenId: string;
}): Promise<Wallet> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(wallets).values({ ...data, trustScore: 10, trustTier: "newcomer" });
  const result = await db.select().from(wallets).where(eq(wallets.address, data.address)).limit(1);
  return result[0]!;
}

export async function updateWalletTrust(walletId: number, trustScore: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  let tier: Wallet["trustTier"] = "newcomer";
  if (trustScore >= 500) tier = "verified_player";
  else if (trustScore >= 200) tier = "master_trader";
  else if (trustScore >= 100) tier = "certified_shop";
  else if (trustScore >= 30) tier = "verified";
  await db.update(wallets).set({ trustScore, trustTier: tier }).where(eq(wallets.id, walletId));
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export async function mintCard(data: {
  tokenId: string;
  mintedBy: number;
  ownerWalletId: number;
  athleteName: string;
  sport: string;
  cardYear: number;
  series?: string;
  cardNumber?: string;
  edition: Card["edition"];
  imageUrl?: string;
  aiScrubbed: boolean;
  pufHash?: string;
  pufFiberPattern?: string;
}): Promise<Card> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(cards).values({ ...data, nilOnly: true, verificationStatus: "unverified" });
  const result = await db.select().from(cards).where(eq(cards.tokenId, data.tokenId)).limit(1);
  return result[0]!;
}

export async function getCardsByWallet(walletId: number): Promise<Card[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cards).where(eq(cards.ownerWalletId, walletId)).orderBy(desc(cards.mintedAt));
}

export async function getCardById(id: number): Promise<Card | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
  return result[0];
}

export async function getCardByTokenId(tokenId: string): Promise<Card | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cards).where(eq(cards.tokenId, tokenId)).limit(1);
  return result[0];
}

export async function verifyCard(cardId: number, gradeScore: number, pufHash: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(cards).set({ verificationStatus: "verified", gradeScore: String(gradeScore), pufHash }).where(eq(cards.id, cardId));
}

export async function getAllCards(limit = 50): Promise<Card[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cards).orderBy(desc(cards.mintedAt)).limit(limit);
}

// ─── Slabs ────────────────────────────────────────────────────────────────────

export async function createSlab(data: {
  slabId: string;
  creatorWalletId: number;
  ownerWalletId: number;
  slabType: Slab["slabType"];
  isMysterySlab: boolean;
  onChainOdds?: Slab["onChainOdds"];
  faradayShielded: boolean;
  posaCode: string;
  breadcrumbHash: string;
}): Promise<Slab> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(slabs).values({ ...data, posaActivated: true, status: "sealed" });
  const result = await db.select().from(slabs).where(eq(slabs.slabId, data.slabId)).limit(1);
  return result[0]!;
}

export async function getSlabsByWallet(walletId: number): Promise<Slab[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(slabs).where(eq(slabs.ownerWalletId, walletId)).orderBy(desc(slabs.createdAt));
}

export async function getSlabById(id: number): Promise<Slab | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(slabs).where(eq(slabs.id, id)).limit(1);
  return result[0];
}

export async function addCardToSlab(slabId: number, cardId: number, position: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(slabCards).values({ slabId, cardId, position });
  await db.update(slabs).set({ totalCards: sql`totalCards + 1` }).where(eq(slabs.id, slabId));
  await db.update(cards).set({ isInSlab: true }).where(eq(cards.id, cardId));
}

export async function getSlabCards(slabId: number): Promise<Card[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(slabCards).where(eq(slabCards.slabId, slabId));
  if (!rows.length) return [];
  const cardIds = rows.map((r) => r.cardId);
  const result: Card[] = [];
  for (const cid of cardIds) {
    const c = await getCardById(cid);
    if (c) result.push(c);
  }
  return result;
}

// ─── Custody Records ──────────────────────────────────────────────────────────

export async function recordCustody(data: {
  txHash: string;
  assetType: "card" | "slab";
  assetId: number;
  fromWalletId?: number;
  toWalletId: number;
  transferType: CustodyRecord["transferType"];
  price?: string;
  blockNumber: number;
  notes?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(custodyRecords).values({ ...data, gasUsed: "0.000021", daoFee: "0.000001" });
}

export async function getCustodyHistory(assetType: "card" | "slab", assetId: number): Promise<CustodyRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(custodyRecords)
    .where(and(eq(custodyRecords.assetType, assetType), eq(custodyRecords.assetId, assetId)))
    .orderBy(desc(custodyRecords.createdAt));
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

export async function createListing(data: {
  listingId: string;
  sellerWalletId: number;
  assetType: "card" | "slab";
  assetId: number;
  askPrice: string;
  description?: string;
}): Promise<MarketplaceListing> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(marketplaceListings).values({ ...data, status: "active", currency: "SCN", expiresAt });
  if (data.assetType === "card") {
    await db.update(cards).set({ isListed: true }).where(eq(cards.id, data.assetId));
  } else {
    await db.update(slabs).set({ isListed: true, status: "listed" }).where(eq(slabs.id, data.assetId));
  }
  const result = await db.select().from(marketplaceListings).where(eq(marketplaceListings.listingId, data.listingId)).limit(1);
  return result[0]!;
}

export async function getActiveListings(): Promise<MarketplaceListing[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketplaceListings).where(eq(marketplaceListings.status, "active")).orderBy(desc(marketplaceListings.createdAt)).limit(100);
}

export async function buyListing(listingId: string, buyerWalletId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const listing = await db.select().from(marketplaceListings).where(eq(marketplaceListings.listingId, listingId)).limit(1);
  if (!listing[0] || listing[0].status !== "active") throw new Error("Listing not available");
  const l = listing[0];
  await db.update(marketplaceListings).set({ status: "sold", buyerWalletId, finalPrice: l.askPrice, soldAt: new Date() }).where(eq(marketplaceListings.listingId, listingId));
  if (l.assetType === "card") {
    await db.update(cards).set({ ownerWalletId: buyerWalletId, isListed: false }).where(eq(cards.id, l.assetId));
  } else {
    await db.update(slabs).set({ ownerWalletId: buyerWalletId, isListed: false, status: "sealed" }).where(eq(slabs.id, l.assetId));
  }
  // Update DAO treasury
  const fee = parseFloat(l.askPrice) * 0.001;
  await db.update(daoTreasury).set({
    totalAccumulated: sql`totalAccumulated + ${fee}`,
    currentBalance: sql`currentBalance + ${fee}`,
    totalTransactions: sql`totalTransactions + 1`,
  }).where(eq(daoTreasury.id, 1));
}

export async function cancelListing(listingId: string, walletId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const listing = await db.select().from(marketplaceListings).where(eq(marketplaceListings.listingId, listingId)).limit(1);
  if (!listing[0] || listing[0].sellerWalletId !== walletId) throw new Error("Not authorized");
  const l = listing[0];
  await db.update(marketplaceListings).set({ status: "cancelled" }).where(eq(marketplaceListings.listingId, listingId));
  if (l.assetType === "card") {
    await db.update(cards).set({ isListed: false }).where(eq(cards.id, l.assetId));
  } else {
    await db.update(slabs).set({ isListed: false, status: "sealed" }).where(eq(slabs.id, l.assetId));
  }
}

// ─── DAO Treasury ─────────────────────────────────────────────────────────────

export async function getTreasury() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(daoTreasury).limit(1);
  return result[0] ?? null;
}

// ─── Governance ───────────────────────────────────────────────────────────────

export async function createProposal(data: {
  proposalId: string;
  proposerWalletId: number;
  title: string;
  description: string;
  category: GovernanceProposal["category"];
  requestedAmount?: string;
  votingEndsAt: Date;
}): Promise<GovernanceProposal> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(governanceProposals).values({ ...data, status: "active", quorumRequired: 10 });
  const result = await db.select().from(governanceProposals).where(eq(governanceProposals.proposalId, data.proposalId)).limit(1);
  return result[0]!;
}

export async function getProposals(): Promise<GovernanceProposal[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(governanceProposals).orderBy(desc(governanceProposals.createdAt)).limit(50);
}

export async function voteOnProposal(proposalId: number, voterWalletId: number, vote: "for" | "against" | "abstain", reason?: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Check not already voted
  const existing = await db.select().from(proposalVotes).where(and(eq(proposalVotes.proposalId, proposalId), eq(proposalVotes.voterWalletId, voterWalletId))).limit(1);
  if (existing.length > 0) throw new Error("Already voted");
  await db.insert(proposalVotes).values({ proposalId, voterWalletId, vote, votingPower: 1, reason });
  if (vote === "for") {
    await db.update(governanceProposals).set({ votesFor: sql`votesFor + 1` }).where(eq(governanceProposals.id, proposalId));
  } else if (vote === "against") {
    await db.update(governanceProposals).set({ votesAgainst: sql`votesAgainst + 1` }).where(eq(governanceProposals.id, proposalId));
  }
}

export async function getUserVotes(voterWalletId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proposalVotes).where(eq(proposalVotes.voterWalletId, voterWalletId));
}

// ─── Transactions / Explorer ──────────────────────────────────────────────────

export async function recordTransaction(data: {
  txHash: string;
  blockNumber: number;
  txType: "mint" | "transfer" | "sale" | "slab_create" | "slab_open" | "verify" | "dao_deposit" | "dao_vote" | "governance";
  fromAddress?: string;
  toAddress?: string;
  value?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(scnTransactions).values({ ...data, status: "confirmed", gasUsed: "0.000021" });
}

export async function getRecentTransactions(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scnTransactions).orderBy(desc(scnTransactions.createdAt)).limit(limit);
}

export async function getNetworkStats() {
  const db = await getDb();
  if (!db) return { totalCards: 0, totalSlabs: 0, totalTransactions: 0, totalWallets: 0 };
  const [cardCount] = await db.select({ count: sql<number>`count(*)` }).from(cards);
  const [slabCount] = await db.select({ count: sql<number>`count(*)` }).from(slabs);
  const [txCount] = await db.select({ count: sql<number>`count(*)` }).from(scnTransactions);
  const [walletCount] = await db.select({ count: sql<number>`count(*)` }).from(wallets);
  return {
    totalCards: cardCount?.count ?? 0,
    totalSlabs: slabCount?.count ?? 0,
    totalTransactions: txCount?.count ?? 0,
    totalWallets: walletCount?.count ?? 0,
  };
}

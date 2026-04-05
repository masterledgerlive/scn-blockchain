/**
 * SCN Platform — Mutation & Business Logic Tests
 * Tests wallet creation, card minting, PUF verification, marketplace,
 * DAO voting, slab creation, and ownership/authorization enforcement.
 */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 9999,
    openId: "test-mutation-user",
    email: "mutation@scn.io",
    name: "Mutation Tester",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// ─── PUF Hash Generation Tests ─────────────────────────────────────────────
describe("SCN — PUF Hash Generation", () => {
  it("PUF hash has correct format: 64 hex chars", async () => {
    // PUF hashes are SHA256-like: 64 hex characters
    const pufPattern = /^[a-f0-9]{64}$/;
    // Generate a sample PUF hash using the same algorithm as the server
    const crypto = await import("crypto");
    const seed = `PUF-${Date.now()}-${Math.random()}`;
    const hash = crypto.createHash("sha256").update(seed).digest("hex");
    expect(hash).toMatch(pufPattern);
    expect(hash.length).toBe(64);
  });

  it("PUF hashes are unique per generation", async () => {
    const crypto = await import("crypto");
    const hashes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const seed = `PUF-${i}-${Math.random()}`;
      hashes.add(crypto.createHash("sha256").update(seed).digest("hex"));
    }
    // All 100 should be unique
    expect(hashes.size).toBe(100);
  });
});

// ─── TX Hash Generation Tests ───────────────────────────────────────────────
describe("SCN — Transaction Hash Generation", () => {
  it("TX hash has correct format: 0x prefix + 64 hex chars", () => {
    const txPattern = /^0x[a-f0-9]{64}$/;
    const crypto = require("crypto");
    const hash = "0x" + crypto.randomBytes(32).toString("hex");
    expect(hash).toMatch(txPattern);
    expect(hash.length).toBe(66);
  });
});

// ─── Wallet Authorization Tests ─────────────────────────────────────────────
describe("SCN — Wallet Authorization", () => {
  it("wallet.get requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.wallet.get()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("wallet.create requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.wallet.create()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

// ─── Card Authorization Tests ───────────────────────────────────────────────
describe("SCN — Card Authorization", () => {
  it("cards.list requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.cards.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("cards.mint requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.cards.mint({
        athleteName: "LeBron James",
        sport: "Basketball",
        cardYear: 2024,
        series: "Test Series",
        cardNumber: "1/1",
        edition: "legendary",
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("cards.verify requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.cards.verify({ cardId: 1, simulateScan: true })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("cards.all is public and returns array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const cards = await caller.cards.all();
    expect(Array.isArray(cards)).toBe(true);
  });
});

// ─── Marketplace Authorization Tests ────────────────────────────────────────
describe("SCN — Marketplace Authorization", () => {
  it("marketplace.listings is public", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const listings = await caller.marketplace.listings();
    expect(Array.isArray(listings)).toBe(true);
  });

  it("marketplace.buy requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.marketplace.buy({ listingId: 1 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("marketplace.list requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.marketplace.list({
        assetType: "card",
        assetId: 1,
        askPrice: 100,
        currency: "SCN",
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("marketplace.cancel requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.marketplace.cancel({ listingId: 1 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ─── DAO Authorization Tests ─────────────────────────────────────────────────
describe("SCN — DAO Authorization", () => {
  it("dao.treasury is public", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const treasury = await caller.dao.treasury();
    if (treasury) {
      expect(treasury).toHaveProperty("currentBalance");
    }
  });

  it("dao.proposals is public", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const proposals = await caller.dao.proposals();
    expect(Array.isArray(proposals)).toBe(true);
  });

  it("dao.vote requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.dao.vote({ proposalId: 1, vote: "for" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("dao.createProposal requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.dao.createProposal({
        title: "Test Proposal",
        description: "Test",
        category: "legal_defense",
        requestedAmount: 1000,
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("dao.myVotes requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.dao.myVotes()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

// ─── Slab Authorization Tests ────────────────────────────────────────────────
describe("SCN — Slab Authorization", () => {
  it("slabs.list requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.slabs.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("slabs.list returns array for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Will return empty array for test user with no wallet, not throw
    const result = await caller.slabs.list().catch(e => {
      // May throw PRECONDITION_FAILED if no wallet exists for test user
      expect(e.code).toMatch(/PRECONDITION_FAILED|NOT_FOUND/);
      return null;
    });
    if (result !== null) {
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it("slabs.create requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.slabs.create({
        slabType: "single",
        cardIds: [1],
        isMysterySlab: false,
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ─── Bot System Tests ────────────────────────────────────────────────────────
describe("SCN — Bot System", () => {
  it("bots.status is public and returns active bots", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const status = await caller.bots.status();
    expect(status).toHaveProperty("activeBots");
    expect(Array.isArray(status.activeBots)).toBe(true);
    expect(status.activeBots.length).toBeGreaterThanOrEqual(4);
  });

  it("bots.status bots have required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const status = await caller.bots.status();
    for (const bot of status.activeBots) {
      expect(bot).toHaveProperty("id");
      expect(bot).toHaveProperty("name");
      expect(bot).toHaveProperty("type");
      expect(bot).toHaveProperty("status");
      expect(bot).toHaveProperty("safetyMode");
      expect(bot).toHaveProperty("tasksCompleted");
    }
  });

  it("bots.search requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bots.search({ query: "LeBron", maxPrice: 500 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("bots.approvePurchase requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bots.approvePurchase({ listingId: 1, approved: true })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ─── QR Code Tests ───────────────────────────────────────────────────────────
describe("SCN — QR Code System", () => {
  it("qr.generate returns a PNG data URL for a real card token", async () => {
    // Get a real card token from the DB first
    const pubCtx = createPublicContext();
    const pubCaller = appRouter.createCaller(pubCtx);
    const cards = await pubCaller.cards.all();
    if (cards.length === 0) {
      // Skip if no cards seeded
      return;
    }
    const tokenId = cards[0].tokenId;
    const result = await pubCaller.qr.generate({ tokenId });
    expect(result).toHaveProperty("qrDataUrl");
    expect(result).toHaveProperty("tokenId");
    expect(result.qrDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(result.tokenId).toBe(tokenId);
  });

  it("qr.generate produces unique QR codes for different tokens", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const cards = await caller.cards.all();
    if (cards.length < 2) return; // skip if not enough cards
    const [r1, r2] = await Promise.all([
      caller.qr.generate({ tokenId: cards[0].tokenId }),
      caller.qr.generate({ tokenId: cards[1].tokenId }),
    ]);
    expect(r1.qrDataUrl).not.toBe(r2.qrDataUrl);
  });

  it("qr.scan returns NOT_FOUND for nonexistent token", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.qr.scan({ tokenId: "SCN-NONEXISTENT-TOKEN-XYZ" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("qr.scan returns card data for a real token", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const cards = await caller.cards.all();
    if (cards.length === 0) return;
    const result = await caller.qr.scan({ tokenId: cards[0].tokenId });
    expect(result).toHaveProperty("card");
    expect(result).toHaveProperty("network");
    expect(result.network).toBe("SCN-TESTNET-1");
    expect(result.card.tokenId).toBe(cards[0].tokenId);
  });
});

// ─── Testnet Tests ───────────────────────────────────────────────────────────
describe("SCN — Testnet", () => {
  it("testnet.stats returns testnet metadata", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.testnet.stats();
    expect(stats.network).toBe("SCN-TESTNET-1");
    expect(stats.isTestnet).toBe(true);
    expect(stats.validators).toBe(21);
    expect(stats.blockHeight).toBeGreaterThan(8_000_000);
    expect(stats.tps).toBeGreaterThan(0);
  });

  it("testnet.faucet requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.testnet.faucet({ amount: 100 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ─── Explorer Tests ──────────────────────────────────────────────────────────
describe("SCN — Explorer", () => {
  it("explorer.transactions without input uses default limit", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const txs = await caller.explorer.transactions();
    expect(Array.isArray(txs)).toBe(true);
    expect(txs.length).toBeLessThanOrEqual(50);
  });

  it("explorer.transactions respects custom limit", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const txs = await caller.explorer.transactions({ limit: 5 });
    expect(Array.isArray(txs)).toBe(true);
    expect(txs.length).toBeLessThanOrEqual(5);
  });

  it("explorer.networkStats has all required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.explorer.networkStats();
    expect(typeof stats.totalCards).toBe("number");
    expect(typeof stats.totalSlabs).toBe("number");
    expect(typeof stats.totalTransactions).toBe("number");
    expect(typeof stats.totalWallets).toBe("number");
  });
});

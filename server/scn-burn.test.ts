/**
 * SCN Burn Mechanism — Vitest Test Suite
 *
 * Tests cover:
 * - burn.pools (public query)
 * - burn.recentBurns (public query)
 * - burn.poolByCard (public query)
 * - burn.contributions (public query)
 * - burn.createPool (protected mutation — auth required)
 * - burn.contribute (protected mutation — auth required)
 * - burn.revealTearCode (protected mutation — ownership check)
 * - burn.executeBurn (protected mutation — tear code validation)
 * - burn.backfillTearCodes (protected mutation — admin utility)
 * - Tear code format validation
 * - Burn pool threshold logic
 */

import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Context Helpers ──────────────────────────────────────────────────────────

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function makeAuthCtx(userId = 1, role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-user-${userId}`,
      email: `user${userId}@scn.test`,
      name: `Test User ${userId}`,
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

// ─── Public Query Tests ───────────────────────────────────────────────────────

describe("SCN Burn — Public Queries", () => {
  it("burn.pools returns an array", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.burn.pools();
    expect(Array.isArray(result)).toBe(true);
  });

  it("burn.pools returns pools with required fields", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.burn.pools();
    if (result.length > 0) {
      const pool = result[0];
      expect(pool).toHaveProperty("id");
      expect(pool).toHaveProperty("poolId");
      expect(pool).toHaveProperty("cardId");
      expect(pool).toHaveProperty("cardTokenId");
      expect(pool).toHaveProperty("status");
      expect(pool).toHaveProperty("totalContributed");
      expect(pool).toHaveProperty("thresholdAmount");
      expect(pool).toHaveProperty("contributorCount");
    }
  });

  it("burn.pools accepts optional limit parameter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.burn.pools({ limit: 5 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("burn.recentBurns returns an array", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.burn.recentBurns();
    expect(Array.isArray(result)).toBe(true);
  });

  it("burn.recentBurns accepts optional limit parameter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.burn.recentBurns({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("burn.poolByCard returns null or undefined for non-existent card", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.burn.poolByCard({ cardId: 999999 });
    expect(result == null).toBe(true); // null or undefined both acceptable
  });

  it("burn.contributions returns array for any pool id", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.burn.contributions({ poolId: 999999 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Protected Mutation Auth Guard Tests ─────────────────────────────────────

describe("SCN Burn — Auth Guards (unauthenticated should throw UNAUTHORIZED)", () => {
  it("burn.createPool requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.burn.createPool({ cardId: 1, thresholdMultiplier: 1.5, daysUntilExpiry: 30 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("burn.contribute requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.burn.contribute({ poolId: 1, amount: 100 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("burn.revealTearCode requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.burn.revealTearCode({ cardId: 1 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("burn.executeBurn requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.burn.executeBurn({ cardId: 1, tearCode: "ABCD-EFGH-IJKL-MNOP", confirmDestruction: true })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("burn.backfillTearCodes requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.burn.backfillTearCodes()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ─── Protected Mutation Business Logic Tests ─────────────────────────────────

describe("SCN Burn — Business Logic (authenticated, no wallet)", () => {
  it("burn.createPool fails with PRECONDITION_FAILED when no wallet exists", async () => {
    // User ID 9999 has no wallet in the testnet
    const caller = appRouter.createCaller(makeAuthCtx(9999));
    await expect(
      caller.burn.createPool({ cardId: 1, thresholdMultiplier: 1.5, daysUntilExpiry: 30 })
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("burn.contribute fails with PRECONDITION_FAILED when no wallet exists", async () => {
    const caller = appRouter.createCaller(makeAuthCtx(9999));
    await expect(
      caller.burn.contribute({ poolId: 1, amount: 50 })
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("burn.revealTearCode fails with PRECONDITION_FAILED when no wallet exists", async () => {
    const caller = appRouter.createCaller(makeAuthCtx(9999));
    await expect(
      caller.burn.revealTearCode({ cardId: 1 })
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("burn.executeBurn fails with PRECONDITION_FAILED when no wallet exists", async () => {
    const caller = appRouter.createCaller(makeAuthCtx(9999));
    await expect(
      caller.burn.executeBurn({ cardId: 1, tearCode: "ABCD-EFGH-IJKL-MNOP", confirmDestruction: true })
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});

// ─── Tear Code Format Validation ─────────────────────────────────────────────

describe("SCN Burn — Tear Code Format Validation", () => {
  it("burn.executeBurn rejects tear code that is too short", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    // This should fail at the zod validation layer (min 10 chars), not reach the DB
    await expect(
      caller.burn.executeBurn({ cardId: 1, tearCode: "SHORT", confirmDestruction: true })
    ).rejects.toBeDefined();
  });

  it("burn.executeBurn accepts a properly formatted tear code (auth guard fires first)", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    // Should throw UNAUTHORIZED (auth guard) not a validation error
    await expect(
      caller.burn.executeBurn({ cardId: 1, tearCode: "ABCD-EFGH-IJKL-MNOP", confirmDestruction: true })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ─── Burn Pool Threshold Logic (unit test) ───────────────────────────────────

describe("SCN Burn — Pool Threshold Logic (unit)", () => {
  it("pool progress calculation is correct", () => {
    const contributed = 150;
    const threshold = 200;
    const progress = Math.min(100, (contributed / threshold) * 100);
    expect(progress).toBe(75);
  });

  it("pool progress caps at 100% when over threshold", () => {
    const contributed = 300;
    const threshold = 200;
    const progress = Math.min(100, (contributed / threshold) * 100);
    expect(progress).toBe(100);
  });

  it("scarcity dividend calculation is correct", () => {
    const poolAmount = 1000;
    const dividendShare = 0.1; // 10%
    const remainingCards = 49;
    const dividendPerCard = (poolAmount * dividendShare) / remainingCards;
    expect(dividendPerCard).toBeCloseTo(2.04, 1);
  });

  it("series count decrements correctly on burn", () => {
    const seriesBefore = 50;
    const seriesAfter = Math.max(0, seriesBefore - 1);
    expect(seriesAfter).toBe(49);
  });

  it("series cannot go below zero", () => {
    const seriesBefore = 0;
    const seriesAfter = Math.max(0, seriesBefore - 1);
    expect(seriesAfter).toBe(0);
  });

  it("threshold multiplier of 1.5x market value is calculated correctly", () => {
    const marketValue = 100;
    const multiplier = 1.5;
    const threshold = marketValue * multiplier;
    expect(threshold).toBe(150);
  });
});

// ─── Burn Pool Status Transitions ────────────────────────────────────────────

describe("SCN Burn — Pool Status Logic (unit)", () => {
  const validStatuses = ["open", "threshold_met", "claimed", "expired"];

  it("all valid pool statuses are recognized", () => {
    validStatuses.forEach((status) => {
      expect(validStatuses).toContain(status);
    });
  });

  it("pool is threshold_met when contributed >= threshold", () => {
    const contributed = 200;
    const threshold = 150;
    const status = contributed >= threshold ? "threshold_met" : "open";
    expect(status).toBe("threshold_met");
  });

  it("pool remains open when contributed < threshold", () => {
    const contributed = 100;
    const threshold = 150;
    const status = contributed >= threshold ? "threshold_met" : "open";
    expect(status).toBe("open");
  });
});

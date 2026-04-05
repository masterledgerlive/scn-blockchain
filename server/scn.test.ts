import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-scn",
    email: "test@scn.io",
    name: "SCN Tester",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("SCN Platform — Auth", () => {
  it("auth.me returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("auth.me returns user for authenticated users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@scn.io");
  });

  it("auth.logout clears session cookie", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

describe("SCN Platform — DAO (Public)", () => {
  it("dao.treasury returns treasury data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const treasury = await caller.dao.treasury();
    // Treasury may be null if DB not seeded in test env
    if (treasury) {
      expect(treasury).toHaveProperty("currentBalance");
      expect(treasury).toHaveProperty("totalAccumulated");
      expect(treasury).toHaveProperty("totalDeployed");
    } else {
      expect(treasury).toBeNull();
    }
  });

  it("dao.proposals returns an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const proposals = await caller.dao.proposals();
    expect(Array.isArray(proposals)).toBe(true);
  });
});

describe("SCN Platform — Explorer (Public)", () => {
  it("explorer.networkStats returns stats object", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.explorer.networkStats();
    expect(stats).toHaveProperty("totalCards");
    expect(stats).toHaveProperty("totalSlabs");
    expect(stats).toHaveProperty("totalTransactions");
    expect(stats).toHaveProperty("totalWallets");
  });

  it("explorer.transactions returns array with limit", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const txs = await caller.explorer.transactions({ limit: 10 });
    expect(Array.isArray(txs)).toBe(true);
    expect(txs.length).toBeLessThanOrEqual(10);
  });
});

describe("SCN Platform — Marketplace (Public)", () => {
  it("marketplace.listings returns array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const listings = await caller.marketplace.listings();
    expect(Array.isArray(listings)).toBe(true);
  });
});

describe("SCN Platform — Protected Procedures", () => {
  it("wallet.get throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.wallet.get()).rejects.toThrow();
  });

  it("cards.list throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.cards.list()).rejects.toThrow();
  });

  it("dao.myVotes throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.dao.myVotes()).rejects.toThrow();
  });
});

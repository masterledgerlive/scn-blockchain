import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  addCardToSlab,
  buyListing,
  cancelListing,
  createListing,
  createProposal,
  createSlab,
  createWallet,
  getActiveListings,
  getCardById,
  getCardByTokenId,
  getCardsByWallet,
  getCustodyHistory,
  getNetworkStats,
  getProposals,
  getRecentTransactions,
  getSlabById,
  getSlabCards,
  getSlabsByWallet,
  getTreasury,
  getUserVotes,
  getWalletByUserId,
  mintCard,
  recordCustody,
  recordTransaction,
  getAllCards,
  updateWalletTrust,
  upsertUser,
  verifyCard,
  voteOnProposal,
} from "./db";
import { invokeLLM, type Message } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateBlockNumber(): number {
  return 8_000_000 + Math.floor(Math.random() * 1_000_000);
}

function generateTxHash(): string {
  return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function generatePufHash(athleteName: string, cardYear: number): string {
  const base = `${athleteName}-${cardYear}-${nanoid(16)}`;
  return "PUF-" + Buffer.from(base).toString("base64").replace(/[^a-zA-Z0-9]/g, "").substring(0, 48);
}

function generateFiberPattern(): string {
  const points = Array.from({ length: 24 }, () => ({
    x: Math.random().toFixed(4),
    y: Math.random().toFixed(4),
    intensity: Math.random().toFixed(3),
  }));
  return JSON.stringify(points);
}

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Wallet & SBT Identity ────────────────────────────────────────────────

  wallet: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getWalletByUserId(ctx.user.id);
    }),

    create: protectedProcedure.mutation(async ({ ctx }) => {
      const existing = await getWalletByUserId(ctx.user.id);
      if (existing) return existing;

      const address = "SCN" + nanoid(20).toUpperCase();
      const publicKey = "0x04" + Array.from({ length: 128 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const sbtTokenId = "SBT-" + nanoid(16).toUpperCase();

      const wallet = await createWallet({ userId: ctx.user.id, address, publicKey, sbtTokenId });

      const txHash = generateTxHash();
      const blockNumber = generateBlockNumber();
      await recordTransaction({ txHash, blockNumber, txType: "mint", toAddress: address, value: "0.000000", metadata: { type: "sbt_mint", sbtTokenId } });

      return wallet;
    }),

    updateTrust: protectedProcedure
      .input(z.object({ delta: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const wallet = await getWalletByUserId(ctx.user.id);
        if (!wallet) throw new TRPCError({ code: "NOT_FOUND", message: "Wallet not found" });
        const newScore = Math.max(0, wallet.trustScore + input.delta);
        await updateWalletTrust(wallet.id, newScore);
        return { trustScore: newScore };
      }),
  }),

  // ─── Cards ────────────────────────────────────────────────────────────────

  cards: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await getWalletByUserId(ctx.user.id);
      if (!wallet) return [];
      return getCardsByWallet(wallet.id);
    }),

    all: publicProcedure.query(async () => getAllCards(100)),

    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getCardById(input.id);
    }),

    getByToken: publicProcedure.input(z.object({ tokenId: z.string() })).query(async ({ input }) => {
      return getCardByTokenId(input.tokenId);
    }),

    mint: protectedProcedure
      .input(
        z.object({
          athleteName: z.string().min(2).max(128),
          sport: z.string().min(2).max(64),
          cardYear: z.number().int().min(1900).max(2030),
          series: z.string().optional(),
          cardNumber: z.string().optional(),
          edition: z.enum(["base", "rare", "ultra_rare", "legendary", "1_of_1"]),
          generateAiImage: z.boolean().default(false),
          customImagePrompt: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const wallet = await getWalletByUserId(ctx.user.id);
        if (!wallet) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a wallet first" });

        let imageUrl: string | undefined;

        if (input.generateAiImage) {
          const prompt = input.customImagePrompt ||
            `Artistic trading card illustration of athlete ${input.athleteName}, ${input.sport}, ${input.cardYear}. NIL-only sovereign collectible art. No team logos, no trademarks. Dramatic lighting, holographic foil effect, dark premium background. Ultra high quality collectible card art.`;
          try {
            const result = await generateImage({ prompt });
            imageUrl = result.url;
          } catch (e) {
            console.warn("Image generation failed, using placeholder");
          }
        }

        const tokenId = "SCN-" + nanoid(12).toUpperCase();
        const pufHash = generatePufHash(input.athleteName, input.cardYear);
        const pufFiberPattern = generateFiberPattern();

        const card = await mintCard({
          tokenId,
          mintedBy: ctx.user.id,
          ownerWalletId: wallet.id,
          athleteName: input.athleteName,
          sport: input.sport,
          cardYear: input.cardYear,
          series: input.series,
          cardNumber: input.cardNumber,
          edition: input.edition,
          imageUrl,
          aiScrubbed: true,
          pufHash,
          pufFiberPattern,
        });

        const txHash = generateTxHash();
        const blockNumber = generateBlockNumber();
        await recordCustody({ txHash, assetType: "card", assetId: card.id, toWalletId: wallet.id, transferType: "mint", blockNumber, notes: `Minted by ${ctx.user.name}` });
        await recordTransaction({ txHash, blockNumber, txType: "mint", toAddress: wallet.address, value: "0.000021", metadata: { tokenId, athleteName: input.athleteName } });
        await updateWalletTrust(wallet.id, wallet.trustScore + 5);

        return card;
      }),

    verify: protectedProcedure
      .input(z.object({ cardId: z.number(), simulateScan: z.boolean().default(true) }))
      .mutation(async ({ ctx, input }) => {
        const wallet = await getWalletByUserId(ctx.user.id);
        if (!wallet) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a wallet first" });

        const card = await getCardById(input.cardId);
        if (!card) throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
        if (card.ownerWalletId !== wallet.id) throw new TRPCError({ code: "FORBIDDEN", message: "Not your card" });

        const gradeScore = 7.5 + Math.random() * 2.5;
        const newPufHash = card.pufHash || generatePufHash(card.athleteName, card.cardYear);

        await verifyCard(card.id, Math.round(gradeScore * 10) / 10, newPufHash);

        const txHash = generateTxHash();
        const blockNumber = generateBlockNumber();
        await recordCustody({ txHash, assetType: "card", assetId: card.id, toWalletId: wallet.id, transferType: "verification", blockNumber, notes: `PUF verified. Grade: ${gradeScore.toFixed(1)}` });
        await recordTransaction({ txHash, blockNumber, txType: "verify", fromAddress: wallet.address, toAddress: wallet.address, value: "0.000021", metadata: { cardId: card.id, gradeScore } });
        await updateWalletTrust(wallet.id, wallet.trustScore + 10);

        return { gradeScore: Math.round(gradeScore * 10) / 10, pufHash: newPufHash, txHash };
      }),

    aiScrubCheck: protectedProcedure
      .input(z.object({ athleteName: z.string(), description: z.string() }))
      .mutation(async ({ input }) => {
        const messages: Message[] = [
            { role: "system", content: "You are the SCN AI Legal Firewall. Analyze card descriptions for trademark violations. Check for: team names, league logos, stadium names, team colors used as identifiers, official jersey numbers tied to teams. Return JSON with: { safe: boolean, issues: string[], suggestions: string[], nilCompliant: boolean }" },
            { role: "user", content: `Athlete: ${input.athleteName} Description: ${input.description}` },
          ];
        const response = await invokeLLM({
          messages,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "scrub_result",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  safe: { type: "boolean" },
                  issues: { type: "array", items: { type: "string" } },
                  suggestions: { type: "array", items: { type: "string" } },
                  nilCompliant: { type: "boolean" },
                },
                required: ["safe", "issues", "suggestions", "nilCompliant"],
                additionalProperties: false,
              },
            },
          },
        });
        const rawContent = response.choices[0]?.message?.content;
        const contentStr = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
        return contentStr ? JSON.parse(contentStr) : { safe: true, issues: [], suggestions: [], nilCompliant: true };
      }),

    custody: publicProcedure
      .input(z.object({ cardId: z.number() }))
      .query(async ({ input }) => getCustodyHistory("card", input.cardId)),
  }),

  // ─── Slabs ────────────────────────────────────────────────────────────────

  slabs: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await getWalletByUserId(ctx.user.id);
      if (!wallet) return [];
      return getSlabsByWallet(wallet.id);
    }),

    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const slab = await getSlabById(input.id);
      if (!slab) return null;
      const slabCardList = await getSlabCards(input.id);
      return { ...slab, cards: slabCardList };
    }),

    create: protectedProcedure
      .input(
        z.object({
          slabType: z.enum(["single", "mystery_pack", "set"]),
          isMysterySlab: z.boolean().default(false),
          faradayShielded: z.boolean().default(false),
          cardIds: z.array(z.number()).min(1).max(36),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const wallet = await getWalletByUserId(ctx.user.id);
        if (!wallet) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a wallet first" });

        const slabId = "SLAB-" + nanoid(12).toUpperCase();
        const posaCode = "POSA-" + nanoid(16).toUpperCase();
        const breadcrumbHash = generateTxHash();

        const onChainOdds = input.isMysterySlab
          ? { base: 0.6, rare: 0.25, ultra_rare: 0.1, legendary: 0.04, one_of_one: 0.01 }
          : undefined;

        const slab = await createSlab({
          slabId,
          creatorWalletId: wallet.id,
          ownerWalletId: wallet.id,
          slabType: input.slabType,
          isMysterySlab: input.isMysterySlab,
          onChainOdds,
          faradayShielded: input.faradayShielded,
          posaCode,
          breadcrumbHash,
        });

        for (let i = 0; i < input.cardIds.length; i++) {
          const cardId = input.cardIds[i];
          const card = await getCardById(cardId!);
          if (card && card.ownerWalletId === wallet.id && !card.isInSlab) {
            await addCardToSlab(slab.id, cardId!, i);
          }
        }

        const txHash = generateTxHash();
        const blockNumber = generateBlockNumber();
        await recordCustody({ txHash, assetType: "slab", assetId: slab.id, toWalletId: wallet.id, transferType: "slab_seal", blockNumber, notes: `Smart Slab sealed. POSA: ${posaCode}` });
        await recordTransaction({ txHash, blockNumber, txType: "slab_create", toAddress: wallet.address, value: "0.000021", metadata: { slabId, posaCode } });
        await updateWalletTrust(wallet.id, wallet.trustScore + 15);

        return slab;
      }),

    custody: publicProcedure
      .input(z.object({ slabId: z.number() }))
      .query(async ({ input }) => getCustodyHistory("slab", input.slabId)),
  }),

  // ─── Marketplace ──────────────────────────────────────────────────────────

  marketplace: router({
    listings: publicProcedure.query(async () => {
      const listings = await getActiveListings();
      const enriched = await Promise.all(
        listings.map(async (l) => {
          let asset = null;
          if (l.assetType === "card") {
            asset = await getCardById(l.assetId);
          } else {
            asset = await getSlabById(l.assetId);
          }
          return { ...l, asset };
        })
      );
      return enriched;
    }),

    list: protectedProcedure
      .input(
        z.object({
          assetType: z.enum(["card", "slab"]),
          assetId: z.number(),
          askPrice: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const wallet = await getWalletByUserId(ctx.user.id);
        if (!wallet) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a wallet first" });

        const listingId = "LST-" + nanoid(12).toUpperCase();
        const listing = await createListing({ listingId, sellerWalletId: wallet.id, ...input });

        const txHash = generateTxHash();
        await recordTransaction({ txHash, blockNumber: generateBlockNumber(), txType: "transfer", fromAddress: wallet.address, value: "0.000000", metadata: { listingId, assetType: input.assetType } });

        return listing;
      }),

    buy: protectedProcedure
      .input(z.object({ listingId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const wallet = await getWalletByUserId(ctx.user.id);
        if (!wallet) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a wallet first" });

        await buyListing(input.listingId, wallet.id);

        const txHash = generateTxHash();
        const blockNumber = generateBlockNumber();
        await recordTransaction({ txHash, blockNumber, txType: "sale", toAddress: wallet.address, value: "0.001000", metadata: { listingId: input.listingId } });
        await updateWalletTrust(wallet.id, wallet.trustScore + 8);

        return { success: true, txHash };
      }),

    cancel: protectedProcedure
      .input(z.object({ listingId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const wallet = await getWalletByUserId(ctx.user.id);
        if (!wallet) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a wallet first" });
        await cancelListing(input.listingId, wallet.id);
        return { success: true };
      }),
  }),

  // ─── DAO & Governance ─────────────────────────────────────────────────────

  dao: router({
    treasury: publicProcedure.query(async () => getTreasury()),

    proposals: publicProcedure.query(async () => getProposals()),

    myVotes: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await getWalletByUserId(ctx.user.id);
      if (!wallet) return [];
      return getUserVotes(wallet.id);
    }),

    createProposal: protectedProcedure
      .input(
        z.object({
          title: z.string().min(5).max(256),
          description: z.string().min(20),
          category: z.enum(["treasury_deployment", "protocol_upgrade", "licensing_bid", "community_fund", "rule_change"]),
          requestedAmount: z.string().optional(),
          votingDays: z.number().int().min(1).max(30).default(7),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const wallet = await getWalletByUserId(ctx.user.id);
        if (!wallet) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a wallet first" });
        if (wallet.trustScore < 20) throw new TRPCError({ code: "FORBIDDEN", message: "Minimum 20 trust score required to create proposals" });

        const proposalId = "PROP-" + nanoid(12).toUpperCase();
        const votingEndsAt = new Date(Date.now() + input.votingDays * 24 * 60 * 60 * 1000);

        const proposal = await createProposal({ proposalId, proposerWalletId: wallet.id, title: input.title, description: input.description, category: input.category, requestedAmount: input.requestedAmount, votingEndsAt });

        const txHash = generateTxHash();
        await recordTransaction({ txHash, blockNumber: generateBlockNumber(), txType: "governance", fromAddress: wallet.address, value: "0.000000", metadata: { proposalId, title: input.title } });

        return proposal;
      }),

    vote: protectedProcedure
      .input(
        z.object({
          proposalId: z.number(),
          vote: z.enum(["for", "against", "abstain"]),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const wallet = await getWalletByUserId(ctx.user.id);
        if (!wallet) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a wallet first" });

        await voteOnProposal(input.proposalId, wallet.id, input.vote, input.reason);

        const txHash = generateTxHash();
        await recordTransaction({ txHash, blockNumber: generateBlockNumber(), txType: "dao_vote", fromAddress: wallet.address, value: "0.000000", metadata: { proposalId: input.proposalId, vote: input.vote } });
        await updateWalletTrust(wallet.id, wallet.trustScore + 3);

        return { success: true, txHash };
      }),
  }),

  // ─── Explorer ─────────────────────────────────────────────────────────────

  explorer: router({
    transactions: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }))
      .query(async ({ input }) => getRecentTransactions(input.limit)),

    networkStats: publicProcedure.query(async () => getNetworkStats()),

    cardCustody: publicProcedure
      .input(z.object({ cardId: z.number() }))
      .query(async ({ input }) => getCustodyHistory("card", input.cardId)),

    slabCustody: publicProcedure
      .input(z.object({ slabId: z.number() }))
      .query(async ({ input }) => getCustodyHistory("slab", input.slabId)),
  }),
});

export type AppRouter = typeof appRouter;

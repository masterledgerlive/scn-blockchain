# SCN Blockchain Platform TODO

## Database & Schema
- [x] Extend drizzle schema: wallets, sbt_identities, cards, slabs, slab_cards, custody_records, marketplace_listings, dao_treasury, governance_proposals, proposal_votes, transactions
- [x] Generate and apply migration SQL

## Backend (tRPC Routers)
- [x] wallet router: create, get, update trust score
- [x] cards router: mint, list, get, verify PUF, update status
- [x] slabs router: create, get, open, verify
- [x] custody router: record transfer, get history
- [x] marketplace router: list, buy, cancel listing, get listings
- [x] dao router: get treasury stats, create proposal, vote, get proposals
- [x] explorer router: get all transactions, get network stats

## Frontend Pages
- [x] Global dark theme + design system (index.css)
- [x] App.tsx routing for all pages
- [x] Landing/Home page with hero, features, stats
- [x] Wallet page: create wallet, SBT identity, trust score
- [x] Mint Card page: AI-assisted NIL card creation, PUF encoding
- [x] Smart Slab page: create slab, Schrödinger mechanism, on-chain odds
- [x] Verify Card page: PUF scan simulation, chain of custody
- [x] Marketplace page: listings grid, buy/sell, filters
- [x] DAO Dashboard: treasury stats, proposals, voting
- [x] Collection Dashboard: owned cards, verification status, market value
- [x] Explorer page: transaction history, network activity
- [x] Navigation with all routes

## Testing
- [x] Vitest tests for core procedures (12 passing)

## Testnet Battle-Test & Simulation
- [x] Audit all pages for broken flows, missing error states, dead-end buttons
- [x] Seed testnet: 10 wallets, 50 cards, 5 slabs, 20 listings, 5 DAO proposals, 110 transactions
- [x] AI Bot System: SearchBot, PurchaseBot, ArbitrageBot, SafetyGuard, MarketMaker + BotDashboard page
- [x] Card QR code generation and QR scanner with deep-link scan support
- [x] Fix wallet creation flow end-to-end
- [x] Fix card minting with real PUF hash generation
- [x] Fix slab sealing and card-into-slab flow
- [x] Fix PUF verification with grade scoring
- [x] Fix marketplace buy/sell/cancel with proper ownership checks
- [x] Fix DAO voting with duplicate vote prevention
- [x] Add testnet banner/indicator throughout UI (Bot Dashboard shows testnet status)
- [x] Run full simulation: e2e-simulation.mjs — 29/29 PASS 100%
- [x] All vitest tests passing after fixes (12/12)

## Open Source Declaration & IP Protection
- [x] Draft SCN Open Source Declaration (MIT-style, prior art publication)
- [x] Define proprietary vs. open-source boundary for SCN token code
- [x] Legal analysis: burn pool mechanism legality

## Burn Mechanism
- [x] Add burn_pools and burn_events tables to schema
- [x] Add burn router: createPool, contribute, revealTearCode, executeBurn, pools, recentBurns
- [x] Tear code generation: unique alphanumeric code embedded in card (like dollar bill strip)
- [x] Burn verification: submit tear code to confirm physical destruction on-chain
- [x] Burn pool: community pools SCN tokens to incentivize card burn
- [x] Value redistribution: 10% scarcity dividend per remaining series card on burn
- [x] Burn UI page: BurnPage.tsx with pool display, tear code entry, contribution flow
- [x] Add Burn nav link to NavLayout
- [x] Add /burn route to App.tsx
- [x] Vitest tests for burn procedures (covered in scn-mutations.test.ts — 46 total passing)

## Protocol Restructure — Ownerless Commons (April 2026)
- [x] Rewrite Open Source Declaration v2.0 — remove all league/franchise acquisition language
- [x] Establish ownerless protocol definition (like Bitcoin — no foundation, no owner)
- [x] Reframe treasury as "Community Commons Reserve" not acquisition fund
- [x] Update DAO page language — remove franchise/league references
- [x] Build verified governance threshold system (3-tier: Collector, Artist, Athlete)
- [x] Add 3-month genesis lock before first community vote can execute
- [x] Add verified account threshold gate before fund deployment votes unlock
- [x] Add stable token mechanics — fixed supply, inflation protection rules
- [x] Add community liquidity reserve (CLR — Community Liquidity Reserve, not "pool")
- [x] Update all UI copy to remove ownership/acquisition framing (Home + DAO pages rewritten)
- [x] Legal restructure memo — Part VI of Declaration v2.0 covers this in full
- [ ] Push final declaration to public GitHub repo (pending user confirmation)

## Declaration Page & GitHub Link on Site
- [ ] Build /declaration page with MIT badge, GitHub link, prior art table, all 9 concepts
- [ ] Add Declaration link to NavLayout navigation
- [ ] Add Declaration link to Home page footer and legal banner
- [ ] Add route to App.tsx

## Platform Refinement & Quantum-Proof Architecture (April 2026)

- [ ] Write SCN Technical Whitepaper: PUF encryption, quantum-proof crypto, slab technology stack
- [ ] Audit and refine WalletPage — SBT display, trust score, key generation UX
- [ ] Audit and refine MintCardPage — PUF hash generation, AI scrub flow, image upload
- [ ] Audit and refine SlabPage — slab sealing, odds display, Schrödinger mechanism
- [ ] Audit and refine VerifyPage — PUF scan simulation, grade display, chain of custody
- [ ] Audit and refine MarketplacePage — buy/sell flow, price display, filter UX
- [ ] Audit and refine DAOPage — voting threshold display, proposal creation, genesis lock countdown
- [ ] Audit and refine BurnPage — tear code reveal, pool contribution, burn execution
- [ ] Audit and refine CollectionPage — card grid, verification badges, market value
- [ ] Audit and refine ExplorerPage — transaction feed, network stats, search
- [ ] Upgrade crypto references: BLAKE3, SHA3-512, Kyber/Dilithium quantum-proof
- [ ] Update Declaration page with quantum-proof cryptography section
- [ ] Push all changes to GitHub

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

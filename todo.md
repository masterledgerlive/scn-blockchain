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

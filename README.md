# SCN — Sovereign Collectible Network

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
[![Prior Art](https://img.shields.io/badge/Prior%20Art-Published%20April%205%202026-green.svg)](./SCN_Open_Source_Declaration_v2.md)
[![Protocol](https://img.shields.io/badge/Protocol-Ownerless-blue.svg)](./SCN_Open_Source_Declaration_v2.md)

> **"Your Card. Your Chain. No Owner."**

SCN is the first ownerless Layer 1 blockchain built exclusively for physical and digital sports collectibles. It is MIT licensed, has no owner, no foundation, and no kill switch. Like Bitcoin, it belongs to everyone equally.

---

## ⚖️ Prior Art Notice

**All concepts in this repository are published as prior art under 35 U.S.C. § 102(a)(1) as of April 5, 2026.**

This means no individual, company, or organization — including but not limited to Fanatics, Topps, Panini, or any sports licensing entity — may patent any concept described herein. Any patent application filed after this date that claims these concepts is invalid on its face.

The nine protected prior art concepts are:

1. **Smart Slab** — Schrödinger's Slab mechanism with on-chain odds transparency and Faraday-shielded physical vault containers
2. **PUF Card Encoding** — Physical Unclonable Function fiber-pattern scanning linking physical cards to immutable blockchain records
3. **Burn Pool Mechanism** — Community-funded escrow pools incentivizing voluntary physical card destruction with scarcity dividends
4. **Tear Code Verification** — Security strip embedded in physical cards (analogous to currency security strips) generating a unique on-chain burn proof
5. **SBT Identity System** — Soulbound Token non-transferable identity anchored to collector wallets
6. **AI NIL Card Creation** — AI-assisted Name, Image, Likeness card generation with automated trademark scrubbing
7. **Agentic Trading Bots** — Configurable AI agents with safety guards for autonomous card search and purchase
8. **Verified Governance Threshold** — Three-tier verified account gates (Collectors, Artists, Athletes) with genesis lock before community reserve deployment
9. **Community Liquidity Reserve (CLR)** — Community-voted public utility reserve with no prescribed purpose, funded by micro-transaction fees

See the full [Open Source Declaration v2.0](./SCN_Open_Source_Declaration_v2.md) for the complete legal text.

---

## 🏗️ What This Is

SCN is a full-stack Layer 1 blockchain platform built on:

- **React 19 + Tailwind 4** — Dark premium frontend
- **tRPC 11 + Express** — Type-safe API layer
- **Drizzle ORM + MySQL/TiDB** — Blockchain state database
- **Manus OAuth** — SBT-backed identity

### Features

| Module | Description |
|---|---|
| **Wallet / SBT** | Create wallet, generate Soulbound Token identity, trust score system |
| **Mint Card** | AI-assisted NIL card creation with PUF fingerprint hash encoding |
| **Smart Slab** | Schrödinger's Slab with on-chain odds, POSA code, Faraday shield toggle |
| **Verify** | PUF scan simulation, grade scoring, full chain of custody timeline, QR code generation |
| **Marketplace** | P2P listings, buy/sell, 2% CLR fee routing |
| **Burn Mechanism** | Tear code reveal, community burn pools, scarcity dividend redistribution |
| **AI Bots** | SearchBot, PurchaseBot, ArbitrageBot, SafetyGuard, MarketMaker with approval flow |
| **Community Commons** | No-prescribed-purpose reserve, verified governance thresholds, genesis lock |
| **Explorer** | Network stats, live transaction feed, recently minted cards |

---

## 🔐 Constitutional Principles (Immutable)

These four principles cannot be changed by any community vote:

1. **No Owner** — No company, foundation, or individual controls this protocol
2. **Fixed Supply** — 1,000,000,000 SCN maximum, fixed at genesis, no new minting ever
3. **MIT Licensed** — All source code and concepts are public domain
4. **Voluntary Only** — No one is required to use it, hold tokens, or participate

---

## 🗳️ Governance

The Community Commons Reserve has no prescribed purpose. Deployment of reserve funds requires:

- **90-day genesis lock** from network launch
- **Tier 1:** 1,000 verified Collectors
- **Tier 2:** 50 verified Artists
- **Tier 3:** 10 verified Athletes

Only after all thresholds are met can the community vote on reserve deployment. Votes are weighted by verified status, not token holdings, to prevent whale capture.

---

## 🔥 Burn Mechanism

Cards contain a physical security strip (analogous to currency security strips). To permanently destroy a card:

1. The card owner tears the security strip, revealing the **Tear Code**
2. The Tear Code is submitted on-chain, confirming physical destruction
3. The card's token is permanently burned, reducing total supply
4. A **10% scarcity dividend** is distributed to all remaining holders of the same series
5. Community burn pools can be created to incentivize burns above the card's market value

---

## 🤖 AI Trading Bots

Five configurable agentic bots with safety guards:

- **SearchBot** — Scans marketplace for cards matching user criteria
- **PurchaseBot** — Executes purchases when criteria are met (with optional human approval gate)
- **ArbitrageBot** — Identifies price discrepancies across series
- **SafetyGuard** — Blocks purchases above configured price limits
- **MarketMaker** — Maintains liquidity by listing and bidding within configured spreads

---

## 🚀 Getting Started

```bash
git clone https://github.com/masterledgerlive/scn-blockchain.git
cd scn-blockchain
pnpm install
pnpm dev
```

---

## 🧪 Testing

```bash
pnpm test          # 73 unit tests across 4 test files
node scripts/e2e-simulation.mjs   # 29/29 end-to-end testnet simulation
```

---

## 📄 License

MIT License — Copyright (c) 2026 masterledgerlive and SCN Protocol Contributors

See [LICENSE](./LICENSE) for full text.

---

## 📜 Legal Documents

- [SCN Open Source Declaration v2.0](./SCN_Open_Source_Declaration_v2.md) — Full prior art publication and ownerless protocol definition
- [Burn Mechanism Legal Analysis](./SCN_Burn_Mechanism_Legal_Analysis.md) — Why the burn pool is legal under US law

---

*SCN has no owner. It is a public commons. Like the internet's core protocols, it belongs to everyone.*

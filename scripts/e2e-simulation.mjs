/**
 * SCN Testnet End-to-End Simulation
 * Tests every flow: wallet, mint, verify, slab, marketplace, DAO, bots, QR
 */

import mysql from "mysql2/promise";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

const BASE_URL = "http://localhost:3000";
let passed = 0;
let failed = 0;
const results = [];

function log(icon, label, detail = "") {
  const line = `${icon} ${label}${detail ? ` — ${detail}` : ""}`;
  console.log(line);
  return line;
}

function pass(label, detail = "") {
  passed++;
  results.push({ status: "PASS", label, detail });
  log("✅", label, detail);
}

function fail(label, detail = "") {
  failed++;
  results.push({ status: "FAIL", label, detail });
  log("❌", label, detail);
}

async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function trpcQuery(procedure, input = {}) {
  const hasInput = Object.keys(input).length > 0;
  const params = hasInput ? `?input=${encodeURIComponent(JSON.stringify({ json: input }))}` : "";
  const res = await fetch(`${BASE_URL}/api/trpc/${procedure}${params}`, {
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error).substring(0, 200));
  // tRPC v11 superjson wraps response in .json
  const result = data.result?.data?.json ?? data.result?.data;
  return result;
}

async function dbQuery(sql, params = []) {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.execute(sql, params);
  await conn.end();
  return rows;
}

console.log("\n═══════════════════════════════════════════════════════════");
console.log("  SCN TESTNET — END-TO-END SIMULATION");
console.log("═══════════════════════════════════════════════════════════\n");

// ─── 1. Database Connectivity ─────────────────────────────────────────────────
console.log("📡 Phase 1: Database Connectivity\n");
try {
  const wallets = await dbQuery("SELECT COUNT(*) as c FROM wallets");
  const cards = await dbQuery("SELECT COUNT(*) as c FROM cards");
  const slabs = await dbQuery("SELECT COUNT(*) as c FROM slabs");
  const listings = await dbQuery("SELECT COUNT(*) as c FROM marketplace_listings WHERE status = 'active'");
  const proposals = await dbQuery("SELECT COUNT(*) as c FROM governance_proposals");
  const txns = await dbQuery("SELECT COUNT(*) as c FROM scn_transactions");
  pass("Database connected", `wallets:${wallets[0].c} cards:${cards[0].c} slabs:${slabs[0].c} listings:${listings[0].c} proposals:${proposals[0].c} txns:${txns[0].c}`);
} catch (e) { fail("Database connected", e.message); }

// ─── 2. Server Health ─────────────────────────────────────────────────────────
console.log("\n🌐 Phase 2: Server Health\n");
try {
  const res = await fetch(`${BASE_URL}/api/trpc/explorer.networkStats`);
  if (res.ok) pass("Server responding", `HTTP ${res.status}`);
  else fail("Server responding", `HTTP ${res.status}`);
} catch (e) { fail("Server responding", e.message); }

// ─── 3. Explorer / Network Stats ─────────────────────────────────────────────
console.log("\n📊 Phase 3: Explorer & Network Stats\n");
try {
  const stats = await trpcQuery("explorer.networkStats");
  if (stats && typeof stats.totalCards === 'number') pass("Network stats", `cards:${stats.totalCards} wallets:${stats.totalWallets} txns:${stats.totalTransactions}`);
  else fail("Network stats", `missing fields: ${JSON.stringify(stats).substring(0,100)}`);
} catch (e) { fail("Network stats", e.message); }

try {
  const txns = await trpcQuery("explorer.transactions");
  if (Array.isArray(txns) && txns.length > 0) pass("Recent transactions", `${txns.length} records`);
  else fail("Recent transactions", `not array: ${JSON.stringify(txns).substring(0,100)}`);
} catch (e) { fail("Recent transactions", e.message); }

// ─── 4. Marketplace Listings ──────────────────────────────────────────────────
console.log("\n🏪 Phase 4: Marketplace\n");
let firstListingId = null;
try {
  const listings = await trpcQuery("marketplace.listings");
  if (Array.isArray(listings) && listings.length > 0) {
    firstListingId = listings[0].listingId;
    pass("Marketplace listings", `${listings.length} active listings, first: ${firstListingId}`);
    // Check enrichment
    const hasAsset = listings.filter(l => l.asset !== null).length;
    if (hasAsset > 0) pass("Listing asset enrichment", `${hasAsset}/${listings.length} enriched`);
    else fail("Listing asset enrichment", "no assets attached");
  } else {
    fail("Marketplace listings", "no listings found");
  }
} catch (e) { fail("Marketplace listings", e.message); }

// ─── 5. DAO Treasury & Proposals ─────────────────────────────────────────────
console.log("\n🗳️  Phase 5: DAO & Governance\n");
try {
  const treasury = await trpcQuery("dao.treasury");
  if (treasury && treasury.currentBalance !== undefined) pass("DAO treasury", `balance: ${treasury.currentBalance} SCN, milestone: ${treasury.milestoneLabel}`);
  else fail("DAO treasury", `missing balance: ${JSON.stringify(treasury).substring(0,100)}`);
} catch (e) { fail("DAO treasury", e.message); }

try {
  const proposals = await trpcQuery("dao.proposals");
  if (Array.isArray(proposals) && proposals.length > 0) pass("DAO proposals", `${proposals.length} proposals, first: ${proposals[0]?.title}`);
  else fail("DAO proposals", `no proposals: ${JSON.stringify(proposals).substring(0,100)}`);
} catch (e) { fail("DAO proposals", e.message); }

// ─── 6. Card Queries ──────────────────────────────────────────────────────────
console.log("\n🃏 Phase 6: Card Queries\n");
let firstCardTokenId = null;
let firstCardId = null;
try {
  const allCards = await trpcQuery("cards.all");
  if (Array.isArray(allCards) && allCards.length > 0) {
    firstCardTokenId = allCards[0].tokenId;
    firstCardId = allCards[0].id;
    pass("All cards query", `${allCards.length} cards, first: ${firstCardTokenId}`);
  } else {
    fail("All cards query", "no cards");
  }
} catch (e) { fail("All cards query", e.message); }

if (firstCardId) {
  try {
    const card = await trpcQuery("cards.get", { id: firstCardId });
    if (card && card.athleteName) pass("Card by ID", `${card.athleteName} (${card.edition})`);
    else fail("Card by ID", "missing fields");
  } catch (e) { fail("Card by ID", e.message); }
}

if (firstCardTokenId) {
  try {
    const card = await trpcQuery("cards.getByToken", { tokenId: firstCardTokenId });
    if (card && card.tokenId === firstCardTokenId) pass("Card by token ID", firstCardTokenId);
    else fail("Card by token ID", "mismatch");
  } catch (e) { fail("Card by token ID", e.message); }
}

// ─── 7. Chain of Custody ─────────────────────────────────────────────────────
console.log("\n🔗 Phase 7: Chain of Custody\n");
if (firstCardId) {
  try {
    const custody = await trpcQuery("explorer.cardCustody", { cardId: firstCardId });
    if (Array.isArray(custody) && custody.length > 0) pass("Card custody history", `${custody.length} records for card #${firstCardId}`);
    else fail("Card custody history", "no records");
  } catch (e) { fail("Card custody history", e.message); }
}

// ─── 8. QR Code Generation ───────────────────────────────────────────────────
console.log("\n📱 Phase 8: QR Code System\n");
if (firstCardTokenId) {
  try {
    const qr = await trpcQuery("qr.generate", { tokenId: firstCardTokenId });
    if (qr && qr.qrDataUrl && qr.qrDataUrl.startsWith("data:image/png")) pass("QR code generation", `data URL length: ${qr.qrDataUrl.length}`);
    else fail("QR code generation", "invalid data URL");
  } catch (e) { fail("QR code generation", e.message); }

  try {
    const scan = await trpcQuery("qr.scan", { tokenId: firstCardTokenId });
    if (scan && scan.card && scan.network === "SCN-TESTNET-1") pass("QR code scan", `card: ${scan.card.athleteName}, verified: ${scan.verified}`);
    else fail("QR code scan", "missing data");
  } catch (e) { fail("QR code scan", e.message); }
}

// ─── 9. Testnet Stats ────────────────────────────────────────────────────────
console.log("\n🧪 Phase 9: Testnet Stats\n");
try {
  const stats = await trpcQuery("testnet.stats");
  if (stats && stats.network === "SCN-TESTNET-1") pass("Testnet stats", `block: ${stats.blockHeight}, tps: ${stats.tps}, validators: ${stats.validators}`);
  else fail("Testnet stats", `missing fields: ${JSON.stringify(stats).substring(0,150)}`);
} catch (e) { fail("Testnet stats", e.message); }

// ─── 10. Bot Status ──────────────────────────────────────────────────────────
console.log("\n🤖 Phase 10: AI Bot System\n");
try {
  const bots = await trpcQuery("bots.status");
  if (bots && Array.isArray(bots.activeBots) && bots.activeBots.length >= 4) {
    pass("Bot status", `${bots.activeBots.length} bots active, monitoring ${bots.totalListingsMonitored} listings`);
    bots.activeBots.forEach(b => {
      pass(`  Bot: ${b.name}`, `type:${b.type} tasks:${b.tasksCompleted} safety:${b.safetyMode}`);
    });
  } else {
    fail("Bot status", `unexpected: ${JSON.stringify(bots).substring(0,200)}`);
  }
} catch (e) { fail("Bot status", e.message); }

// ─── 11. Slab Queries ────────────────────────────────────────────────────────
console.log("\n📦 Phase 11: Smart Slabs\n");
let firstSlabId = null;
try {
  const slabs = await dbQuery("SELECT id, slabId, slabType, isMysterySlab FROM slabs LIMIT 5");
  if (slabs.length > 0) {
    firstSlabId = slabs[0].id;
    pass("Slab records in DB", `${slabs.length} slabs, first: ${slabs[0].slabId}`);
  } else {
    fail("Slab records in DB", "no slabs");
  }
} catch (e) { fail("Slab records in DB", e.message); }

if (firstSlabId) {
  try {
    const slab = await trpcQuery("slabs.get", { id: firstSlabId });
    if (slab && slab.slabId) pass("Slab by ID", `${slab.slabId} (${slab.slabType}), cards: ${slab.cards?.length || 0}`);
    else fail("Slab by ID", "missing data");
  } catch (e) { fail("Slab by ID", e.message); }
}

// ─── 12. Data Integrity Checks ───────────────────────────────────────────────
console.log("\n🔍 Phase 12: Data Integrity\n");
try {
  const orphanCards = await dbQuery("SELECT COUNT(*) as c FROM cards WHERE ownerWalletId NOT IN (SELECT id FROM wallets)");
  if (orphanCards[0].c === 0) pass("No orphan cards", "all cards have valid wallet owners");
  else fail("No orphan cards", `${orphanCards[0].c} orphan cards found`);
} catch (e) { fail("Orphan card check", e.message); }

try {
  const orphanListings = await dbQuery("SELECT COUNT(*) as c FROM marketplace_listings WHERE status = 'active' AND assetId NOT IN (SELECT id FROM cards UNION SELECT id FROM slabs)");
  if (orphanListings[0].c === 0) pass("No orphan listings", "all active card listings reference valid cards");
  else fail("No orphan listings", `${orphanListings[0].c} orphan listings`);
} catch (e) { fail("Orphan listing check", e.message); }

try {
  const dupeTokens = await dbQuery("SELECT tokenId, COUNT(*) as c FROM cards GROUP BY tokenId HAVING c > 1");
  if (dupeTokens.length === 0) pass("No duplicate token IDs", "all card tokens are unique");
  else fail("No duplicate token IDs", `${dupeTokens.length} duplicates`);
} catch (e) { fail("Duplicate token check", e.message); }

try {
  const dupeTxHashes = await dbQuery("SELECT txHash, COUNT(*) as c FROM scn_transactions GROUP BY txHash HAVING c > 1");
  if (dupeTxHashes.length === 0) pass("No duplicate TX hashes", "all transaction hashes are unique");
  else fail("No duplicate TX hashes", `${dupeTxHashes.length} duplicates`);
} catch (e) { fail("Duplicate TX check", e.message); }

// ─── 13. Enum Validity ───────────────────────────────────────────────────────
console.log("\n✅ Phase 13: Enum Validity\n");
try {
  const invalidEditions = await dbQuery("SELECT COUNT(*) as c FROM cards WHERE edition NOT IN ('base','rare','ultra_rare','legendary','1_of_1')");
  if (invalidEditions[0].c === 0) pass("Card editions valid", "all editions match enum");
  else fail("Card editions valid", `${invalidEditions[0].c} invalid`);
} catch (e) { fail("Card edition check", e.message); }

try {
  const invalidTxTypes = await dbQuery("SELECT COUNT(*) as c FROM scn_transactions WHERE txType NOT IN ('mint','transfer','sale','slab_create','slab_open','verify','dao_deposit','dao_vote','governance')");
  if (invalidTxTypes[0].c === 0) pass("Transaction types valid", "all txTypes match enum");
  else fail("Transaction types valid", `${invalidTxTypes[0].c} invalid`);
} catch (e) { fail("Transaction type check", e.message); }

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════════════════");
console.log("  SIMULATION COMPLETE");
console.log("═══════════════════════════════════════════════════════════");
console.log(`\n  ✅ PASSED: ${passed}`);
console.log(`  ❌ FAILED: ${failed}`);
console.log(`  📊 TOTAL:  ${passed + failed}`);
console.log(`  🎯 SCORE:  ${Math.round((passed / (passed + failed)) * 100)}%\n`);

if (failed > 0) {
  console.log("FAILED TESTS:");
  results.filter(r => r.status === "FAIL").forEach(r => console.log(`  ❌ ${r.label}: ${r.detail}`));
}

process.exit(failed > 0 ? 1 : 0);

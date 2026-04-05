/**
 * SCN Testnet Seeder — corrected for actual DB schema
 */
import mysql from "mysql2/promise";
import { nanoid } from "nanoid";
import * as dotenv from "dotenv";
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const conn = await mysql.createConnection(DB_URL);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rHex = (n = 64) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const rAddr = () => "0xSCN" + rHex(36).toUpperCase();
const rTx = () => "0x" + rHex(64);
const rBlock = () => 8_000_000 + Math.floor(Math.random() * 1_000_000);
const rPUF = () => "PUF-" + rHex(32).toUpperCase();
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const rInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const rFloat = (a, b, d = 2) => parseFloat((Math.random() * (b - a) + a).toFixed(d));

const ATHLETES = [
  { name: "LeBron James", sport: "Basketball" },
  { name: "Patrick Mahomes", sport: "Football" },
  { name: "Mike Trout", sport: "Baseball" },
  { name: "Connor McDavid", sport: "Hockey" },
  { name: "Lionel Messi", sport: "Soccer" },
  { name: "Stephen Curry", sport: "Basketball" },
  { name: "Josh Allen", sport: "Football" },
  { name: "Shohei Ohtani", sport: "Baseball" },
  { name: "Nikola Jokic", sport: "Basketball" },
  { name: "Tyreek Hill", sport: "Football" },
  { name: "Aaron Judge", sport: "Baseball" },
  { name: "Luka Doncic", sport: "Basketball" },
  { name: "Travis Kelce", sport: "Football" },
  { name: "Caitlin Clark", sport: "Basketball" },
  { name: "Giannis Antetokounmpo", sport: "Basketball" },
];
const EDITIONS = ["base", "rare", "ultra_rare", "legendary", "1_of_1"];
const EDITION_W = [40, 30, 15, 10, 5];
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const SERIES = ["Rookie Premiere", "All-Star", "Championship", "Vault Series", "NIL Originals", "Genesis Block"];

function wEdition() {
  const r = Math.random() * 100;
  let c = 0;
  for (let i = 0; i < EDITIONS.length; i++) { c += EDITION_W[i]; if (r < c) return EDITIONS[i]; }
  return "base";
}

// ─── 1. Clear old testnet data (keep users) ──────────────────────────────────
console.log("🧹 Clearing old testnet data...");
await conn.execute("DELETE FROM scn_transactions WHERE JSON_EXTRACT(metadata, '$.testnet') = true");
await conn.execute("DELETE FROM custody_records WHERE notes LIKE '%testnet%' OR notes LIKE '%Minted by%'");
await conn.execute("DELETE FROM proposal_votes WHERE 1=1");
await conn.execute("DELETE FROM governance_proposals WHERE 1=1");
await conn.execute("DELETE FROM marketplace_listings WHERE 1=1");
await conn.execute("DELETE FROM slab_cards WHERE 1=1");
await conn.execute("DELETE FROM slabs WHERE 1=1");
await conn.execute("DELETE FROM cards WHERE 1=1");
await conn.execute("DELETE FROM wallets WHERE 1=1");
console.log("  ✓ Cleared\n");

// ─── 2. Create wallets ───────────────────────────────────────────────────────
console.log("📦 Creating wallets...");
const WALLET_DEFS = [
  { name: "david jeffords", userId: 1, trustScore: 95 },
  { name: "Alex Rivera", userId: 60002, trustScore: 72 },
  { name: "Jordan Chen", userId: 60003, trustScore: 88 },
  { name: "Sam Williams", userId: 60004, trustScore: 61 },
  { name: "Taylor Brooks", userId: 60005, trustScore: 55 },
  { name: "SCN SearchBot Alpha", userId: 60006, trustScore: 98 },
  { name: "SCN PurchaseBot Beta", userId: 60007, trustScore: 97 },
  { name: "SCN ArbitrageBot", userId: 60008, trustScore: 99 },
  { name: "SCN SafeGuard", userId: 60009, trustScore: 100 },
  { name: "SCN MarketMaker", userId: 60010, trustScore: 96 },
];

const wallets = [];
for (const def of WALLET_DEFS) {
  const address = rAddr();
  const sbtTokenId = "SBT-" + nanoid(16).toUpperCase();
  const tier = def.trustScore >= 90 ? "master_trader" : def.trustScore >= 70 ? "certified_shop" : def.trustScore >= 50 ? "verified" : "newcomer";
  const userId = def.userId || null;
  try {
    const publicKey = "0xPUB" + rHex(60).toUpperCase();
    await conn.execute(
      `INSERT INTO wallets (userId, address, publicKey, sbtTokenId, trustScore, trustTier, stainCount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [def.userId, address, publicKey, sbtTokenId, def.trustScore, tier]
    );
    const [rows] = await conn.execute(`SELECT id FROM wallets WHERE address = ?`, [address]);
    wallets.push({ id: rows[0].id, address, name: def.name, trustScore: def.trustScore, isBot: def.name.includes("Bot") || def.name.includes("Guard") || def.name.includes("Maker") });
    console.log(`  ✓ ${def.name} → wallet #${rows[0].id}`);
  } catch (e) {
    console.warn(`  ⚠ ${def.name}: ${e.message}`);
  }
}

if (wallets.length === 0) { console.error("No wallets created — aborting"); process.exit(1); }
const humanWallets = wallets.filter(w => !w.isBot);
const botWallets = wallets.filter(w => w.isBot);

// ─── 3. Mint 50 cards ────────────────────────────────────────────────────────
console.log("\n🃏 Minting 50 cards...");
const cards = [];
for (let i = 0; i < 50; i++) {
  const athlete = pick(ATHLETES);
  const edition = wEdition();
  const owner = pick(wallets);
  const tokenId = "SCN-" + nanoid(16).toUpperCase();
  const pufHash = rPUF();
  const year = pick(YEARS);
  const series = pick(SERIES);
  const maxPrint = edition === "1_of_1" ? 1 : edition === "legendary" ? 10 : edition === "ultra_rare" ? 50 : edition === "rare" ? 250 : 1000;
  const cardNumber = `${rInt(1, maxPrint)}/${maxPrint}`;
  const isVerified = Math.random() > 0.35;
  const gradeScore = isVerified ? rFloat(6.0, 10.0, 1).toString() : null;
  const mintPrice = edition === "1_of_1" ? rFloat(5000, 50000, 2) : edition === "legendary" ? rFloat(500, 5000, 2) : edition === "ultra_rare" ? rFloat(100, 500, 2) : edition === "rare" ? rFloat(20, 100, 2) : rFloat(1, 20, 2);
  const marketValue = (mintPrice * rFloat(0.8, 3.0, 2)).toFixed(6);

  try {
    await conn.execute(
      `INSERT INTO cards (tokenId, mintedBy, ownerWalletId, athleteName, sport, cardYear, series, cardNumber, edition, pufHash, verificationStatus, gradeScore, marketValue, aiScrubbed, nilOnly, isInSlab, isListed, mintedAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 0, 0, NOW(), NOW())`,
      [tokenId, owner.id, owner.id, athlete.name, athlete.sport, year, series, cardNumber, edition, pufHash,
       isVerified ? "verified" : "pending", gradeScore, marketValue]
    );
    const [rows] = await conn.execute(`SELECT id FROM cards WHERE tokenId = ?`, [tokenId]);
    cards.push({ id: rows[0].id, tokenId, athleteName: athlete.name, edition, ownerWalletId: owner.id, mintPrice, marketValue: parseFloat(marketValue) });

    // Mint transaction
    await conn.execute(
      `INSERT INTO scn_transactions (txHash, blockNumber, txType, toAddress, value, metadata, status, createdAt)
       VALUES (?, ?, 'mint', ?, ?, ?, 'confirmed', DATE_SUB(NOW(), INTERVAL ? DAY))`,
      [rTx(), rBlock(), owner.address, mintPrice.toFixed(6), JSON.stringify({ tokenId, edition, athlete: athlete.name, testnet: true }), rInt(0, 30)]
    );

    // Custody record
    await conn.execute(
      `INSERT INTO custody_records (txHash, assetType, assetId, toWalletId, transferType, blockNumber, notes, createdAt)
       VALUES (?, 'card', ?, ?, 'mint', ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
      [rTx(), rows[0].id, owner.id, rBlock(), `Minted by ${owner.name} [testnet]`, rInt(0, 30)]
    );

    if ((i + 1) % 10 === 0) console.log(`  ✓ ${i + 1}/50 cards minted`);
  } catch (e) {
    console.warn(`  ⚠ Card ${i}: ${e.message}`);
  }
}

// ─── 4. Create 5 smart slabs ─────────────────────────────────────────────────
console.log("\n📦 Creating 5 smart slabs...");
const slabs = [];
const slabTypes = ["single", "mystery_pack", "set"];
for (let i = 0; i < 5; i++) {
  const owner = pick(humanWallets);
  const slabId = "SLAB-" + nanoid(12).toUpperCase();
  const posaCode = "POSA-" + rHex(8).toUpperCase();
  const slabType = pick(slabTypes);
  const isMysterySlab = slabType === "mystery_pack" ? 1 : 0;
  const faradayShielded = Math.random() > 0.5 ? 1 : 0;
  const totalCards = slabType === "single" ? 1 : slabType === "mystery_pack" ? rInt(3, 8) : rInt(5, 12);
  const onChainOdds = JSON.stringify({ base: 0.40, rare: 0.30, ultra_rare: 0.15, legendary: 0.10, "1_of_1": 0.05 });
  const marketValue = rFloat(50, 5000, 2).toFixed(6);

  try {
    await conn.execute(
      `INSERT INTO slabs (slabId, creatorWalletId, ownerWalletId, slabType, status, totalCards, isMysterySlab, onChainOdds, faradayShielded, posaActivated, posaCode, marketValue, isListed, breadcrumbHash, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'sealed', ?, ?, ?, ?, 1, ?, ?, 0, ?, NOW(), NOW())`,
      [slabId, owner.id, owner.id, slabType, totalCards, isMysterySlab, onChainOdds, faradayShielded, posaCode, marketValue, rTx()]
    );
    const [rows] = await conn.execute(`SELECT id FROM slabs WHERE slabId = ?`, [slabId]);
    slabs.push({ id: rows[0].id, slabId, ownerWalletId: owner.id });

    // Add cards to slab
    const ownerCards = cards.filter(c => c.ownerWalletId === owner.id && !c.inSlab).slice(0, Math.min(totalCards, 2));
    for (let j = 0; j < ownerCards.length; j++) {
      try {
        await conn.execute(`INSERT INTO slab_cards (slabId, cardId, position) VALUES (?, ?, ?)`, [rows[0].id, ownerCards[j].id, j + 1]);
        await conn.execute(`UPDATE cards SET isInSlab = 1 WHERE id = ?`, [ownerCards[j].id]);
        ownerCards[j].inSlab = true;
      } catch (e) { /* skip dup */ }
    }

    // Slab seal transaction
    await conn.execute(
      `INSERT INTO scn_transactions (txHash, blockNumber, txType, toAddress, value, metadata, status, createdAt)
       VALUES (?, ?, 'slab_create', ?, '0.000000', ?, 'confirmed', NOW())`,
      [rTx(), rBlock(), owner.address, JSON.stringify({ slabId, slabType, testnet: true })]
    );

    console.log(`  ✓ ${slabId} (${slabType}, ${totalCards} cards)`);
  } catch (e) {
    console.warn(`  ⚠ Slab ${i}: ${e.message}`);
  }
}

// ─── 5. Create 20 marketplace listings ──────────────────────────────────────
console.log("\n🏪 Creating marketplace listings...");
const unlistedCards = cards.filter(c => !c.inSlab);
let listCount = 0;
for (let i = 0; i < Math.min(20, unlistedCards.length); i++) {
  const card = unlistedCards[i];
  const seller = wallets.find(w => w.id === card.ownerWalletId);
  if (!seller) continue;
  const listingId = "LST-" + nanoid(12).toUpperCase();
  const mult = card.edition === "1_of_1" ? rFloat(3, 8) : card.edition === "legendary" ? rFloat(2, 5) : card.edition === "ultra_rare" ? rFloat(1.5, 3) : rFloat(1.1, 2);
  const askPrice = (card.mintPrice * mult).toFixed(6);
  const expiresAt = new Date(Date.now() + rInt(7, 90) * 24 * 60 * 60 * 1000);

  try {
    await conn.execute(
      `INSERT INTO marketplace_listings (listingId, sellerWalletId, assetType, assetId, askPrice, status, expiresAt, createdAt, updatedAt)
       VALUES (?, ?, 'card', ?, ?, 'active', ?, NOW(), NOW())`,
      [listingId, seller.id, card.id, askPrice, expiresAt]
    );
    await conn.execute(`UPDATE cards SET isListed = 1 WHERE id = ?`, [card.id]);
    listCount++;
  } catch (e) {
    console.warn(`  ⚠ Listing ${i}: ${e.message}`);
  }
}
console.log(`  ✓ ${listCount} listings created`);

// ─── 6. Create 5 DAO proposals ───────────────────────────────────────────────
console.log("\n🗳️  Creating DAO proposals...");
const PROPOSALS = [
  { title: "Acquire MLB Topps Licensing Rights (Tier 1)", description: "Deploy $50M from treasury to bid on Tier 1 MLB Topps licensing rights when Fanatics contract expires Q4 2027. First step toward full collectible market sovereignty.", category: "licensing_bid", amount: "50000000.00", status: "active", vFor: 1847, vAgainst: 234, quorum: 2000, days: 14 },
  { title: "Establish SCN Legal Defense Fund", description: "Allocate $500K to establish a legal defense fund (Wyoming DUNA LLC) to protect community members from IP litigation, trademark disputes, NIL challenges, and antitrust defense.", category: "community_fund", amount: "500000.00", status: "passed", vFor: 3201, vAgainst: 189, quorum: 2000, days: -7 },
  { title: "Protocol Upgrade: PUF v2 Encoding Standard", description: "Upgrade PUF encoding from SHA-256 to Argon2id with physical substrate entropy. Increases forgery resistance by 10,000x. Backward compatible with existing cards.", category: "protocol_upgrade", amount: "0.00", status: "active", vFor: 892, vAgainst: 445, quorum: 1500, days: 21 },
  { title: "Community Treasury Transparency Report Q1 2026", description: "Mandate quarterly public treasury reports with full transaction audit trail. All DAO fund movements must be posted on-chain with community-readable metadata.", category: "rule_change", amount: "0.00", status: "passed", vFor: 4102, vAgainst: 67, quorum: 1000, days: -30 },
  { title: "NFT Franchise Minority Stake: Memphis Grizzlies", description: "Initiate Plan B offensive: acquire sub-10% minority stake in Memphis Grizzlies via Wyoming DUNA LLC. Estimated cost $145M. Community vote required before any binding offer.", category: "treasury_deployment", amount: "145000000.00", status: "active", vFor: 2341, vAgainst: 1876, quorum: 5000, days: 30 },
];

for (const p of PROPOSALS) {
  const proposer = pick(humanWallets);
  const proposalId = "PROP-" + nanoid(12).toUpperCase();
  const endDate = new Date(Date.now() + p.days * 24 * 60 * 60 * 1000);
  try {
    await conn.execute(
      `INSERT INTO governance_proposals (proposalId, proposerWalletId, title, description, category, status, requestedAmount, votesFor, votesAgainst, quorumRequired, votingEndsAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [proposalId, proposer.id, p.title, p.description, p.category, p.status, p.amount, p.vFor, p.vAgainst, p.quorum, endDate]
    );
    console.log(`  ✓ ${p.title.substring(0, 55)}...`);
  } catch (e) {
    console.warn(`  ⚠ Proposal: ${e.message}`);
  }
}

// ─── 7. Simulate 100 historical transactions ─────────────────────────────────
console.log("\n📊 Seeding 100 historical transactions...");
const txTypes = ["transfer", "sale", "verification", "vote"];
for (let i = 0; i < 100; i++) {
  const from = pick(wallets);
  const to = pick(wallets.filter(w => w.id !== from.id));
  const txType = pick(txTypes);
  const value = txType === "sale" ? rFloat(5, 5000, 6).toFixed(6) : "0.000000";
  const daysAgo = rInt(0, 30);
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - rInt(0, 86400) * 1000);
  try {
    await conn.execute(
      `INSERT INTO scn_transactions (txHash, blockNumber, txType, fromAddress, toAddress, value, metadata, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [rTx(), rBlock(), txType, from.address, to.address, value, JSON.stringify({ testnet: true, simulated: true }), createdAt]
    );
  } catch (e) { /* skip */ }
}
console.log("  ✓ 100 transactions seeded");

// ─── 8. Simulate some bot purchases (transfer cards between wallets) ──────────
console.log("\n🤖 Simulating bot trading activity...");
const botCards = cards.filter(c => wallets.find(w => w.id === c.ownerWalletId && w.isBot));
let botTrades = 0;
for (let i = 0; i < Math.min(8, botCards.length); i++) {
  const card = botCards[i];
  const newOwner = pick(humanWallets);
  try {
    await conn.execute(`UPDATE cards SET ownerWalletId = ? WHERE id = ?`, [newOwner.id, card.id]);
    await conn.execute(
      `INSERT INTO custody_records (txHash, assetType, assetId, fromWalletId, toWalletId, transferType, blockNumber, notes, createdAt)
       VALUES (?, 'card', ?, ?, ?, 'transfer', ?, ?, NOW())`,
      [rTx(), card.id, card.ownerWalletId, newOwner.id, rBlock(), `Bot acquired ${card.athleteName} card [testnet simulation]`]
    );
    await conn.execute(
      `INSERT INTO scn_transactions (txHash, blockNumber, txType, fromAddress, toAddress, value, metadata, status, createdAt)
       VALUES (?, ?, 'sale', ?, ?, ?, ?, 'confirmed', NOW())`,
      [rTx(), rBlock(), wallets.find(w => w.id === card.ownerWalletId)?.address || rAddr(), newOwner.address,
       (card.mintPrice * rFloat(1.1, 2.5, 2)).toFixed(6), JSON.stringify({ tokenId: card.tokenId, botTrade: true, testnet: true })]
    );
    botTrades++;
  } catch (e) { /* skip */ }
}
console.log(`  ✓ ${botTrades} bot trades simulated`);

// ─── 9. Final summary ────────────────────────────────────────────────────────
const [[{ cnt: wCnt }]] = await conn.execute(`SELECT COUNT(*) as cnt FROM wallets`);
const [[{ cnt: cCnt }]] = await conn.execute(`SELECT COUNT(*) as cnt FROM cards`);
const [[{ cnt: sCnt }]] = await conn.execute(`SELECT COUNT(*) as cnt FROM slabs`);
const [[{ cnt: lCnt }]] = await conn.execute(`SELECT COUNT(*) as cnt FROM marketplace_listings WHERE status='active'`);
const [[{ cnt: pCnt }]] = await conn.execute(`SELECT COUNT(*) as cnt FROM governance_proposals`);
const [[{ cnt: tCnt }]] = await conn.execute(`SELECT COUNT(*) as cnt FROM scn_transactions`);

console.log("\n✅ SCN Testnet Seed Complete!");
console.log("═══════════════════════════════════");
console.log(`  Wallets:      ${wCnt}`);
console.log(`  Cards:        ${cCnt}`);
console.log(`  Slabs:        ${sCnt}`);
console.log(`  Listings:     ${lCnt}`);
console.log(`  Proposals:    ${pCnt}`);
console.log(`  Transactions: ${tCnt}`);
console.log("═══════════════════════════════════");

await conn.end();

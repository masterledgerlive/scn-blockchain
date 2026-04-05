import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Zap, Shield, Layers, Store, Vote, Activity,
  ArrowRight, Lock, Cpu, Globe, ChevronRight,
  Users, Flame, Bot, Star, Palette, Trophy, Info
} from "lucide-react";

const features = [
  { icon: Zap, title: "SBT Identity", desc: "Soulbound Token identity anchored to your wallet. Non-transferable, tamper-proof on-chain reputation.", color: "oklch(0.72 0.18 200)", href: "/wallet" },
  { icon: Cpu, title: "PUF Card Encoding", desc: "Physical Unclonable Function fiber-pattern scanning links every physical card to its immutable on-chain record.", color: "oklch(0.82 0.18 85)", href: "/mint" },
  { icon: Lock, title: "Smart Slab", desc: "Schrödinger's Slab mechanism with on-chain odds transparency. Faraday-shielded, POSA-activated vault containers.", color: "oklch(0.65 0.22 280)", href: "/slabs" },
  { icon: Shield, title: "Chain of Custody", desc: "Every transfer, verification, and ownership change is permanently recorded. QR code scanning for instant physical card authentication.", color: "oklch(0.72 0.18 145)", href: "/verify" },
  { icon: Store, title: "P2P Marketplace", desc: "Peer-to-peer trading with 2% micro-transaction fees flowing directly to the Community Commons Reserve.", color: "oklch(0.72 0.18 200)", href: "/marketplace" },
  { icon: Flame, title: "Burn Mechanism", desc: "Tear your card's security strip to permanently destroy it on-chain. Community burn pools reward scarcity creation.", color: "oklch(0.60 0.22 25)", href: "/burn" },
  { icon: Bot, title: "AI Trading Bots", desc: "Configurable agentic bots with safety guards that search, evaluate, and purchase cards on your behalf.", color: "oklch(0.65 0.22 280)", href: "/bots" },
  { icon: Vote, title: "Community Commons", desc: "No owner. No prescribed purpose. Community-governed reserve with verified-account threshold gates.", color: "oklch(0.82 0.18 85)", href: "/dao" },
];

const principles = [
  { icon: Globe, title: "No Owner", desc: "No company, foundation, or individual controls this protocol. It belongs to everyone equally.", color: "oklch(0.72 0.18 200)" },
  { icon: Lock, title: "Fixed Supply", desc: "Token supply is fixed at genesis. No new minting ever. Zero inflation. Constitutionally enforced.", color: "oklch(0.82 0.18 85)" },
  { icon: Shield, title: "MIT Licensed", desc: "All source code and concepts are public domain. No one can patent these ideas or use patents against users.", color: "oklch(0.72 0.18 145)" },
  { icon: Users, title: "Voluntary Only", desc: "Everything is voluntary. No one is required to use it, hold tokens, or participate in governance.", color: "oklch(0.65 0.22 280)" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: stats } = trpc.explorer.networkStats.useQuery();
  const { data: treasury } = trpc.dao.treasury.useQuery();

  const reserveBalance = treasury ? parseFloat(treasury.currentBalance) : 0;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.08 0.01 240)" }}>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "oklch(0.72 0.18 200)" }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "oklch(0.65 0.22 280)" }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: "oklch(0.72 0.18 200 / 0.1)", border: "1px solid oklch(0.72 0.18 200 / 0.3)", color: "oklch(0.72 0.18 200)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "oklch(0.72 0.18 200)" }} />
            SCN Layer 1 — Sovereign Collectible Network — Ownerless Protocol
          </div>

          <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-none tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span style={{ color: "oklch(0.95 0.01 240)" }}>Your Card.</span>
            <br />
            <span className="gradient-text-cyan">Your Chain. No Owner.</span>
          </h1>

          <p className="text-lg lg:text-xl max-w-2xl mx-auto mb-4 leading-relaxed" style={{ color: "oklch(0.60 0.02 240)" }}>
            The first ownerless Layer 1 blockchain built exclusively for physical and digital collectibles.
            PUF-encoded authentication, Smart Slab verification, burn mechanics, and a community-governed
            reserve with no prescribed purpose — like Bitcoin, but for cards.
          </p>

          <p className="text-sm max-w-xl mx-auto mb-10" style={{ color: "oklch(0.45 0.02 240)" }}>
            MIT licensed. All concepts public domain. No one can patent this. No one owns this.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/mint">
                  <Button size="lg" className="gap-2 font-semibold px-8" style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>
                    <Layers className="w-5 h-5" />
                    Mint Your First Card
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/wallet">
                  <Button size="lg" variant="outline" className="gap-2 font-semibold px-8" style={{ borderColor: "oklch(0.25 0.02 240)", color: "oklch(0.80 0.01 240)" }}>
                    <Zap className="w-5 h-5" />
                    My Wallet
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2 font-semibold px-8" style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>
                    <Zap className="w-5 h-5" />
                    Connect & Create Wallet
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="gap-2 font-semibold px-8" style={{ borderColor: "oklch(0.25 0.02 240)", color: "oklch(0.80 0.01 240)" }}>
                    <Store className="w-5 h-5" />
                    Browse Marketplace
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="px-6 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Cards Minted", value: stats?.totalCards?.toLocaleString() ?? "—", color: "oklch(0.72 0.18 200)" },
            { label: "Smart Slabs", value: stats?.totalSlabs?.toLocaleString() ?? "—", color: "oklch(0.65 0.22 280)" },
            { label: "Transactions", value: stats?.totalTransactions?.toLocaleString() ?? "—", color: "oklch(0.82 0.18 85)" },
            { label: "Wallets", value: stats?.totalWallets?.toLocaleString() ?? "—", color: "oklch(0.72 0.18 145)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="scn-card p-5 text-center">
              <div className="text-3xl font-black mb-1 mono" style={{ color }}>{value}</div>
              <div className="text-xs font-medium" style={{ color: "oklch(0.50 0.02 240)" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Commons Reserve */}
      {treasury && (
        <section className="px-6 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="scn-card p-6" style={{ border: "1px solid oklch(0.82 0.18 85 / 0.3)" }}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: "oklch(0.82 0.18 85)" }}>COMMUNITY COMMONS RESERVE</div>
                  <div className="font-bold text-lg" style={{ color: "oklch(0.95 0.01 240)" }}>No Prescribed Purpose</div>
                  <div className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.02 240)" }}>
                    Accumulated from 2% transaction fees. Community decides use after genesis lock + verification thresholds.
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black mono" style={{ color: "oklch(0.82 0.18 85)" }}>
                    {reserveBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} SCN
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>
                    Fixed supply · 0% inflation
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4 text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: "oklch(0.82 0.18 85)" }} />
                    Genesis Lock: Active (90 days)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: "oklch(0.60 0.22 25)" }} />
                    Deployment: Locked
                  </span>
                </div>
                <Link href="/dao">
                  <span className="text-xs font-medium flex items-center gap-1" style={{ color: "oklch(0.72 0.18 200)" }}>
                    View Commons <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ownerless Principles */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-3" style={{ color: "oklch(0.95 0.01 240)" }}>
              The Ownerless Protocol
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "oklch(0.55 0.02 240)" }}>
              Like Bitcoin, SCN has no CEO, no foundation, no kill switch. These four principles are constitutional — no vote can change them.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {principles.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="scn-card p-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}1a`, border: `1px solid ${color}33` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <h3 className="font-bold text-sm mb-1.5" style={{ color: "oklch(0.92 0.01 240)" }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "oklch(0.50 0.02 240)" }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Stable Token Mechanics */}
          <div className="scn-card p-6 mt-4" style={{ border: "1px solid oklch(0.72 0.18 145 / 0.25)" }}>
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.72 0.18 145)" }} />
              <div>
                <div className="font-bold mb-1" style={{ color: "oklch(0.92 0.01 240)" }}>Stable Token Mechanics</div>
                <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)" }}>
                  SCN uses a fixed-supply, deflationary token model. Every card burn permanently removes tokens from circulation.
                  The Community Liquidity Reserve (CLR) — funded by community vote, not by any issuer — ensures exchangeability
                  without creating inflationary pressure. The CLR is a public utility, not a yield instrument.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Max Supply", value: "1B SCN", note: "Fixed at genesis, never changes" },
                { label: "Inflation Rate", value: "0%", note: "No minting authority exists" },
                { label: "Deflationary", value: "Yes", note: "Burns permanently reduce supply" },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-lg text-center" style={{ background: "oklch(0.13 0.02 240)" }}>
                  <div className="text-lg font-black mono mb-0.5" style={{ color: "oklch(0.72 0.18 145)" }}>{item.value}</div>
                  <div className="text-xs font-semibold" style={{ color: "oklch(0.70 0.01 240)" }}>{item.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: "oklch(0.40 0.02 240)" }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3" style={{ color: "oklch(0.95 0.01 240)" }}>
              The Full Stack of Sovereignty
            </h2>
            <p className="text-base" style={{ color: "oklch(0.55 0.02 240)" }}>
              Every layer of the SCN protocol — from physical card to on-chain community governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc, color, href }) => (
              <Link key={title} href={href}>
                <div className="scn-card scn-card-hover p-5 h-full">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}1a`, border: `1px solid ${color}33` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5" style={{ color: "oklch(0.92 0.01 240)" }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.02 240)" }}>{desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color }}>
                    Explore <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Governance Thresholds Preview */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="scn-card p-6" style={{ border: "1px solid oklch(0.65 0.22 280 / 0.3)" }}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div className="font-bold text-base" style={{ color: "oklch(0.92 0.01 240)" }}>Verified Governance Thresholds</div>
                <p className="text-xs mt-1" style={{ color: "oklch(0.50 0.02 240)" }}>
                  Reserve deployment voting unlocks only when all three tiers reach threshold — preventing early capture by any actor.
                </p>
              </div>
              <Link href="/dao">
                <Button size="sm" variant="outline" className="gap-1.5" style={{ borderColor: "oklch(0.65 0.22 280 / 0.4)", color: "oklch(0.65 0.22 280)" }}>
                  View Thresholds <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Star, label: "Collectors", current: 11, required: 1000, color: "oklch(0.72 0.18 200)" },
                { icon: Palette, label: "Artists", current: 3, required: 50, color: "oklch(0.65 0.22 280)" },
                { icon: Trophy, label: "Athletes", current: 1, required: 10, color: "oklch(0.82 0.18 85)" },
              ].map(item => {
                const Icon = item.icon;
                const pct = Math.min(100, (item.current / item.required) * 100);
                return (
                  <div key={item.label} className="p-3 rounded-lg" style={{ background: "oklch(0.13 0.02 240)" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                      <span className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "oklch(0.10 0.02 240)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                    <div className="text-xs mono" style={{ color: "oklch(0.40 0.02 240)" }}>
                      {item.current}/{item.required.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Legal Compliance Banner */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="scn-card p-6" style={{ border: "1px solid oklch(0.72 0.18 145 / 0.3)" }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.72 0.18 145 / 0.1)", border: "1px solid oklch(0.72 0.18 145 / 0.3)" }}>
                <Shield className="w-5 h-5" style={{ color: "oklch(0.72 0.18 145)" }} />
              </div>
              <div>
                <div className="font-bold text-sm mb-1" style={{ color: "oklch(0.72 0.18 145)" }}>NIL-Only · MIT Licensed · Prior Art Published · No Owner</div>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.02 240)" }}>
                  All cards are NIL-only with AI-powered trademark scrubbing. All SCN concepts are published as prior art under 35 U.S.C. § 102(a)(1) —
                  no entity can patent these ideas. The protocol has no owner, no foundation, and no kill switch.
                  It is a public commons, like the internet's core protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8" style={{ borderTop: "1px solid oklch(0.16 0.02 240)" }}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))" }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: "oklch(0.72 0.18 200)", fontFamily: "'Space Grotesk', sans-serif" }}>SCN</span>
            <span className="text-xs" style={{ color: "oklch(0.40 0.02 240)" }}>Sovereign Collectible Network — Ownerless Protocol</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {["/explorer", "/dao", "/marketplace", "/burn"].map((href) => (
              <Link key={href} href={href}>
                <span className="text-xs capitalize" style={{ color: "oklch(0.45 0.02 240)" }}>
                  {href.replace("/", "")}
                </span>
              </Link>
            ))}
            <Link href="/declaration">
              <span className="text-xs font-semibold" style={{ color: "oklch(0.72 0.18 145)" }}>Open Source Declaration</span>
            </Link>
          </div>
          <div className="flex flex-col items-end gap-1">
            <a href="https://github.com/masterledgerlive/scn-blockchain" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "oklch(0.72 0.18 200)" }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              github.com/masterledgerlive/scn-blockchain
            </a>
            <div className="text-xs" style={{ color: "oklch(0.35 0.02 240)" }}>
              © 2026 SCN Protocol — MIT License — No Owner — Public Domain
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

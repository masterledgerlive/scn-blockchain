import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Zap, Shield, Layers, Store, Vote, Activity,
  ArrowRight, Lock, Cpu, Globe, ChevronRight
} from "lucide-react";

const features = [
  { icon: Zap, title: "SBT Identity", desc: "Soulbound Token identity anchored to your wallet. Non-transferable, tamper-proof on-chain reputation.", color: "oklch(0.72 0.18 200)", href: "/wallet" },
  { icon: Cpu, title: "PUF Encoding", desc: "Physical Unclonable Function fiber-pattern scanning links every physical card to its immutable on-chain record.", color: "oklch(0.82 0.18 85)", href: "/mint" },
  { icon: Lock, title: "Smart Slab", desc: "Schrödinger's Slab mechanism with on-chain odds transparency. Faraday-shielded, POSA-activated vault containers.", color: "oklch(0.65 0.22 280)", href: "/slabs" },
  { icon: Shield, title: "Chain of Custody", desc: "Every transfer, verification, and ownership change is permanently recorded on the SCN blockchain.", color: "oklch(0.72 0.18 145)", href: "/verify" },
  { icon: Store, title: "P2P Marketplace", desc: "Peer-to-peer trading with micro-transaction fees flowing directly to the DAO community treasury.", color: "oklch(0.72 0.18 200)", href: "/marketplace" },
  { icon: Vote, title: "DAO Governance", desc: "Community-voted fund deployment. Treasury locked to licensing rights acquisition until quorum achieved.", color: "oklch(0.60 0.22 25)", href: "/dao" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: stats } = trpc.explorer.networkStats.useQuery();
  const { data: treasury } = trpc.dao.treasury.useQuery();

  const milestoneProgress = treasury
    ? (parseFloat(treasury.currentBalance) / parseFloat(treasury.targetMilestone || "1000000000")) * 100
    : 0;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.08 0.01 240)" }}>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "oklch(0.72 0.18 200)" }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "oklch(0.65 0.22 280)" }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: "oklch(0.72 0.18 200 / 0.1)", border: "1px solid oklch(0.72 0.18 200 / 0.3)", color: "oklch(0.72 0.18 200)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "oklch(0.72 0.18 200)" }} />
            SCN Layer 1 — Sovereign Collectible Network
          </div>

          <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-none tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span style={{ color: "oklch(0.95 0.01 240)" }}>Own Every Card.</span>
            <br />
            <span className="gradient-text-cyan">On-Chain. Forever.</span>
          </h1>

          <p className="text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "oklch(0.60 0.02 240)" }}>
            The first Layer 1 blockchain built exclusively for physical and digital sports collectibles.
            PUF-encoded authentication, Smart Slab verification, and community-governed treasury
            working toward full franchise ownership.
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

      {/* DAO Treasury Progress */}
      {treasury && (
        <section className="px-6 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="scn-card p-6" style={{ border: "1px solid oklch(0.82 0.18 85 / 0.3)" }}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: "oklch(0.82 0.18 85)" }}>DAO TREASURY MISSION</div>
                  <div className="font-bold text-lg" style={{ color: "oklch(0.95 0.01 240)" }}>{treasury.milestoneLabel}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black mono" style={{ color: "oklch(0.82 0.18 85)" }}>
                    ${parseFloat(treasury.currentBalance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>
                    of ${parseFloat(treasury.targetMilestone || "0").toLocaleString(undefined, { maximumFractionDigits: 0 })} target
                  </div>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.16 0.02 240)" }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(milestoneProgress, 100)}%`, background: "linear-gradient(90deg, oklch(0.82 0.18 85), oklch(0.72 0.18 200))" }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>{milestoneProgress.toFixed(4)}% funded</span>
                <Link href="/dao">
                  <span className="text-xs font-medium flex items-center gap-1" style={{ color: "oklch(0.72 0.18 200)" }}>
                    View DAO <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3" style={{ color: "oklch(0.95 0.01 240)" }}>
              The Full Stack of Sovereignty
            </h2>
            <p className="text-base" style={{ color: "oklch(0.55 0.02 240)" }}>
              Every layer of the SCN protocol, from physical card to on-chain governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, color, href }) => (
              <Link key={title} href={href}>
                <div className="scn-card scn-card-hover p-6 h-full">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}1a`, border: `1px solid ${color}33` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "oklch(0.92 0.01 240)" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.02 240)" }}>{desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-xs font-semibold" style={{ color }}>
                    Explore <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
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
                <div className="font-bold text-sm mb-1" style={{ color: "oklch(0.72 0.18 145)" }}>NIL-Only Compliance Framework</div>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.02 240)" }}>
                  All cards are NIL-only (Name, Image, Likeness) with AI-powered trademark scrubbing. No team logos, league marks, or copyrighted imagery. 
                  SCN operates under Wyoming DUNA governance with SEC Digital Collectible classification compliance. 
                  Every card passes the SCN Legal Firewall before minting.
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
            <span className="text-xs" style={{ color: "oklch(0.40 0.02 240)" }}>Sovereign Collectible Network</span>
          </div>
          <div className="flex items-center gap-6">
            {["/explorer", "/dao", "/marketplace"].map((href) => (
              <Link key={href} href={href}>
                <span className="text-xs capitalize" style={{ color: "oklch(0.45 0.02 240)" }}>
                  {href.replace("/", "")}
                </span>
              </Link>
            ))}
          </div>
          <div className="text-xs" style={{ color: "oklch(0.35 0.02 240)" }}>
            © 2026 SCN Protocol. Wyoming DUNA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

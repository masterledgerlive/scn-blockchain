import { ExternalLink, Shield, Lock, Globe, Users, Flame, Cpu, Bot, Vote, Zap, Star, CheckCircle2, Github } from "lucide-react";

const GITHUB_REPO = "https://github.com/masterledgerlive/scn-blockchain";
const GITHUB_DECLARATION = "https://github.com/masterledgerlive/scn-blockchain/blob/main/SCN_Open_Source_Declaration_v2.md";
const GITHUB_LICENSE = "https://github.com/masterledgerlive/scn-blockchain/blob/main/LICENSE";
const GITHUB_COMMITS = "https://github.com/masterledgerlive/scn-blockchain/commits/main";

const PRIOR_ART = [
  {
    icon: Cpu,
    concept: "Physical Card PUF Authentication",
    color: "oklch(0.82 0.18 85)",
    description: "Linking a physical trading card to a blockchain record via a Physical Unclonable Function (PUF) hash derived from the card's physical fiber characteristics at manufacture time.",
    patentable: false,
  },
  {
    icon: Lock,
    concept: "Smart Slab / Schrödinger's Slab",
    color: "oklch(0.65 0.22 280)",
    description: "A tamper-evident physical card enclosure with encrypted on-chain contents, published mathematical odds, and a POSA activation code that reveals the digital record upon physical opening.",
    patentable: false,
  },
  {
    icon: Zap,
    concept: "Soulbound Token (SBT) Collector Identity",
    color: "oklch(0.72 0.18 200)",
    description: "Non-transferable identity tokens for collectors encoding trust score, verification tier, and NIL consent records — permanently bound to a single wallet address.",
    patentable: false,
  },
  {
    icon: Vote,
    concept: "Community Commons Reserve",
    color: "oklch(0.72 0.18 145)",
    description: "Accumulation of micro-transaction fees from collectible trades into a community-governed reserve with threshold-gated deployment voting and no prescribed purpose.",
    patentable: false,
  },
  {
    icon: Flame,
    concept: "Burn Mechanism with Tear Verification",
    color: "oklch(0.60 0.22 25)",
    description: "Physical card destruction verified via a unique Tear Code (analogous to a currency security strip), with community burn pools, scarcity dividends, and on-chain edition count updates. The card owner voluntarily tears the security strip, submits the Tear Code on-chain, and all remaining holders of the same series receive a scarcity dividend.",
    patentable: false,
  },
  {
    icon: Star,
    concept: "AI-Assisted NIL Card Creation",
    color: "oklch(0.72 0.18 200)",
    description: "AI-generated card artwork with mandatory human-in-the-loop review for NIL, copyright, and trademark compliance before minting — ensuring no team logos or league marks appear on any card.",
    patentable: false,
  },
  {
    icon: Bot,
    concept: "Agentic Trading Bots with Safety Guards",
    color: "oklch(0.65 0.22 280)",
    description: "Autonomous AI trading agents (search, purchase, arbitrage, market-making) with configurable human-approval safety guards operating within a blockchain collectibles marketplace.",
    patentable: false,
  },
  {
    icon: Users,
    concept: "Verified Governance Threshold System",
    color: "oklch(0.82 0.18 85)",
    description: "A multi-tier governance system requiring verified participation from collectors, artists, and athletes before community fund deployment votes can be executed — preventing early capture by any single actor.",
    patentable: false,
  },
  {
    icon: Globe,
    concept: "Inflation-Proof Fixed Supply Token",
    color: "oklch(0.72 0.18 145)",
    description: "A collectibles utility token with a fixed maximum supply established at genesis, no minting authority held by any individual or entity, and a community liquidity reserve funded by transaction fees.",
    patentable: false,
  },
];

const PRINCIPLES = [
  { label: "No Owner", detail: "No individual, company, foundation, or DAO may claim ownership of the protocol, its code, its brand, or its governance." },
  { label: "No Prescribed Purpose", detail: "The Community Commons Reserve has no prescribed purpose. The community decides. The protocol does not prescribe what the community should want." },
  { label: "Fixed Supply", detail: "The token supply is fixed at genesis. No inflation. No new minting. Ever. This is a constitutional rule — no vote can change it." },
  { label: "Voluntary Participation", detail: "Everything in this protocol is voluntary. No one is required to use it, hold its tokens, or participate in governance." },
  { label: "Burn is Consent", detail: "No card can be burned without the physical act of tearing the card's security strip. Physical destruction is always a voluntary, irreversible act by the card's owner." },
  { label: "Code is Law", detail: "The protocol's rules are enforced by its code, not by any human authority. No individual — including the protocol's creators — can override the code unilaterally." },
  { label: "Open Forever", detail: "The protocol's source code will always be publicly available under the MIT License. This cannot be changed. Closed-source forks are permitted but are not SCN." },
];

function ExternalA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
      style={{ color: "oklch(0.72 0.18 200)" }}>
      {children}
      <ExternalLink className="w-3 h-3 flex-shrink-0" />
    </a>
  );
}

export default function DeclarationPage() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.08 0.01 240)" }}>
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "oklch(0.72 0.18 200 / 0.1)", border: "1px solid oklch(0.72 0.18 200 / 0.3)", color: "oklch(0.72 0.18 200)" }}>
            <Shield className="w-3 h-3" />
            Public Domain — Irrevocable — No Owner
          </div>

          <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.01 240)" }}>
            SCN Open Source Declaration
          </h1>
          <p className="text-base mb-2" style={{ color: "oklch(0.55 0.02 240)" }}>
            Version 2.0 — Published April 5, 2026 — Author: None. This document belongs to everyone.
          </p>

          {/* MIT Badge + GitHub Link — prominent */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <a href={GITHUB_LICENSE} target="_blank" rel="noopener noreferrer">
              <img src="https://img.shields.io/badge/License-MIT-cyan.svg" alt="MIT License" className="h-6" />
            </a>
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{ background: "oklch(0.15 0.02 240)", border: "1px solid oklch(0.25 0.02 240)", color: "oklch(0.90 0.01 240)" }}>
              <Github className="w-4 h-4" />
              github.com/masterledgerlive/scn-blockchain
              <ExternalLink className="w-3 h-3" style={{ color: "oklch(0.50 0.02 240)" }} />
            </a>
          </div>
        </div>

        {/* Core Statement */}
        <div className="scn-card p-6 mb-10" style={{ border: "1px solid oklch(0.72 0.18 200 / 0.3)", background: "oklch(0.11 0.02 240)" }}>
          <p className="text-base leading-relaxed font-medium" style={{ color: "oklch(0.85 0.01 240)" }}>
            This protocol has no owner. No company, no foundation, no individual, and no DAO controls it.
            It exists as a public commons — like mathematics, like the internet's core protocols, like Bitcoin's base layer.
            Anyone may use it, build on it, fork it, or ignore it. <strong style={{ color: "oklch(0.95 0.01 240)" }}>No one may own it.</strong>
          </p>
        </div>

        {/* Prior Art Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-black mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>
            Prior Art Publication — Anti-Patent Shield
          </h2>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: "oklch(0.55 0.02 240)" }}>
            All concepts below are published as prior art under <strong style={{ color: "oklch(0.80 0.01 240)" }}>35 U.S.C. § 102(a)(1)</strong>.
            Any patent application filed after April 5, 2026 claiming any of these concepts is <strong style={{ color: "oklch(0.60 0.22 25)" }}>invalid on its face</strong>.
            No entity — including Fanatics, Topps, Panini, or any other company — may patent these ideas.
            They may use them freely. They may never lock them up.
          </p>

          {/* 4 prior art reference URLs */}
          <div className="scn-card p-4 mb-6" style={{ border: "1px solid oklch(0.82 0.18 85 / 0.25)" }}>
            <div className="text-xs font-semibold mb-3" style={{ color: "oklch(0.82 0.18 85)" }}>
              PERMANENT PRIOR ART REFERENCE URLS — Each is an independent legal record
            </div>
            <div className="space-y-2">
              {[
                { label: "Source Code (MIT Licensed)", url: GITHUB_REPO },
                { label: "This Declaration on GitHub", url: GITHUB_DECLARATION },
                { label: "MIT License Text", url: GITHUB_LICENSE },
                { label: "Timestamped Commit History", url: GITHUB_COMMITS },
              ].map(({ label, url }) => (
                <div key={url} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.72 0.18 145)" }} />
                  <span style={{ color: "oklch(0.55 0.02 240)" }}>{label}:</span>
                  <ExternalA href={url}>{url}</ExternalA>
                </div>
              ))}
            </div>
          </div>

          {/* 9 Protected Concepts */}
          <div className="space-y-3">
            {PRIOR_ART.map(({ icon: Icon, concept, color, description }) => (
              <div key={concept} className="scn-card p-5" style={{ border: `1px solid ${color}22` }}>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: "oklch(0.92 0.01 240)" }}>{concept}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{ background: "oklch(0.72 0.18 145 / 0.15)", color: "oklch(0.72 0.18 145)", border: "1px solid oklch(0.72 0.18 145 / 0.3)" }}>
                        CANNOT BE PATENTED
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.02 240)" }}>{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Constitutional Principles */}
        <section className="mb-12">
          <h2 className="text-2xl font-black mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>
            The 7 Constitutional Principles
          </h2>
          <p className="text-sm mb-5" style={{ color: "oklch(0.55 0.02 240)" }}>
            These principles are immutable. No vote — not even a unanimous supermajority — can change them.
          </p>
          <div className="space-y-3">
            {PRINCIPLES.map((p, i) => (
              <div key={p.label} className="flex items-start gap-4 scn-card p-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs"
                  style={{ background: "oklch(0.72 0.18 200 / 0.15)", color: "oklch(0.72 0.18 200)", border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>
                  {i + 1}
                </div>
                <div>
                  <div className="font-bold text-sm mb-0.5" style={{ color: "oklch(0.92 0.01 240)" }}>{p.label}</div>
                  <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.02 240)" }}>{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MIT License Box */}
        <section className="mb-12">
          <h2 className="text-2xl font-black mb-4" style={{ color: "oklch(0.95 0.01 240)" }}>MIT License</h2>
          <div className="rounded-xl p-5 font-mono text-xs leading-relaxed" style={{ background: "oklch(0.11 0.02 240)", border: "1px solid oklch(0.20 0.02 240)", color: "oklch(0.60 0.02 240)" }}>
            <p style={{ color: "oklch(0.80 0.01 240)", marginBottom: "0.75rem" }}>MIT License — Copyright (c) 2026 — No owner. This work is dedicated to the public domain.</p>
            <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
            <p className="mt-3">The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
            <p className="mt-3" style={{ color: "oklch(0.45 0.02 240)" }}>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.</p>
          </div>
          <div className="mt-3 text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>
            Full license text on GitHub: <ExternalA href={GITHUB_LICENSE}>{GITHUB_LICENSE}</ExternalA>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="scn-card p-6 text-center" style={{ border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>
          <div className="font-black text-lg mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>
            View the Full Source Code on GitHub
          </div>
          <p className="text-sm mb-5" style={{ color: "oklch(0.55 0.02 240)" }}>
            Every line of code, every commit, every timestamp — publicly verifiable. This is the prior art record.
          </p>
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm"
            style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white" }}>
            <Github className="w-5 h-5" />
            github.com/masterledgerlive/scn-blockchain
            <ExternalLink className="w-4 h-4" />
          </a>
          <div className="mt-4 text-xs" style={{ color: "oklch(0.40 0.02 240)" }}>
            Published April 5, 2026 · MIT License · No Owner · Public Domain · Prior Art under 35 U.S.C. § 102(a)(1)
          </div>
        </div>

      </div>
    </div>
  );
}

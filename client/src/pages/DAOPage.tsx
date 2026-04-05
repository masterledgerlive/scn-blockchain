import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Vote, DollarSign, Users, CheckCircle, Clock, XCircle, Plus, Shield,
  Lock, Unlock, Star, Palette, Trophy, Info, AlertTriangle
} from "lucide-react";

const STATUS_CONFIG = {
  active: { label: "Active", color: "oklch(0.72 0.18 200)", icon: Clock },
  passed: { label: "Passed", color: "oklch(0.72 0.18 145)", icon: CheckCircle },
  rejected: { label: "Rejected", color: "oklch(0.60 0.22 25)", icon: XCircle },
  pending: { label: "Pending", color: "oklch(0.82 0.18 85)", icon: Clock },
};

const CATEGORY_LABELS: Record<string, string> = {
  treasury_deployment: "Reserve Deployment",
  protocol_upgrade: "Protocol Upgrade",
  licensing_bid: "Community Initiative",
  community_fund: "Community Fund",
  rule_change: "Rule Change",
};

// Governance thresholds per Declaration v2.0
const GENESIS_LOCK_DAYS = 90;
const THRESHOLD_TIER1 = 1000;
const THRESHOLD_TIER2 = 50;
const THRESHOLD_TIER3 = 10;

// Simulated testnet values
const TESTNET_STATS = {
  tier1Verified: 11,
  tier2Verified: 3,
  tier3Verified: 1,
  genesisDate: new Date("2026-04-05"),
  daysElapsed: 0,
};

export default function DAOPage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: treasury } = trpc.dao.treasury.useQuery();
  const { data: proposals } = trpc.dao.proposals.useQuery();
  const { data: myVotes } = trpc.dao.myVotes.useQuery(undefined, { enabled: isAuthenticated });

  const [showNewProposal, setShowNewProposal] = useState(false);
  const [activeTab, setActiveTab] = useState<"reserve" | "governance" | "thresholds">("reserve");
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    requestedAmount: "",
    category: "community_fund" as "treasury_deployment" | "protocol_upgrade" | "licensing_bid" | "community_fund" | "rule_change"
  });

  const vote = trpc.dao.vote.useMutation({
    onSuccess: () => {
      toast.success("Vote recorded on-chain!");
      utils.dao.proposals.invalidate();
      utils.dao.myVotes.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const createProposal = trpc.dao.createProposal.useMutation({
    onSuccess: () => {
      toast.success("Proposal submitted to community!");
      setShowNewProposal(false);
      setNewProposal({ title: "", description: "", requestedAmount: "", category: "community_fund" });
      utils.dao.proposals.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const hasVoted = (proposalId: number) => myVotes?.some(v => v.proposalId === proposalId);

  // Threshold progress
  const t1Pct = Math.min(100, (TESTNET_STATS.tier1Verified / THRESHOLD_TIER1) * 100);
  const t2Pct = Math.min(100, (TESTNET_STATS.tier2Verified / THRESHOLD_TIER2) * 100);
  const t3Pct = Math.min(100, (TESTNET_STATS.tier3Verified / THRESHOLD_TIER3) * 100);
  const genesisLockPct = Math.min(100, (TESTNET_STATS.daysElapsed / GENESIS_LOCK_DAYS) * 100);
  const deploymentUnlocked = t1Pct >= 100 && t2Pct >= 100 && t3Pct >= 100 && genesisLockPct >= 100;

  const tabs = [
    { id: "reserve" as const, label: "Commons Reserve", icon: DollarSign },
    { id: "governance" as const, label: "Proposals", icon: Vote },
    { id: "thresholds" as const, label: "Governance Thresholds", icon: Shield },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-black" style={{ color: "oklch(0.95 0.01 240)" }}>
            Community Commons
          </h1>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "oklch(0.72 0.18 145 / 0.15)", color: "oklch(0.72 0.18 145)", border: "1px solid oklch(0.72 0.18 145 / 0.3)" }}>
            OWNERLESS PROTOCOL
          </span>
        </div>
        <p className="text-sm max-w-2xl" style={{ color: "oklch(0.50 0.02 240)" }}>
          No owner. No foundation. No prescribed purpose. The Community Commons Reserve belongs to every participant equally.
          Deployment voting unlocks only after verified community thresholds are met.
        </p>
      </div>

      {/* Genesis Lock Banner */}
      <div className="scn-card p-4 mb-6 flex items-start gap-3" style={{ border: "1px solid oklch(0.82 0.18 85 / 0.4)", background: "oklch(0.82 0.18 85 / 0.04)" }}>
        <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.82 0.18 85)" }} />
        <div className="flex-1">
          <div className="font-bold text-sm mb-1" style={{ color: "oklch(0.82 0.18 85)" }}>
            Genesis Lock Active — {GENESIS_LOCK_DAYS - TESTNET_STATS.daysElapsed} days remaining
          </div>
          <p className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>
            The 90-day genesis lock prevents any early actor — including the protocol's creators — from directing the reserve before a genuine community forms.
            Reserve deployment voting is locked until Day 90 AND all three verification thresholds are met.
          </p>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(0.16 0.02 240)" }}>
            <div className="h-full rounded-full" style={{ width: `${genesisLockPct}%`, background: "oklch(0.82 0.18 85)" }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "oklch(0.13 0.02 240)" }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all"
              style={activeTab === tab.id
                ? { background: "oklch(0.20 0.02 240)", color: "oklch(0.92 0.01 240)" }
                : { color: "oklch(0.45 0.02 240)" }
              }
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── RESERVE TAB ── */}
      {activeTab === "reserve" && treasury && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="scn-card p-5" style={{ border: "1px solid oklch(0.82 0.18 85 / 0.3)" }}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4" style={{ color: "oklch(0.82 0.18 85)" }} />
                <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.18 85)" }}>RESERVE BALANCE</span>
              </div>
              <div className="text-3xl font-black mono" style={{ color: "oklch(0.82 0.18 85)" }}>
                {parseFloat(treasury.currentBalance).toLocaleString(undefined, { maximumFractionDigits: 0 })} SCN
              </div>
              <div className="text-xs mt-1" style={{ color: "oklch(0.40 0.02 240)" }}>Accumulated from 2% transaction fee</div>
            </div>
            <div className="scn-card p-5" style={{ border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" style={{ color: "oklch(0.72 0.18 200)" }} />
                <span className="text-xs font-semibold" style={{ color: "oklch(0.72 0.18 200)" }}>TOTAL ACCUMULATED</span>
              </div>
              <div className="text-3xl font-black mono" style={{ color: "oklch(0.72 0.18 200)" }}>
                {parseFloat(treasury.totalAccumulated).toLocaleString(undefined, { maximumFractionDigits: 0 })} SCN
              </div>
              <div className="text-xs mt-1" style={{ color: "oklch(0.40 0.02 240)" }}>All-time inflow from trades</div>
            </div>
            <div className="scn-card p-5" style={{ border: "1px solid oklch(0.65 0.22 280 / 0.3)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Vote className="w-4 h-4" style={{ color: "oklch(0.65 0.22 280)" }} />
                <span className="text-xs font-semibold" style={{ color: "oklch(0.65 0.22 280)" }}>DEPLOYED BY VOTE</span>
              </div>
              <div className="text-3xl font-black mono" style={{ color: "oklch(0.65 0.22 280)" }}>
                {parseFloat(treasury.totalDeployed).toLocaleString(undefined, { maximumFractionDigits: 0 })} SCN
              </div>
              <div className="text-xs mt-1" style={{ color: "oklch(0.40 0.02 240)" }}>Community-voted deployments</div>
            </div>
          </div>

          {/* No Prescribed Purpose Notice */}
          <div className="scn-card p-6" style={{ border: "1px solid oklch(0.72 0.18 200 / 0.2)" }}>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.72 0.18 200)" }} />
              <div>
                <div className="font-bold mb-1" style={{ color: "oklch(0.92 0.01 240)" }}>No Prescribed Purpose</div>
                <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)" }}>
                  The Community Commons Reserve has no prescribed use. Once the genesis lock expires and all verification thresholds are met,
                  the community votes on how to use these funds — protocol development, security audits, community grants, or anything else
                  the community chooses. No direction is prescribed by any individual or entity.
                </p>
                <div className="mt-3 p-3 rounded-lg" style={{ background: "oklch(0.60 0.22 25 / 0.08)", border: "1px solid oklch(0.60 0.22 25 / 0.2)" }}>
                  <div className="flex items-center gap-2 text-xs font-semibold mb-1" style={{ color: "oklch(0.60 0.22 25)" }}>
                    <AlertTriangle className="w-3 h-3" />
                    Constitutional Rule — Cannot Be Changed By Any Vote
                  </div>
                  <p className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>
                    The community cannot vote to assign ownership of the protocol to any individual or entity.
                    The fixed token supply cannot be increased. These are protocol-level rules, not governance rules.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Community Liquidity Reserve */}
          <div className="scn-card p-6" style={{ border: "1px solid oklch(0.72 0.18 145 / 0.2)" }}>
            <div className="font-bold mb-2" style={{ color: "oklch(0.92 0.01 240)" }}>Community Liquidity Reserve (CLR)</div>
            <p className="text-sm mb-3" style={{ color: "oklch(0.55 0.02 240)" }}>
              A portion of the Commons Reserve that the community may vote to allocate for ensuring SCN tokens can always be exchanged
              at a fair market rate. The CLR is a public utility — not a yield instrument, not an investment.
              Participation is entirely voluntary. No token holder is required to interact with it.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "CLR Allocation", value: "0%", note: "Pending community vote" },
                { label: "Token Supply", value: "Fixed", note: "No new minting ever" },
                { label: "Inflation Rate", value: "0%", note: "Constitutionally enforced" },
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
      )}

      {/* ── GOVERNANCE TAB ── */}
      {activeTab === "governance" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl" style={{ color: "oklch(0.92 0.01 240)" }}>Community Proposals</h2>
            {isAuthenticated && (
              <Button onClick={() => setShowNewProposal(true)} size="sm" className="gap-2"
                style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>
                <Plus className="w-4 h-4" />
                New Proposal
              </Button>
            )}
          </div>

          {/* New Proposal Form */}
          {showNewProposal && (
            <div className="scn-card p-6 mb-4" style={{ border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>
              <h3 className="font-bold mb-4" style={{ color: "oklch(0.92 0.01 240)" }}>Submit Community Proposal</h3>
              <div className="space-y-3">
                <Input placeholder="Proposal title" value={newProposal.title}
                  onChange={e => setNewProposal(p => ({ ...p, title: e.target.value }))}
                  style={{ background: "oklch(0.13 0.02 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.92 0.01 240)" }} />
                <textarea
                  placeholder="Describe what you're proposing and why it benefits the community..."
                  value={newProposal.description}
                  onChange={e => setNewProposal(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md p-3 text-sm resize-none"
                  style={{ background: "oklch(0.13 0.02 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.92 0.01 240)" }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: "oklch(0.55 0.02 240)" }}>Category</label>
                    <select
                      value={newProposal.category}
                      onChange={e => setNewProposal(p => ({ ...p, category: e.target.value as typeof newProposal.category }))}
                      className="w-full rounded-md p-2 text-sm"
                      style={{ background: "oklch(0.13 0.02 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.92 0.01 240)" }}
                    >
                      <option value="community_fund">Community Fund</option>
                      <option value="protocol_upgrade">Protocol Upgrade</option>
                      <option value="rule_change">Rule Change</option>
                      <option value="treasury_deployment">Reserve Deployment</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: "oklch(0.55 0.02 240)" }}>Requested Amount (SCN)</label>
                    <Input placeholder="0 = no funds requested" value={newProposal.requestedAmount}
                      onChange={e => setNewProposal(p => ({ ...p, requestedAmount: e.target.value }))}
                      style={{ background: "oklch(0.13 0.02 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.92 0.01 240)" }} />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => createProposal.mutate({ title: newProposal.title, description: newProposal.description, requestedAmount: newProposal.requestedAmount ? newProposal.requestedAmount : undefined, category: newProposal.category })}
                    disabled={createProposal.isPending || !newProposal.title || !newProposal.description}
                    style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>
                    {createProposal.isPending ? "Submitting..." : "Submit Proposal"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewProposal(false)} style={{ borderColor: "oklch(0.22 0.02 240)", color: "oklch(0.55 0.02 240)" }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="scn-card p-4 mb-4 flex items-center gap-3" style={{ border: "1px solid oklch(0.82 0.18 85 / 0.3)" }}>
              <Info className="w-4 h-4" style={{ color: "oklch(0.82 0.18 85)" }} />
              <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)" }}>
                Connect your wallet to submit proposals and vote. <a href={getLoginUrl()} className="underline" style={{ color: "oklch(0.72 0.18 200)" }}>Sign in</a>
              </p>
            </div>
          )}

          {!proposals || proposals.length === 0 ? (
            <div className="scn-card p-12 text-center">
              <Vote className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.25 0.02 240)" }} />
              <p className="text-sm" style={{ color: "oklch(0.45 0.02 240)" }}>No proposals yet. Be the first to submit one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map(proposal => {
                const statusCfg = STATUS_CONFIG[proposal.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                const StatusIcon = statusCfg.icon;
                const totalVotes = proposal.votesFor + proposal.votesAgainst;
                const forPct = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                const againstPct = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
                const voted = hasVoted(proposal.id);
                const categoryLabel = CATEGORY_LABELS[proposal.category] || proposal.category;

                return (
                  <div key={proposal.id} className="scn-card p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: `${statusCfg.color}1a`, color: statusCfg.color, border: `1px solid ${statusCfg.color}33` }}>
                            <StatusIcon className="w-3 h-3" />
                            {statusCfg.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: "oklch(0.16 0.02 240)", color: "oklch(0.55 0.02 240)" }}>
                            {categoryLabel}
                          </span>
                        </div>
                        <h3 className="font-bold text-base" style={{ color: "oklch(0.92 0.01 240)" }}>{proposal.title}</h3>
                        <p className="text-sm mt-1" style={{ color: "oklch(0.55 0.02 240)" }}>{proposal.description}</p>
                      </div>
                      {proposal.requestedAmount && parseFloat(proposal.requestedAmount) > 0 && (
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>Requesting</div>
                          <div className="font-bold mono" style={{ color: "oklch(0.82 0.18 85)" }}>
                            {parseFloat(proposal.requestedAmount).toLocaleString()} SCN
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: "oklch(0.72 0.18 145)" }}>For ({proposal.votesFor})</span>
                          <span style={{ color: "oklch(0.72 0.18 145)" }}>{forPct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.16 0.02 240)" }}>
                          <div className="h-full rounded-full" style={{ width: `${forPct}%`, background: "oklch(0.72 0.18 145)" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: "oklch(0.60 0.22 25)" }}>Against ({proposal.votesAgainst})</span>
                          <span style={{ color: "oklch(0.60 0.22 25)" }}>{againstPct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.16 0.02 240)" }}>
                          <div className="h-full rounded-full" style={{ width: `${againstPct}%`, background: "oklch(0.60 0.22 25)" }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs" style={{ color: "oklch(0.40 0.02 240)" }}>
                        Quorum: {totalVotes}/{proposal.quorumRequired} · Ends {new Date(proposal.votingEndsAt).toLocaleDateString()}
                      </div>
                      {isAuthenticated && proposal.status === "active" && !voted && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => vote.mutate({ proposalId: proposal.id, vote: "for" })} disabled={vote.isPending}
                            style={{ background: "oklch(0.72 0.18 145 / 0.15)", color: "oklch(0.72 0.18 145)", border: "1px solid oklch(0.72 0.18 145 / 0.4)", fontSize: "0.75rem" }}>
                            Vote For
                          </Button>
                          <Button size="sm" onClick={() => vote.mutate({ proposalId: proposal.id, vote: "against" })} disabled={vote.isPending}
                            style={{ background: "oklch(0.60 0.22 25 / 0.15)", color: "oklch(0.60 0.22 25)", border: "1px solid oklch(0.60 0.22 25 / 0.4)", fontSize: "0.75rem" }}>
                            Vote Against
                          </Button>
                        </div>
                      )}
                      {voted && (
                        <span className="text-xs flex items-center gap-1" style={{ color: "oklch(0.72 0.18 145)" }}>
                          <CheckCircle className="w-3 h-3" /> Voted
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── THRESHOLDS TAB ── */}
      {activeTab === "thresholds" && (
        <div className="space-y-4">
          <div className="scn-card p-6" style={{ border: "1px solid oklch(0.65 0.22 280 / 0.3)" }}>
            <div className="flex items-center gap-2 mb-1">
              {deploymentUnlocked
                ? <Unlock className="w-5 h-5" style={{ color: "oklch(0.72 0.18 145)" }} />
                : <Lock className="w-5 h-5" style={{ color: "oklch(0.82 0.18 85)" }} />
              }
              <h2 className="font-bold text-lg" style={{ color: "oklch(0.92 0.01 240)" }}>
                Reserve Deployment: {deploymentUnlocked ? "UNLOCKED" : "LOCKED"}
              </h2>
            </div>
            <p className="text-sm mb-5" style={{ color: "oklch(0.50 0.02 240)" }}>
              All four conditions below must be met simultaneously before the community can vote to deploy reserve funds.
              This prevents capture by any early actor, including the protocol's creators.
            </p>

            {/* Genesis Lock */}
            <div className="mb-5 p-4 rounded-xl" style={{ background: "oklch(0.13 0.02 240)", border: "1px solid oklch(0.22 0.02 240)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: "oklch(0.82 0.18 85)" }} />
                  <span className="font-semibold text-sm" style={{ color: "oklch(0.82 0.18 85)" }}>Genesis Lock (90 Days)</span>
                </div>
                <span className="text-xs mono font-bold" style={{ color: genesisLockPct >= 100 ? "oklch(0.72 0.18 145)" : "oklch(0.82 0.18 85)" }}>
                  {TESTNET_STATS.daysElapsed}/{GENESIS_LOCK_DAYS} days
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: "oklch(0.10 0.02 240)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${genesisLockPct}%`, background: "oklch(0.82 0.18 85)" }} />
              </div>
              <p className="text-xs" style={{ color: "oklch(0.40 0.02 240)" }}>
                Prevents any party from capturing the reserve before a genuine community forms.
              </p>
            </div>

            {/* Verification Tiers */}
            {[
              {
                tier: "Tier 1 — Collectors",
                icon: Star,
                color: "oklch(0.72 0.18 200)",
                current: TESTNET_STATS.tier1Verified,
                required: THRESHOLD_TIER1,
                pct: t1Pct,
                weight: "1 vote per verified card",
                how: "Owns at least one PUF-verified card on-chain",
              },
              {
                tier: "Tier 2 — Artists",
                icon: Palette,
                color: "oklch(0.65 0.22 280)",
                current: TESTNET_STATS.tier2Verified,
                required: THRESHOLD_TIER2,
                pct: t2Pct,
                weight: "3 votes per card created",
                how: "Verified card artwork creator (on-chain attestation)",
              },
              {
                tier: "Tier 3 — Athletes / Creators",
                icon: Trophy,
                color: "oklch(0.82 0.18 85)",
                current: TESTNET_STATS.tier3Verified,
                required: THRESHOLD_TIER3,
                pct: t3Pct,
                weight: "5 votes per NIL card",
                how: "Verified NIL participant — athlete or content creator",
              },
            ].map(item => {
              const Icon = item.icon;
              const met = item.pct >= 100;
              return (
                <div key={item.tier} className="mb-4 p-4 rounded-xl" style={{ background: "oklch(0.13 0.02 240)", border: `1px solid ${item.color}${met ? "66" : "22"}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                      <span className="font-semibold text-sm" style={{ color: item.color }}>{item.tier}</span>
                      {met && <CheckCircle className="w-3.5 h-3.5" style={{ color: "oklch(0.72 0.18 145)" }} />}
                    </div>
                    <span className="text-xs mono font-bold" style={{ color: met ? "oklch(0.72 0.18 145)" : item.color }}>
                      {item.current.toLocaleString()}/{item.required.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "oklch(0.10 0.02 240)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: "oklch(0.40 0.02 240)" }}>
                    <span>{item.how}</span>
                    <span style={{ color: item.color }}>{item.weight}</span>
                  </div>
                </div>
              );
            })}

            <div className="p-4 rounded-xl" style={{ background: "oklch(0.72 0.18 145 / 0.05)", border: "1px solid oklch(0.72 0.18 145 / 0.2)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4" style={{ color: "oklch(0.72 0.18 145)" }} />
                <span className="font-semibold text-sm" style={{ color: "oklch(0.72 0.18 145)" }}>Anti-Inflation Constitutional Rule</span>
              </div>
              <p className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>
                The maximum token supply is fixed at genesis. No vote — including a supermajority — can authorize new token minting.
                This rule is enforced at the protocol level, not the governance level. It cannot be changed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Vote, DollarSign, Target, CheckCircle, Clock, XCircle, Plus, Shield } from "lucide-react";

const STATUS_CONFIG = {
  active: { label: "Active", color: "oklch(0.72 0.18 200)", icon: Clock },
  passed: { label: "Passed", color: "oklch(0.72 0.18 145)", icon: CheckCircle },
  rejected: { label: "Rejected", color: "oklch(0.60 0.22 25)", icon: XCircle },
  pending: { label: "Pending", color: "oklch(0.82 0.18 85)", icon: Clock },
};

export default function DAOPage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: treasury } = trpc.dao.treasury.useQuery();
  const { data: proposals } = trpc.dao.proposals.useQuery();
  const { data: myVotes } = trpc.dao.myVotes.useQuery(undefined, { enabled: isAuthenticated });

  const [showNewProposal, setShowNewProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: "", description: "", requestedAmount: "", category: "licensing_bid" as "treasury_deployment" | "protocol_upgrade" | "licensing_bid" | "community_fund" | "rule_change" });

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
      toast.success("Proposal submitted for community vote!");
      setShowNewProposal(false);
      setNewProposal({ title: "", description: "", requestedAmount: "", category: "licensing_bid" });
      utils.dao.proposals.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const milestoneProgress = treasury
    ? (parseFloat(treasury.currentBalance) / parseFloat(treasury.targetMilestone || "1000000000")) * 100
    : 0;

  const hasVoted = (proposalId: number) => myVotes?.some(v => v.proposalId === proposalId);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>DAO Treasury & Governance</h1>
        <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)" }}>Community-governed fund deployment. Wyoming DUNA incorporated.</p>
      </div>

      {/* Treasury Overview */}
      {treasury && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="scn-card p-5" style={{ border: "1px solid oklch(0.82 0.18 85 / 0.3)" }}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4" style={{ color: "oklch(0.82 0.18 85)" }} />
              <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.18 85)" }}>TREASURY BALANCE</span>
            </div>
            <div className="text-3xl font-black mono" style={{ color: "oklch(0.82 0.18 85)" }}>
              ${parseFloat(treasury.currentBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="scn-card p-5" style={{ border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" style={{ color: "oklch(0.72 0.18 200)" }} />
              <span className="text-xs font-semibold" style={{ color: "oklch(0.72 0.18 200)" }}>TOTAL COLLECTED</span>
            </div>
              <div className="text-3xl font-black mono" style={{ color: "oklch(0.72 0.18 200)" }}>
              ${parseFloat(treasury.totalAccumulated).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="scn-card p-5" style={{ border: "1px solid oklch(0.65 0.22 280 / 0.3)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Vote className="w-4 h-4" style={{ color: "oklch(0.65 0.22 280)" }} />
              <span className="text-xs font-semibold" style={{ color: "oklch(0.65 0.22 280)" }}>TOTAL DEPLOYED</span>
            </div>
            <div className="text-3xl font-black mono" style={{ color: "oklch(0.65 0.22 280)" }}>
              ${parseFloat(treasury.totalDeployed).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Mission Progress */}
      {treasury && (
        <div className="scn-card p-6 mb-6" style={{ border: "1px solid oklch(0.82 0.18 85 / 0.3)" }}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs font-semibold mb-1" style={{ color: "oklch(0.82 0.18 85)" }}>CURRENT MISSION</div>
              <div className="font-bold text-lg" style={{ color: "oklch(0.95 0.01 240)" }}>{treasury.milestoneLabel}</div>
              <div className="text-xs mt-1" style={{ color: "oklch(0.50 0.02 240)" }}>
                Funds locked to this purpose until community vote after milestone reached
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>Target</div>
              <div className="font-bold mono" style={{ color: "oklch(0.82 0.18 85)" }}>
                ${parseFloat(treasury.targetMilestone || "0").toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
          <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "oklch(0.16 0.02 240)" }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(milestoneProgress, 100)}%`, background: "linear-gradient(90deg, oklch(0.82 0.18 85), oklch(0.72 0.18 200))" }} />
          </div>
          <div className="flex justify-between text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>
            <span>{milestoneProgress.toFixed(6)}% funded</span>
            <span>Voting unlocks at 100%</span>
          </div>

          {/* Legal Notice */}
          <div className="mt-4 p-3 rounded-lg flex items-start gap-2" style={{ background: "oklch(0.72 0.18 145 / 0.05)", border: "1px solid oklch(0.72 0.18 145 / 0.2)" }}>
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.72 0.18 145)" }} />
            <p className="text-xs" style={{ color: "oklch(0.55 0.02 240)" }}>
              Per Wyoming DUNA governance: treasury funds are restricted to the current milestone purpose until 100% is reached and a community vote achieves quorum. No individual member may direct funds unilaterally.
            </p>
          </div>
        </div>
      )}

      {/* Proposals */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl" style={{ color: "oklch(0.92 0.01 240)" }}>Governance Proposals</h2>
        {isAuthenticated && (
          <Button onClick={() => setShowNewProposal(true)} size="sm" className="gap-2" style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>
            <Plus className="w-4 h-4" />
            New Proposal
          </Button>
        )}
      </div>

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

            return (
              <div key={proposal.id} className="scn-card p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${statusCfg.color}1a`, color: statusCfg.color, border: `1px solid ${statusCfg.color}33` }}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "oklch(0.16 0.02 240)", color: "oklch(0.55 0.02 240)" }}>
                        {proposal.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-base" style={{ color: "oklch(0.92 0.01 240)" }}>{proposal.title}</h3>
                    <p className="text-sm mt-1" style={{ color: "oklch(0.55 0.02 240)" }}>{proposal.description}</p>
                  </div>
                  {proposal.requestedAmount && parseFloat(proposal.requestedAmount) > 0 && (
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>Requesting</div>
                      <div className="font-bold mono" style={{ color: "oklch(0.82 0.18 85)" }}>
                        ${parseFloat(proposal.requestedAmount).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Vote bars */}
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

                {/* Quorum */}
                <div className="flex items-center justify-between">
                  <div className="text-xs" style={{ color: "oklch(0.40 0.02 240)" }}>
                    Quorum: {totalVotes}/{proposal.quorumRequired} votes · Ends {new Date(proposal.votingEndsAt).toLocaleDateString()}
                  </div>
                  {isAuthenticated && proposal.status === "active" && !voted && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => vote.mutate({ proposalId: proposal.id, vote: "for" })} disabled={vote.isPending} style={{ background: "oklch(0.72 0.18 145 / 0.15)", color: "oklch(0.72 0.18 145)", border: "1px solid oklch(0.72 0.18 145 / 0.4)", fontSize: "0.75rem" }}>
                        Vote For
                      </Button>
                      <Button size="sm" onClick={() => vote.mutate({ proposalId: proposal.id, vote: "against" })} disabled={vote.isPending} style={{ background: "oklch(0.60 0.22 25 / 0.15)", color: "oklch(0.60 0.22 25)", border: "1px solid oklch(0.60 0.22 25 / 0.4)", fontSize: "0.75rem" }}>
                        Vote Against
                      </Button>
                    </div>
                  )}
                  {voted && (
                    <span className="text-xs flex items-center gap-1" style={{ color: "oklch(0.72 0.18 145)" }}>
                      <CheckCircle className="w-3.5 h-3.5" /> Voted
                    </span>
                  )}
                  {!isAuthenticated && proposal.status === "active" && (
                    <a href={getLoginUrl()}>
                      <Button size="sm" variant="outline" style={{ borderColor: "oklch(0.25 0.02 240)", color: "oklch(0.70 0.02 240)", fontSize: "0.75rem" }}>Sign In to Vote</Button>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Proposal Modal */}
      {showNewProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "oklch(0 0 0 / 0.7)" }}>
          <div className="w-full max-w-lg scn-card p-6" style={{ border: "1px solid oklch(0.65 0.22 280 / 0.3)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "oklch(0.95 0.01 240)" }}>Submit Governance Proposal</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold mb-1.5" style={{ color: "oklch(0.55 0.02 240)" }}>TITLE</div>
                <Input value={newProposal.title} onChange={e => setNewProposal(p => ({ ...p, title: e.target.value }))} placeholder="Proposal title..." style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)" }} />
              </div>
              <div>
                <div className="text-xs font-semibold mb-1.5" style={{ color: "oklch(0.55 0.02 240)" }}>DESCRIPTION</div>
                <textarea value={newProposal.description} onChange={e => setNewProposal(p => ({ ...p, description: e.target.value }))} placeholder="Detailed description..." rows={4} className="w-full rounded-lg px-3 py-2 text-sm resize-none" style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)", outline: "none" }} />
              </div>
              <div>
                <div className="text-xs font-semibold mb-1.5" style={{ color: "oklch(0.55 0.02 240)" }}>CATEGORY</div>
                <div className="grid grid-cols-3 gap-2">
                  {(["treasury_deployment", "protocol_upgrade", "licensing_bid", "community_fund", "rule_change"] as const).map(cat => (
                    <button key={cat} onClick={() => setNewProposal(p => ({ ...p, category: cat }))} className="p-2 rounded-lg text-xs font-medium transition-all capitalize" style={{
                      background: newProposal.category === cat ? "oklch(0.65 0.22 280 / 0.15)" : "oklch(0.10 0.01 240)",
                      border: `1px solid ${newProposal.category === cat ? "oklch(0.65 0.22 280 / 0.5)" : "oklch(0.22 0.02 240)"}`,
                      color: newProposal.category === cat ? "oklch(0.65 0.22 280)" : "oklch(0.55 0.02 240)",
                    }}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1.5" style={{ color: "oklch(0.55 0.02 240)" }}>REQUESTED AMOUNT (USD, optional)</div>
                <Input type="number" value={newProposal.requestedAmount} onChange={e => setNewProposal(p => ({ ...p, requestedAmount: e.target.value }))} placeholder="0.00" style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)" }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowNewProposal(false)} className="flex-1" style={{ borderColor: "oklch(0.25 0.02 240)", color: "oklch(0.70 0.02 240)" }}>Cancel</Button>
              <Button
                onClick={() => createProposal.mutate({ title: newProposal.title, description: newProposal.description, category: newProposal.category, requestedAmount: newProposal.requestedAmount || undefined })}
                disabled={!newProposal.title || !newProposal.description || createProposal.isPending}
                className="flex-1"
                style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 280), oklch(0.72 0.18 200))", color: "white", border: "none" }}
              >
                {createProposal.isPending ? "Submitting..." : "Submit Proposal"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

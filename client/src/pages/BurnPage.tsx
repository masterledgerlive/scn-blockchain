import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Flame, Scissors, Shield, TrendingUp, AlertTriangle, Clock, Users, Coins, ChevronRight, Lock, Unlock } from "lucide-react";
import { Link } from "wouter";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSCN(val: string | number | null | undefined): string {
  const n = parseFloat(String(val ?? "0"));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

function poolProgress(contributed: string, threshold: string): number {
  const c = parseFloat(contributed);
  const t = parseFloat(threshold);
  if (t === 0) return 0;
  return Math.min(100, (c / t) * 100);
}

function statusColor(status: string) {
  switch (status) {
    case "open": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "threshold_met": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "claimed": return "bg-red-500/20 text-red-300 border-red-500/30";
    case "expired": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

// ─── Burn Pool Card Component ─────────────────────────────────────────────────

function BurnPoolCard({ pool, onContribute }: {
  pool: {
    id: number;
    poolId: string;
    cardId: number;
    cardTokenId: string;
    status: string;
    totalContributed: string;
    thresholdAmount: string;
    cardMarketValue: string | null;
    contributorCount: number;
    expiresAt: Date | null;
  };
  onContribute: (poolId: number, cardTokenId: string) => void;
}) {
  const progress = poolProgress(pool.totalContributed, pool.thresholdAmount);
  const daysLeft = pool.expiresAt
    ? Math.max(0, Math.ceil((new Date(pool.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5 hover:border-red-500/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-gray-500">{pool.cardTokenId}</span>
            <Badge className={`text-xs border ${statusColor(pool.status)}`}>
              {pool.status === "threshold_met" ? "🔥 THRESHOLD MET" : pool.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-gray-400">Card #{pool.cardId}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Market Value</p>
          <p className="text-white font-semibold">{formatSCN(pool.cardMarketValue)} SCN</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Pool Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-[#1a1a1a]" />
        <div className="flex justify-between text-xs mt-1.5">
          <span className="text-amber-400 font-mono">{formatSCN(pool.totalContributed)} SCN</span>
          <span className="text-gray-500">/ {formatSCN(pool.thresholdAmount)} SCN threshold</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {pool.contributorCount} contributors
          </span>
          {daysLeft !== null && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysLeft}d left
            </span>
          )}
        </div>
        {pool.status === "open" || pool.status === "threshold_met" ? (
          <Button
            size="sm"
            onClick={() => onContribute(pool.id, pool.cardTokenId)}
            className="bg-amber-600 hover:bg-amber-500 text-black text-xs h-7 px-3"
          >
            <Coins className="w-3 h-3 mr-1" />
            Contribute
          </Button>
        ) : (
          <Badge className="text-xs bg-gray-800 text-gray-500">Closed</Badge>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BurnPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("pools");

  // Burn execution state
  const [burnCardId, setBurnCardId] = useState<number | null>(null);
  const [tearCodeInput, setTearCodeInput] = useState("");
  const [revealedTearCode, setRevealedTearCode] = useState<string | null>(null);
  const [showBurnConfirm, setShowBurnConfirm] = useState(false);
  const [burnResult, setBurnResult] = useState<{
    burnId: string; txHash: string; poolAmountClaimed: string;
    dividendPerCard: string; seriesBefore: number; seriesAfter: number; message: string;
  } | null>(null);

  // Pool contribution state
  const [contributePoolId, setContributePoolId] = useState<number | null>(null);
  const [contributeCardToken, setContributeCardToken] = useState("");
  const [contributeAmount, setContributeAmount] = useState("100");
  const [showContributeDialog, setShowContributeDialog] = useState(false);

  // Create pool state
  const [createPoolCardId, setCreatePoolCardId] = useState("");
  const [thresholdMultiplier, setThresholdMultiplier] = useState("1.5");

  // Queries
  const { data: pools, refetch: refetchPools } = trpc.burn.pools.useQuery(undefined, { refetchInterval: 15000 });
  const { data: recentBurns } = trpc.burn.recentBurns.useQuery(undefined, { refetchInterval: 15000 });
  const { data: myCards } = trpc.cards.list.useQuery(undefined, { enabled: isAuthenticated });

  // Mutations
  const revealTearCode = trpc.burn.revealTearCode.useMutation({
    onSuccess: (data) => {
      setRevealedTearCode(data.tearCode);
      toast.success(`Tear code revealed for ${data.athleteName}. Tear the physical card now.`);
    },
    onError: (e) => toast.error(e.message),
  });

  const executeBurnMutation = trpc.burn.executeBurn.useMutation({
    onSuccess: (data) => {
      setBurnResult(data);
      setShowBurnConfirm(false);
      refetchPools();
      toast.success("Card successfully burned and verified on-chain!");
    },
    onError: (e) => toast.error(e.message),
  });

  const contributeMutation = trpc.burn.contribute.useMutation({
    onSuccess: (data) => {
      setShowContributeDialog(false);
      refetchPools();
      toast.success(`Successfully contributed ${data.amount} SCN to the burn pool!`);
    },
    onError: (e) => toast.error(e.message),
  });

  const createPoolMutation = trpc.burn.createPool.useMutation({
    onSuccess: () => {
      refetchPools();
      setCreatePoolCardId("");
      toast.success("Burn pool created! Community can now contribute.");
    },
    onError: (e) => toast.error(e.message),
  });

  const backfillMutation = trpc.burn.backfillTearCodes.useMutation({
    onSuccess: (data) => toast.success(data.message),
    onError: (e) => toast.error(e.message),
  });

  const handleContribute = (poolId: number, cardTokenId: string) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    setContributePoolId(poolId);
    setContributeCardToken(cardTokenId);
    setShowContributeDialog(true);
  };

  const handleReveal = (cardId: number) => {
    setBurnCardId(cardId);
    revealTearCode.mutate({ cardId });
  };

  const handleExecuteBurn = () => {
    if (!burnCardId || !tearCodeInput) return;
    executeBurnMutation.mutate({ cardId: burnCardId, tearCode: tearCodeInput, confirmDestruction: true });
  };

  const unburned = (myCards ?? []).filter((c: { isBurned: boolean }) => !c.isBurned);

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-[#1a1a1a]">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/30 via-transparent to-orange-950/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Burn Mechanism</h1>
              <p className="text-sm text-gray-500">Physical card destruction with on-chain verification</p>
            </div>
          </div>

          {/* Legal notice */}
          <div className="bg-amber-950/30 border border-amber-500/20 rounded-lg p-4 max-w-3xl">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-200/80 leading-relaxed">
                <strong className="text-amber-300">Legal Notice:</strong> The SCN Burn Mechanism is a voluntary buyback escrow system. Contributing to a burn pool is a conditional offer to the card owner, not a lottery or investment. Burning a card is an irreversible action. All burn events are permanently recorded on-chain. This mechanism is published as prior art (April 5, 2026) and is free for all to use under MIT license.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Pools", value: pools?.filter(p => p.status === "open" || p.status === "threshold_met").length ?? 0, icon: <Flame className="w-4 h-4 text-red-400" />, color: "text-red-400" },
            { label: "Total Burned", value: recentBurns?.length ?? 0, icon: <Scissors className="w-4 h-4 text-orange-400" />, color: "text-orange-400" },
            { label: "SCN in Pools", value: formatSCN(pools?.reduce((s, p) => s + parseFloat(p.totalContributed), 0) ?? 0) + " SCN", icon: <Coins className="w-4 h-4 text-amber-400" />, color: "text-amber-400" },
            { label: "Threshold Met", value: pools?.filter(p => p.status === "threshold_met").length ?? 0, icon: <TrendingUp className="w-4 h-4 text-green-400" />, color: "text-green-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-xs text-gray-500">{stat.label}</span></div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0d0d0d] border border-[#1a1a1a] mb-6">
            <TabsTrigger value="pools" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Burn Pools</TabsTrigger>
            <TabsTrigger value="burn" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Burn My Card</TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Create Pool</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Burn History</TabsTrigger>
          </TabsList>

          {/* ── Burn Pools Tab ─────────────────────────────────────────────── */}
          <TabsContent value="pools">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Active Burn Pools</h2>
              <p className="text-xs text-gray-500">Community-funded buyback escrows for specific cards</p>
            </div>
            {!pools || pools.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <Flame className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No active burn pools yet.</p>
                <p className="text-sm mt-1">Create the first pool to incentivize a card burn.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pools.map((pool) => (
                  <BurnPoolCard key={pool.id} pool={pool} onContribute={handleContribute} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Burn My Card Tab ───────────────────────────────────────────── */}
          <TabsContent value="burn">
            {!isAuthenticated ? (
              <div className="text-center py-16">
                <Lock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">Connect your wallet to burn cards</p>
                <Button onClick={() => window.location.href = getLoginUrl()} className="bg-red-600 hover:bg-red-500">Connect Wallet</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Step 1: Select card and reveal tear code */}
                <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
                  <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-xs flex items-center justify-center font-bold">1</span>
                    Reveal Tear Code
                  </h3>
                  <p className="text-xs text-gray-500 mb-5 ml-8">Select a card you own to reveal its physical security strip code. This is the code printed on the tear strip inside your card.</p>

                  {unburned.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <p className="text-sm">No unburned cards in your collection.</p>
                      <Link href="/mint" className="text-xs text-red-400 hover:text-red-300 mt-2 block">Mint a card first →</Link>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {(unburned ?? []).map((card: { id: number; athleteName: string; tokenId: string; edition: string; tearCode?: string | null; isBurned: boolean }) => (
                        <div
                          key={card.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${burnCardId === card.id ? "border-red-500/50 bg-red-950/20" : "border-[#1a1a1a] hover:border-red-500/20"}`}
                          onClick={() => setBurnCardId(card.id)}
                        >
                          <div>
                            <p className="text-sm font-medium text-white">{card.athleteName}</p>
                            <p className="text-xs text-gray-500 font-mono">{card.tokenId}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs bg-[#1a1a1a] text-gray-400">{card.edition}</Badge>
                            {card.tearCode ? (
                              <Unlock className="w-4 h-4 text-green-400" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {burnCardId && (
                    <div className="mt-4">
                      {revealedTearCode ? (
                        <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4">
                          <p className="text-xs text-red-400 mb-2 font-semibold">TEAR CODE REVEALED</p>
                          <p className="font-mono text-lg text-white tracking-widest text-center py-2">{revealedTearCode}</p>
                          <p className="text-xs text-gray-500 text-center mt-1">Physically tear your card now, then enter this code below to confirm destruction.</p>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleReveal(burnCardId)}
                          disabled={revealTearCode.isPending}
                          className="w-full bg-amber-600 hover:bg-amber-500 text-black"
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          {revealTearCode.isPending ? "Revealing..." : "Reveal Tear Code"}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 2: Submit tear code to execute burn */}
                <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
                  <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-xs flex items-center justify-center font-bold">2</span>
                    Execute Burn
                  </h3>
                  <p className="text-xs text-gray-500 mb-5 ml-8">After physically tearing your card, enter the tear code to verify destruction on-chain. This action is permanent and irreversible.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Tear Code from Physical Card</label>
                      <Input
                        value={tearCodeInput}
                        onChange={(e) => setTearCodeInput(e.target.value.toUpperCase())}
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        className="bg-[#0a0a0a] border-[#2a2a2a] text-white font-mono tracking-widest"
                        maxLength={19}
                      />
                    </div>

                    <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-300/80">
                          Burning a card is <strong className="text-red-300">permanent and irreversible</strong>. The physical card must be torn before submitting. Once confirmed on-chain, the card cannot be recovered.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowBurnConfirm(true)}
                      disabled={!burnCardId || !tearCodeInput || tearCodeInput.replace(/-/g, "").length < 16 || executeBurnMutation.isPending}
                      className="w-full bg-red-700 hover:bg-red-600 text-white"
                    >
                      <Flame className="w-4 h-4 mr-2" />
                      {executeBurnMutation.isPending ? "Burning..." : "Verify & Burn Card"}
                    </Button>
                  </div>

                  {/* Burn Result */}
                  {burnResult && (
                    <div className="mt-4 bg-green-950/20 border border-green-500/20 rounded-lg p-4">
                      <p className="text-green-400 font-semibold text-sm mb-2">✓ Burn Verified On-Chain</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-gray-500">Burn ID</span><span className="font-mono text-white">{burnResult.burnId}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Pool Claimed</span><span className="text-amber-400">{formatSCN(burnResult.poolAmountClaimed)} SCN</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Scarcity Dividend</span><span className="text-green-400">{formatSCN(burnResult.dividendPerCard)} SCN/card</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Series</span><span className="text-white">{burnResult.seriesBefore} → {burnResult.seriesAfter} remaining</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Create Pool Tab ────────────────────────────────────────────── */}
          <TabsContent value="create">
            {!isAuthenticated ? (
              <div className="text-center py-16">
                <Lock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">Connect your wallet to create a burn pool</p>
                <Button onClick={() => window.location.href = getLoginUrl()} className="bg-red-600 hover:bg-red-500">Connect Wallet</Button>
              </div>
            ) : (
              <div className="max-w-lg">
                <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
                  <h3 className="font-semibold text-white mb-1">Create a Burn Pool</h3>
                  <p className="text-xs text-gray-500 mb-6">Set a buyback escrow for any card. Community members contribute SCN tokens to incentivize the card owner to destroy their card, making all remaining cards in the series more valuable.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Card ID</label>
                      <Input
                        value={createPoolCardId}
                        onChange={(e) => setCreatePoolCardId(e.target.value)}
                        placeholder="Enter card ID number"
                        className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                        type="number"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">
                        Threshold Multiplier: <span className="text-amber-400">{thresholdMultiplier}x market value</span>
                      </label>
                      <input
                        type="range" min="1.1" max="5" step="0.1"
                        value={thresholdMultiplier}
                        onChange={(e) => setThresholdMultiplier(e.target.value)}
                        className="w-full accent-red-500"
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>1.1x (low incentive)</span>
                        <span>5x (high incentive)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        The pool must reach <span className="text-amber-400">{thresholdMultiplier}x the card's market value</span> before the card owner can claim it. Higher multiplier = stronger incentive to burn.
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        if (!createPoolCardId) return;
                        createPoolMutation.mutate({
                          cardId: parseInt(createPoolCardId),
                          thresholdMultiplier: parseFloat(thresholdMultiplier),
                          daysUntilExpiry: 30,
                        });
                      }}
                      disabled={!createPoolCardId || createPoolMutation.isPending}
                      className="w-full bg-red-700 hover:bg-red-600"
                    >
                      <Flame className="w-4 h-4 mr-2" />
                      {createPoolMutation.isPending ? "Creating..." : "Create Burn Pool"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => backfillMutation.mutate()}
                      disabled={backfillMutation.isPending}
                      className="w-full border-[#2a2a2a] text-gray-400 hover:text-white text-xs"
                    >
                      {backfillMutation.isPending ? "Assigning..." : "Assign Tear Codes to All Cards (Admin)"}
                    </Button>
                  </div>
                </div>

                {/* How it works */}
                <div className="mt-6 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4">How the Burn Pool Works</h4>
                  <div className="space-y-3">
                    {[
                      { step: "1", title: "Community Creates Pool", desc: "Anyone creates a burn pool for a specific card, setting a threshold above market value." },
                      { step: "2", title: "Contributors Fund Pool", desc: "Community members contribute SCN tokens to the escrow, incentivizing the card owner to burn." },
                      { step: "3", title: "Card Owner Decides", desc: "The card owner can tear their card and submit the Tear Code to claim the pool value." },
                      { step: "4", title: "Scarcity Dividend", desc: "10% of the pool is distributed proportionally to all remaining holders in the same series." },
                      { step: "5", title: "On-Chain Verification", desc: "The burn is permanently recorded on-chain. The series count updates automatically." },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-red-900/50 text-red-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{item.step}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Burn History Tab ───────────────────────────────────────────── */}
          <TabsContent value="history">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Burn Events</h2>
            {!recentBurns || recentBurns.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <Scissors className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No cards have been burned yet.</p>
                <p className="text-sm mt-1">The first burn will be recorded here permanently.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBurns.map((burn) => (
                  <div key={burn.id} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-900/30 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white font-mono">{burn.cardTokenId}</p>
                        <p className="text-xs text-gray-500 font-mono">{burn.txHash.substring(0, 20)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-amber-400 font-semibold">{formatSCN(burn.poolAmountClaimed)} SCN claimed</p>
                      <p className="text-xs text-gray-500">
                        {burn.seriesBeforeBurn !== null && burn.seriesAfterBurn !== null
                          ? `${burn.seriesBeforeBurn} → ${burn.seriesAfterBurn} in series`
                          : new Date(burn.burnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Contribute Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent className="bg-[#0d0d0d] border-[#2a2a2a] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Contribute to Burn Pool</DialogTitle>
            <DialogDescription className="text-gray-400">
              You are contributing SCN tokens to the burn pool for <span className="font-mono text-amber-400">{contributeCardToken}</span>. This is a voluntary buyback escrow — not a lottery or investment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Amount (SCN)</label>
              <Input
                value={contributeAmount}
                onChange={(e) => setContributeAmount(e.target.value)}
                type="number"
                min="1"
                className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
              />
            </div>
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3 text-xs text-amber-200/80">
              Your contribution is held in escrow. If the card is burned, you help fund the buyback. If the pool expires without a burn, your contribution can be refunded.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContributeDialog(false)} className="border-[#2a2a2a] text-gray-400">Cancel</Button>
            <Button
              onClick={() => {
                if (!contributePoolId) return;
                contributeMutation.mutate({ poolId: contributePoolId, amount: parseFloat(contributeAmount) });
              }}
              disabled={contributeMutation.isPending || !contributeAmount}
              className="bg-amber-600 hover:bg-amber-500 text-black"
            >
              {contributeMutation.isPending ? "Contributing..." : `Contribute ${contributeAmount} SCN`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Burn Confirmation Dialog */}
      <Dialog open={showBurnConfirm} onOpenChange={setShowBurnConfirm}>
        <DialogContent className="bg-[#0d0d0d] border-red-900/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <Flame className="w-5 h-5" />
              Confirm Permanent Destruction
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action is <strong className="text-red-400">permanent and irreversible</strong>. By confirming, you certify that you have physically torn the card and the tear code matches.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="bg-red-950/30 border border-red-900/30 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Card ID</span><span className="text-white">#{burnCardId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tear Code</span><span className="font-mono text-amber-400">{tearCodeInput}</span></div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-red-900/20">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-xs">The physical card will be permanently destroyed. This cannot be undone.</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBurnConfirm(false)} className="border-[#2a2a2a] text-gray-400">Cancel</Button>
            <Button
              onClick={handleExecuteBurn}
              disabled={executeBurnMutation.isPending}
              className="bg-red-700 hover:bg-red-600"
            >
              <Flame className="w-4 h-4 mr-2" />
              {executeBurnMutation.isPending ? "Burning..." : "Confirm Burn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Bot, Search, ShoppingCart, Shield, TrendingUp, Activity,
  Zap, AlertTriangle, CheckCircle, Clock, Eye, DollarSign,
  RefreshCw, Play, Pause, Settings
} from "lucide-react";

import React from "react";
const BOT_ICONS: Record<string, React.ReactElement> = {
  search: <Search className="w-5 h-5" />,
  purchase: <ShoppingCart className="w-5 h-5" />,
  arbitrage: <TrendingUp className="w-5 h-5" />,
  safety: <Shield className="w-5 h-5" />,
  market_maker: <Activity className="w-5 h-5" />,
};

const BOT_COLORS: Record<string, string> = {
  search: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  purchase: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  arbitrage: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  safety: "text-red-400 bg-red-400/10 border-red-400/30",
  market_maker: "text-purple-400 bg-purple-400/10 border-purple-400/30",
};

type SearchResult = {
  id: number;
  listingId: string;
  askPrice: string;
  assetType: string;
  asset: Record<string, unknown> | null;
};

export default function BotDashboard() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [edition, setEdition] = useState<"any" | "base" | "rare" | "ultra_rare" | "legendary" | "1_of_1">("any");
  const [safetyGuard, setSafetyGuard] = useState(true);
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [pendingPurchase, setPendingPurchase] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: botStatus, refetch: refetchStatus } = trpc.bots.status.useQuery();

  const searchMutation = trpc.bots.search.useMutation({
    onSuccess: (data) => {
      setSearchResults(data.results as SearchResult[]);
      setAiSummary(data.aiSummary);
      setIsSearching(false);
      toast.success(`SearchBot found ${data.results.length} matches across ${data.totalScanned} listings`);
    },
    onError: (e) => {
      setIsSearching(false);
      toast.error(e.message);
    },
  });

  const purchaseMutation = trpc.bots.purchase.useMutation({
    onSuccess: (data) => {
      if (data.requiresAction) {
        setPendingPurchase(data.listingId || null);
        toast.warning("Safety guard active — confirm purchase below", { duration: 6000 });
      } else {
        toast.success(`Purchase complete! TX: ${data.txHash?.substring(0, 16)}...`);
        setPendingPurchase(null);
        setSearchResults([]);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const approveMutation = trpc.bots.approvePurchase.useMutation({
    onSuccess: (data) => {
      toast.success(`Purchase approved & confirmed! TX: ${data.txHash.substring(0, 16)}...`);
      setPendingPurchase(null);
      setSearchResults([]);
      refetchStatus();
    },
    onError: (e) => toast.error(e.message),
  });

  const faucetMutation = trpc.testnet.faucet.useMutation({
    onSuccess: (data) => toast.success(data.message),
    onError: (e) => toast.error(e.message),
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) { toast.error("Enter a search query"); return; }
    setIsSearching(true);
    setSearchResults([]);
    setAiSummary("");
    searchMutation.mutate({ query: searchQuery, maxPrice: maxPrice || undefined, edition, safetyGuard });
  };

  const handleBotBuy = (listingId: string) => {
    if (!isAuthenticated) { toast.error("Login required"); return; }
    purchaseMutation.mutate({ listingId, safetyGuard, requireConfirmation });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Testnet Banner */}
      <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
        <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-yellow-400 font-bold text-sm">SCN-TESTNET-1</span>
          <span className="text-yellow-200/70 text-sm ml-2">All transactions use test SCN (tSCN). No real value. Battle-test mode active.</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 text-xs"
          onClick={() => faucetMutation.mutate({ amount: 100 })}
          disabled={!isAuthenticated || faucetMutation.isPending}
        >
          {faucetMutation.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
          <span className="ml-1">Get 100 tSCN</span>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Bot Dashboard</h1>
            <p className="text-white/50 text-sm">Agentic trading bots with safety guards — search, evaluate, and purchase cards autonomously</p>
          </div>
        </div>
      </div>

      {/* Bot Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {botStatus?.activeBots.map((bot) => (
          <Card key={bot.id} className="bg-[#111118] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border text-xs font-medium ${BOT_COLORS[bot.type] || "text-white/60 bg-white/5 border-white/10"}`}>
                  {BOT_ICONS[bot.type]}
                  <span>{bot.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400">LIVE</span>
                </div>
              </div>
              <p className="text-white/50 text-xs mb-3 leading-relaxed">{bot.lastAction}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/40 mb-0.5">Tasks Done</div>
                  <div className="text-white font-bold">{bot.tasksCompleted.toLocaleString()}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/40 mb-0.5">Budget Used</div>
                  <div className="text-white font-bold">{bot.spent} / {bot.budget}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Shield className="w-3 h-3 text-white/40" />
                <span className="text-xs text-white/40">Safety Mode:</span>
                <span className={`text-xs font-medium ${bot.safetyMode ? "text-emerald-400" : "text-red-400"}`}>
                  {bot.safetyMode ? "ON" : "OFF"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Network Summary Card */}
        <Card className="bg-[#111118] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">Network Summary</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Listings Monitored</span>
                <span className="text-white font-medium">{botStatus?.totalListingsMonitored || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Cards on Chain</span>
                <span className="text-white font-medium">{botStatus?.networkCards || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Pending Approvals</span>
                <span className="text-yellow-400 font-medium">{botStatus?.pendingApprovals || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Search Agent */}
      <Card className="bg-[#111118] border-white/10 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5 text-cyan-400" />
            <span>AI SearchBot — Find Cards</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search athlete, sport, edition... (e.g. LeBron legendary)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <Input
              placeholder="Max price (tSCN)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            <Select value={edition} onValueChange={(v) => setEdition(v as typeof edition)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Edition" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a24] border-white/10">
                {["any", "base", "rare", "ultra_rare", "legendary", "1_of_1"].map(e => (
                  <SelectItem key={e} value={e} className="text-white">{e.replace("_", " ").toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Safety Controls */}
          <div className="flex flex-wrap items-center gap-6 mb-4 p-3 bg-white/3 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white/70">Safety Guard</span>
              <Switch checked={safetyGuard} onCheckedChange={setSafetyGuard} />
              <span className={`text-xs font-medium ${safetyGuard ? "text-emerald-400" : "text-red-400"}`}>
                {safetyGuard ? "ON — PUF + price checks active" : "OFF — Bot buys autonomously"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white/70">Require Confirmation</span>
              <Switch checked={requireConfirmation} onCheckedChange={setRequireConfirmation} />
              <span className={`text-xs font-medium ${requireConfirmation ? "text-yellow-400" : "text-white/40"}`}>
                {requireConfirmation ? "ON — Ask me before buying" : "OFF — Auto-purchase"}
              </span>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
            {isSearching ? "SearchBot scanning..." : "Run AI Search"}
          </Button>

          {/* AI Summary */}
          {aiSummary && (
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400">SearchBot Analysis</span>
              </div>
              <p className="text-sm text-white/80">{aiSummary}</p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Bot Recommendations ({searchResults.length})</h3>
              {searchResults.map((listing) => {
                const asset = listing.asset as Record<string, unknown> | null;
                return (
                  <div key={listing.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {asset ? String(asset.athleteName || "Unknown") : "Unknown Asset"}
                        </span>
                        {asset && asset.edition != null && (
                          <Badge variant="outline" className="text-xs border-cyan-500/40 text-cyan-400">
                            {String(asset.edition as string).replace("_", " ")}
                          </Badge>
                        )}
                        {asset?.verificationStatus === "verified" && (
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-xs text-white/40">
                        {asset ? `${String(asset.sport || "")} • ${String(asset.cardYear || "")} • ${String(asset.series || "")}` : listing.assetType}
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <div className="text-lg font-bold text-emerald-400">{parseFloat(listing.askPrice).toFixed(2)}</div>
                      <div className="text-xs text-white/40">tSCN</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleBotBuy(listing.listingId)}
                      disabled={!isAuthenticated || purchaseMutation.isPending}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      {requireConfirmation ? "Queue Buy" : "Auto Buy"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approval */}
      {pendingPurchase && (
        <Card className="bg-yellow-500/10 border-yellow-500/30 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-400 mb-1">Safety Guard — Purchase Pending Your Approval</h3>
                <p className="text-sm text-yellow-200/70 mb-3">
                  The PurchaseBot has queued a buy order for listing <span className="font-mono text-yellow-300">{pendingPurchase}</span>.
                  Review and confirm to execute, or cancel to abort.
                </p>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate({ listingId: pendingPurchase })}
                    disabled={approveMutation.isPending}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {approveMutation.isPending ? "Processing..." : "Approve Purchase"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPendingPurchase(null)}
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bot Activity Log */}
      <Card className="bg-[#111118] border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4 text-white/40" />
            <span>Recent Bot Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { time: "2m ago", bot: "SafeGuard", action: "Blocked listing LST-X7K2 — PUF hash mismatch detected", type: "warning" },
              { time: "5m ago", bot: "PurchaseBot", action: "Purchased 1x Caitlin Clark Rare for 47.20 tSCN", type: "success" },
              { time: "8m ago", bot: "SearchBot", action: "Scanned 20 new listings — 3 matches for active watchlists", type: "info" },
              { time: "12m ago", bot: "ArbitrageBot", action: "Identified price gap: LeBron base at 8.5 tSCN vs floor 12.0 tSCN", type: "success" },
              { time: "15m ago", bot: "MarketMaker", action: "Updated floor price: base edition 2.5 → 3.1 tSCN (+24%)", type: "info" },
              { time: "22m ago", bot: "SafeGuard", action: "Flagged wallet 0xSCN3F2A for rapid re-listing pattern", type: "warning" },
              { time: "31m ago", bot: "PurchaseBot", action: "Waiting for user approval: Patrick Mahomes Legendary 890 tSCN", type: "pending" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                <span className="text-xs text-white/30 w-12 flex-shrink-0 mt-0.5">{log.time}</span>
                <span className={`text-xs font-medium w-20 flex-shrink-0 ${
                  log.type === "warning" ? "text-yellow-400" :
                  log.type === "success" ? "text-emerald-400" :
                  log.type === "pending" ? "text-orange-400" : "text-cyan-400"
                }`}>{log.bot}</span>
                <span className="text-xs text-white/60">{log.action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

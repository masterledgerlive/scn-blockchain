import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Activity, Layers, Package, ArrowRight, TrendingUp, Zap, Search, Copy, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const TX_TYPE_COLORS: Record<string, string> = {
  mint: "oklch(0.72 0.18 145)",
  transfer: "oklch(0.72 0.18 200)",
  sale: "oklch(0.82 0.18 85)",
  verification: "oklch(0.65 0.22 280)",
  slab_seal: "oklch(0.60 0.22 25)",
  vote: "oklch(0.55 0.02 240)",
  burn: "oklch(0.60 0.22 25)",
  burn_contribute: "oklch(0.65 0.20 30)",
  slab_create: "oklch(0.60 0.22 25)",
  wallet_create: "oklch(0.72 0.18 145)",
};

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats } = trpc.explorer.networkStats.useQuery();
  const { data: transactions, isLoading } = trpc.explorer.transactions.useQuery({ limit: 50 });
  const { data: allCards } = trpc.cards.list.useQuery();
  const recentCards = allCards?.slice(0, 8);

  const filteredTxs = transactions?.filter(tx =>
    !searchQuery ||
    tx.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.txType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.fromAddress ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    ((tx.toAddress ?? "") as string).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>SCN Explorer</h1>
        <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)" }}>Real-time view of all network activity on the SCN Layer 1 blockchain.</p>
      </div>

      {/* Network Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Cards", value: stats.totalCards?.toLocaleString() ?? "0", color: "oklch(0.72 0.18 200)", icon: Layers },
            { label: "Smart Slabs", value: stats.totalSlabs?.toLocaleString() ?? "0", color: "oklch(0.65 0.22 280)", icon: Package },
            { label: "Transactions", value: stats.totalTransactions?.toLocaleString() ?? "0", color: "oklch(0.82 0.18 85)", icon: Activity },
            { label: "Wallets", value: stats.totalWallets?.toLocaleString() ?? "0", color: "oklch(0.72 0.18 145)", icon: Zap },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="scn-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-xs font-semibold" style={{ color }}>{label.toUpperCase()}</span>
              </div>
              <div className="text-3xl font-black mono" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-bold text-xl" style={{ color: "oklch(0.92 0.01 240)" }}>Latest Transactions</h2>
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.45 0.02 240)" }} />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search hash, type..."
                className="pl-8 h-8 text-xs"
                style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)" }}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "oklch(0.11 0.015 240)" }} />)}
            </div>
          ) : !filteredTxs || filteredTxs.length === 0 ? (
            <div className="scn-card p-12 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.25 0.02 240)" }} />
              <p className="text-sm" style={{ color: "oklch(0.45 0.02 240)" }}>No transactions found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTxs.map(tx => {
                const txColor = TX_TYPE_COLORS[tx.txType] || "oklch(0.55 0.02 240)";
                return (
                  <div key={tx.id} className="scn-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${txColor}1a`, border: `1px solid ${txColor}33` }}>
                        <Activity className="w-4 h-4" style={{ color: txColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${txColor}1a`, color: txColor, border: `1px solid ${txColor}33` }}>
                            {tx.txType.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="text-xs mono" style={{ color: "oklch(0.40 0.02 240)" }}>Block #{tx.blockNumber.toLocaleString()}</span>
                        </div>
                        <button
                          className="flex items-center gap-1 group"
                          onClick={() => { navigator.clipboard.writeText(tx.txHash); }}
                          title="Copy tx hash"
                        >
                          <code className="text-xs mono group-hover:text-white transition-colors" style={{ color: "oklch(0.50 0.02 240)" }}>{tx.txHash.substring(0, 28)}...</code>
                          <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "oklch(0.55 0.02 240)" }} />
                        </button>
                        {(tx.fromAddress || tx.toAddress) && (
                          <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: "oklch(0.40 0.02 240)" }}>
                            {tx.fromAddress && <span className="mono truncate max-w-24">{tx.fromAddress.substring(0, 12)}...</span>}
                            {tx.fromAddress && tx.toAddress && <ArrowRight className="w-3 h-3 flex-shrink-0" />}
                            {tx.toAddress && <span className="mono truncate max-w-24">{tx.toAddress.substring(0, 12)}...</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {parseFloat(tx.value || "0") > 0 && (
                          <div className="text-sm font-bold mono" style={{ color: "oklch(0.82 0.18 85)" }}>
                            ${parseFloat(tx.value ?? "0").toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs" style={{ color: "oklch(0.35 0.02 240)" }}>
                          {new Date(tx.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Cards */}
        <div>
          <h2 className="font-bold text-xl mb-4" style={{ color: "oklch(0.92 0.01 240)" }}>Recently Minted</h2>
          {!recentCards || recentCards.length === 0 ? (
            <div className="scn-card p-8 text-center">
              <Layers className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.25 0.02 240)" }} />
              <p className="text-sm" style={{ color: "oklch(0.45 0.02 240)" }}>No cards minted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCards.map((card: { id: number; athleteName: string; sport: string; cardYear: number; edition: string; tokenId: string }) => {
                const ECOLORS: Record<string, string> = { base: "oklch(0.55 0.02 240)", rare: "oklch(0.72 0.18 200)", ultra_rare: "oklch(0.65 0.22 280)", legendary: "oklch(0.82 0.18 85)", "1_of_1": "oklch(0.60 0.22 25)" };
                const edColor = ECOLORS[card.edition] || "oklch(0.55 0.02 240)";

                return (
                  <div key={card.id} className="scn-card scn-card-hover p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg holographic flex items-center justify-center flex-shrink-0" style={{ border: `1px solid ${edColor}33` }}>
                        <Layers className="w-5 h-5" style={{ color: edColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate" style={{ color: "oklch(0.88 0.01 240)" }}>{card.athleteName}</div>
                        <div className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>{card.sport} · {card.cardYear}</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: `${edColor}1a`, color: edColor, border: `1px solid ${edColor}33` }}>
                        {card.edition.replace("_", " ")}
                      </span>
                    </div>
                    <code className="text-xs mono mt-2 block" style={{ color: "oklch(0.35 0.02 240)" }}>{card.tokenId.substring(0, 20)}...</code>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

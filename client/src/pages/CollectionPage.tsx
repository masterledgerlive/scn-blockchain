import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { LayoutGrid, Layers, Package, CheckCircle, Tag, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";

const EDITION_COLORS: Record<string, string> = {
  base: "oklch(0.55 0.02 240)",
  rare: "oklch(0.72 0.18 200)",
  ultra_rare: "oklch(0.65 0.22 280)",
  legendary: "oklch(0.82 0.18 85)",
  "1_of_1": "oklch(0.60 0.22 25)",
};

export default function CollectionPage() {
  const { isAuthenticated } = useAuth();
  const { data: myCards, isLoading: cardsLoading } = trpc.cards.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: mySlabs, isLoading: slabsLoading } = trpc.slabs.list.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <LayoutGrid className="w-12 h-12" style={{ color: "oklch(0.72 0.18 200)" }} />
        <h1 className="text-2xl font-black" style={{ color: "oklch(0.95 0.01 240)" }}>Sign In to View Collection</h1>
        <a href={getLoginUrl()}><Button style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>Connect</Button></a>
      </div>
    );
  }

  const totalCards = myCards?.length ?? 0;
  const verifiedCards = myCards?.filter(c => c.verificationStatus === "verified").length ?? 0;
  const listedCards = myCards?.filter(c => c.isListed).length ?? 0;
  const totalSlabs = mySlabs?.length ?? 0;

  const editionCounts = myCards?.reduce((acc, card) => {
    acc[card.edition] = (acc[card.edition] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>My Collection</h1>
        <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)" }}>All owned cards and slabs with verification status and market value.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Cards", value: totalCards, color: "oklch(0.72 0.18 200)", icon: Layers },
          { label: "Verified", value: verifiedCards, color: "oklch(0.72 0.18 145)", icon: CheckCircle },
          { label: "Listed", value: listedCards, color: "oklch(0.82 0.18 85)", icon: Tag },
          { label: "Smart Slabs", value: totalSlabs, color: "oklch(0.65 0.22 280)", icon: Package },
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

      {/* Edition Breakdown */}
      {Object.keys(editionCounts).length > 0 && (
        <div className="scn-card p-5 mb-6">
          <h3 className="font-bold text-sm mb-3" style={{ color: "oklch(0.70 0.02 240)" }}>EDITION BREAKDOWN</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(editionCounts).map(([edition, count]) => {
              const color = EDITION_COLORS[edition] || "oklch(0.55 0.02 240)";
              return (
                <div key={edition} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${color}1a`, border: `1px solid ${color}33` }}>
                  <span className="text-xs font-semibold" style={{ color }}>{edition.replace("_", " ")}</span>
                  <span className="text-xs font-black mono" style={{ color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <h2 className="font-bold text-xl mb-4" style={{ color: "oklch(0.92 0.01 240)" }}>Cards ({totalCards})</h2>
      {cardsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-56 rounded-2xl animate-pulse" style={{ background: "oklch(0.11 0.015 240)" }} />)}
        </div>
      ) : !myCards || myCards.length === 0 ? (
        <div className="scn-card p-12 text-center mb-8">
          <Layers className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.25 0.02 240)" }} />
          <h3 className="font-bold mb-2" style={{ color: "oklch(0.60 0.02 240)" }}>No Cards Yet</h3>
          <p className="text-sm mb-4" style={{ color: "oklch(0.40 0.02 240)" }}>Start building your collection by minting your first card.</p>
          <Link href="/mint"><Button style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>Mint First Card</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {myCards.map(card => {
            const edColor = EDITION_COLORS[card.edition] || "oklch(0.55 0.02 240)";
            return (
              <div key={card.id} className="scn-card scn-card-hover flex flex-col overflow-hidden">
                {/* Card Art */}
                <div className="relative h-40 holographic flex items-center justify-center" style={{ borderBottom: "1px solid oklch(0.20 0.02 240)" }}>
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.athleteName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Layers className="w-10 h-10" style={{ color: edColor, opacity: 0.6 }} />
                      <div className="text-xs font-bold" style={{ color: edColor }}>{card.edition.replace("_", " ").toUpperCase()}</div>
                    </div>
                  )}
                  {/* Status badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {card.verificationStatus === "verified" && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "oklch(0.72 0.18 145 / 0.9)" }}>
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    {card.isListed && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "oklch(0.82 0.18 85 / 0.9)" }}>
                        <Tag className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    {card.isInSlab && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "oklch(0.65 0.22 280 / 0.9)" }}>
                        <Package className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1">
                  <div className="font-bold text-sm truncate mb-0.5" style={{ color: "oklch(0.92 0.01 240)" }}>{card.athleteName}</div>
                  <div className="text-xs mb-2" style={{ color: "oklch(0.50 0.02 240)" }}>{card.sport} · {card.cardYear}</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${edColor}1a`, color: edColor, border: `1px solid ${edColor}33` }}>
                      {card.edition.replace("_", " ")}
                    </span>
                    {card.gradeScore && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "oklch(0.82 0.18 85 / 0.1)", color: "oklch(0.82 0.18 85)", border: "1px solid oklch(0.82 0.18 85 / 0.3)" }}>
                        Grade {parseFloat(card.gradeScore).toFixed(1)}
                      </span>
                    )}
                  </div>
                  {card.pufHash && (
                    <div className="mt-2 text-xs mono truncate" style={{ color: "oklch(0.35 0.02 240)" }}>PUF: {card.pufHash.substring(0, 16)}...</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slabs */}
      <h2 className="font-bold text-xl mb-4" style={{ color: "oklch(0.92 0.01 240)" }}>Smart Slabs ({totalSlabs})</h2>
      {slabsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "oklch(0.11 0.015 240)" }} />)}
        </div>
      ) : !mySlabs || mySlabs.length === 0 ? (
        <div className="scn-card p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.25 0.02 240)" }} />
          <p className="text-sm mb-4" style={{ color: "oklch(0.40 0.02 240)" }}>No slabs yet.</p>
          <Link href="/slabs"><Button variant="outline" style={{ borderColor: "oklch(0.25 0.02 240)", color: "oklch(0.70 0.02 240)" }}>Create a Slab</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mySlabs.map(slab => (
            <div key={slab.id} className="scn-card scn-card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: "oklch(0.65 0.22 280)" }}>SMART SLAB</div>
                  <div className="font-bold mono text-sm" style={{ color: "oklch(0.88 0.01 240)" }}>{slab.slabId}</div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: slab.status === "sealed" ? "oklch(0.72 0.18 145 / 0.1)" : "oklch(0.20 0.02 240)", color: slab.status === "sealed" ? "oklch(0.72 0.18 145)" : "oklch(0.55 0.02 240)", border: `1px solid ${slab.status === "sealed" ? "oklch(0.72 0.18 145 / 0.3)" : "oklch(0.25 0.02 240)"}` }}>
                    {slab.status}
                  </span>
                </div>
              </div>
              <div className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>
                {slab.slabType.replace("_", " ")} · {slab.totalCards} cards
                {slab.isMysterySlab && " · Mystery"}
                {slab.faradayShielded && " · Faraday"}
              </div>
              <div className="text-xs mono mt-2" style={{ color: "oklch(0.35 0.02 240)" }}>POSA: {slab.posaCode}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

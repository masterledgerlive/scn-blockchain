import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Shield, Lock, Zap, CheckCircle, Package, Radio, Eye } from "lucide-react";
import { Link } from "wouter";

export default function SlabPage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: wallet } = trpc.wallet.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myCards } = trpc.cards.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: mySlabs } = trpc.slabs.list.useQuery(undefined, { enabled: isAuthenticated });

  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [slabType, setSlabType] = useState<"single" | "mystery_pack" | "set">("single");
  const [isMysterySlab, setIsMysterySlab] = useState(false);
  const [faradayShielded, setFaradayShielded] = useState(false);
  const [createdSlab, setCreatedSlab] = useState<any>(null);

  const createSlab = trpc.slabs.create.useMutation({
    onSuccess: (slab) => {
      setCreatedSlab(slab);
      toast.success(`Smart Slab sealed! ID: ${slab.slabId}`);
      utils.slabs.list.invalidate();
      utils.cards.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const availableCards = myCards?.filter(c => !c.isInSlab && !c.isListed) ?? [];

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <Shield className="w-12 h-12" style={{ color: "oklch(0.65 0.22 280)" }} />
        <h1 className="text-2xl font-black" style={{ color: "oklch(0.95 0.01 240)" }}>Sign In to Create Slabs</h1>
        <a href={getLoginUrl()}><Button style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>Connect</Button></a>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <h1 className="text-2xl font-black" style={{ color: "oklch(0.95 0.01 240)" }}>Create a Wallet First</h1>
        <Link href="/wallet"><Button style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>Go to Wallet</Button></Link>
      </div>
    );
  }

  const toggleCard = (id: number) => {
    setSelectedCards(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>Smart Slab System</h1>
        <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)" }}>Schrödinger's Slab — on-chain odds transparency with Faraday-shielded vault containers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Slab */}
        <div className="space-y-4">
          <div className="scn-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5" style={{ color: "oklch(0.65 0.22 280)" }} />
              <h2 className="font-bold" style={{ color: "oklch(0.92 0.01 240)" }}>Create Smart Slab</h2>
            </div>

            {/* Slab Type */}
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: "oklch(0.55 0.02 240)" }}>SLAB TYPE</div>
              <div className="grid grid-cols-3 gap-2">
                {(["single", "mystery_pack", "set"] as const).map(type => (
                  <button key={type} onClick={() => setSlabType(type)} className="p-2 rounded-lg text-xs font-medium transition-all" style={{
                    background: slabType === type ? "oklch(0.65 0.22 280 / 0.15)" : "oklch(0.10 0.01 240)",
                    border: `1px solid ${slabType === type ? "oklch(0.65 0.22 280 / 0.5)" : "oklch(0.22 0.02 240)"}`,
                    color: slabType === type ? "oklch(0.65 0.22 280)" : "oklch(0.55 0.02 240)",
                  }}>
                    {type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-9 h-5 rounded-full transition-colors relative" style={{ background: isMysterySlab ? "oklch(0.65 0.22 280)" : "oklch(0.20 0.02 240)" }} onClick={() => setIsMysterySlab(p => !p)}>
                  <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform" style={{ transform: isMysterySlab ? "translateX(20px)" : "translateX(2px)" }} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: "oklch(0.85 0.01 240)" }}>Schrödinger's Slab</div>
                  <div className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>Mystery pack with on-chain odds published before sealing</div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-9 h-5 rounded-full transition-colors relative" style={{ background: faradayShielded ? "oklch(0.72 0.18 200)" : "oklch(0.20 0.02 240)" }} onClick={() => setFaradayShielded(p => !p)}>
                  <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform" style={{ transform: faradayShielded ? "translateX(20px)" : "translateX(2px)" }} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: "oklch(0.85 0.01 240)" }}>Faraday Shield</div>
                  <div className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>Electromagnetic isolation prevents unauthorized scanning</div>
                </div>
              </label>
            </div>

            {/* On-chain odds preview */}
            {isMysterySlab && (
              <div className="p-4 rounded-xl mb-4" style={{ background: "oklch(0.65 0.22 280 / 0.05)", border: "1px solid oklch(0.65 0.22 280 / 0.2)" }}>
                <div className="text-xs font-semibold mb-2" style={{ color: "oklch(0.65 0.22 280)" }}>ON-CHAIN ODDS (Published Before Seal)</div>
                <div className="space-y-1.5">
                  {[["Base", "60%", "oklch(0.55 0.02 240)"], ["Rare", "25%", "oklch(0.72 0.18 200)"], ["Ultra Rare", "10%", "oklch(0.65 0.22 280)"], ["Legendary", "4%", "oklch(0.82 0.18 85)"], ["1 of 1", "1%", "oklch(0.60 0.22 25)"]].map(([label, pct, color]) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="text-xs w-20" style={{ color }}>{label}</div>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(0.16 0.02 240)" }}>
                        <div className="h-full rounded-full" style={{ width: pct, background: color }} />
                      </div>
                      <div className="text-xs mono w-8 text-right" style={{ color }}>{pct}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Select Cards */}
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: "oklch(0.55 0.02 240)" }}>SELECT CARDS ({selectedCards.length} selected)</div>
              {availableCards.length === 0 ? (
                <div className="p-4 rounded-xl text-center" style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
                  <p className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>No available cards. <Link href="/mint"><span style={{ color: "oklch(0.72 0.18 200)" }}>Mint some cards first.</span></Link></p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableCards.map(card => (
                    <button key={card.id} onClick={() => toggleCard(card.id)} className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left" style={{
                      background: selectedCards.includes(card.id) ? "oklch(0.72 0.18 200 / 0.1)" : "oklch(0.10 0.01 240)",
                      border: `1px solid ${selectedCards.includes(card.id) ? "oklch(0.72 0.18 200 / 0.4)" : "oklch(0.18 0.02 240)"}`,
                    }}>
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: selectedCards.includes(card.id) ? "oklch(0.72 0.18 200)" : "oklch(0.16 0.02 240)" }}>
                        {selectedCards.includes(card.id) && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: "oklch(0.88 0.01 240)" }}>{card.athleteName}</div>
                        <div className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>{card.sport} · {card.cardYear} · {card.edition}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => createSlab.mutate({ slabType, isMysterySlab, faradayShielded, cardIds: selectedCards })}
              disabled={selectedCards.length === 0 || createSlab.isPending}
              className="w-full gap-2"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 280), oklch(0.72 0.18 200))", color: "white", border: "none" }}
            >
              <Lock className="w-4 h-4" />
              {createSlab.isPending ? "Sealing Slab..." : `Seal Smart Slab (${selectedCards.length} cards)`}
            </Button>
          </div>

          {createdSlab && (
            <div className="scn-card p-6" style={{ border: "1px solid oklch(0.72 0.18 145 / 0.4)" }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5" style={{ color: "oklch(0.72 0.18 145)" }} />
                <span className="font-bold" style={{ color: "oklch(0.72 0.18 145)" }}>Slab Sealed!</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="mono p-2 rounded" style={{ background: "oklch(0.09 0.01 240)", color: "oklch(0.72 0.18 200)" }}>{createdSlab.slabId}</div>
                <div className="mono p-2 rounded" style={{ background: "oklch(0.09 0.01 240)", color: "oklch(0.50 0.02 240)" }}>POSA: {createdSlab.posaCode}</div>
              </div>
            </div>
          )}
        </div>

        {/* My Slabs */}
        <div>
          <h2 className="font-bold mb-4" style={{ color: "oklch(0.92 0.01 240)" }}>My Slabs ({mySlabs?.length ?? 0})</h2>
          {!mySlabs || mySlabs.length === 0 ? (
            <div className="scn-card p-8 text-center">
              <Package className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.30 0.02 240)" }} />
              <p className="text-sm" style={{ color: "oklch(0.45 0.02 240)" }}>No slabs yet. Create your first Smart Slab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySlabs.map(slab => (
                <div key={slab.id} className="scn-card scn-card-hover p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="text-sm font-bold mono" style={{ color: "oklch(0.88 0.01 240)" }}>{slab.slabId}</div>
                      <div className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.02 240)" }}>{slab.slabType.replace("_", " ")} · {slab.totalCards} cards</div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: slab.status === "sealed" ? "oklch(0.72 0.18 145 / 0.1)" : "oklch(0.20 0.02 240)", color: slab.status === "sealed" ? "oklch(0.72 0.18 145)" : "oklch(0.55 0.02 240)", border: `1px solid ${slab.status === "sealed" ? "oklch(0.72 0.18 145 / 0.3)" : "oklch(0.25 0.02 240)"}` }}>
                        {slab.status}
                      </span>
                      {slab.isMysterySlab && <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "oklch(0.65 0.22 280 / 0.1)", color: "oklch(0.65 0.22 280)", border: "1px solid oklch(0.65 0.22 280 / 0.3)" }}>Mystery</span>}
                      {slab.faradayShielded && <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "oklch(0.72 0.18 200 / 0.1)", color: "oklch(0.72 0.18 200)", border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>Faraday</span>}
                    </div>
                  </div>
                  <div className="text-xs mono" style={{ color: "oklch(0.40 0.02 240)" }}>POSA: {slab.posaCode}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

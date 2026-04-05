import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Layers, Cpu, Shield, CheckCircle, AlertCircle, Sparkles, Zap } from "lucide-react";
import { Link } from "wouter";

const EDITIONS = [
  { value: "base", label: "Base", color: "oklch(0.55 0.02 240)" },
  { value: "rare", label: "Rare", color: "oklch(0.72 0.18 200)" },
  { value: "ultra_rare", label: "Ultra Rare", color: "oklch(0.65 0.22 280)" },
  { value: "legendary", label: "Legendary", color: "oklch(0.82 0.18 85)" },
  { value: "1_of_1", label: "1 of 1", color: "oklch(0.60 0.22 25)" },
] as const;

export default function MintCardPage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: wallet } = trpc.wallet.get.useQuery(undefined, { enabled: isAuthenticated });

  const [form, setForm] = useState({
    athleteName: "",
    sport: "",
    cardYear: new Date().getFullYear(),
    series: "",
    cardNumber: "",
    edition: "base" as "base" | "rare" | "ultra_rare" | "legendary" | "1_of_1",
    generateAiImage: false,
    customImagePrompt: "",
  });

  const [scrubResult, setScrubResult] = useState<{ safe: boolean; issues: string[]; suggestions: string[]; nilCompliant: boolean } | null>(null);
  const [mintedCard, setMintedCard] = useState<any>(null);

  const scrubCheck = trpc.cards.aiScrubCheck.useMutation({
    onSuccess: (data) => setScrubResult(data),
    onError: (e) => toast.error(e.message),
  });

  const mintCard = trpc.cards.mint.useMutation({
    onSuccess: (card) => {
      setMintedCard(card);
      toast.success(`Card minted! Token: ${card.tokenId}`);
      utils.cards.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <Layers className="w-12 h-12" style={{ color: "oklch(0.72 0.18 200)" }} />
        <h1 className="text-2xl font-black" style={{ color: "oklch(0.95 0.01 240)" }}>Sign In to Mint Cards</h1>
        <a href={getLoginUrl()}><Button style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>Connect</Button></a>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <Zap className="w-12 h-12" style={{ color: "oklch(0.82 0.18 85)" }} />
        <h1 className="text-2xl font-black" style={{ color: "oklch(0.95 0.01 240)" }}>Create a Wallet First</h1>
        <Link href="/wallet"><Button style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>Go to Wallet</Button></Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>Mint a Card</h1>
        <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)" }}>Create a new NIL-only collectible with PUF encoding and AI trademark scrubbing.</p>
      </div>

      {mintedCard ? (
        <div className="scn-card p-8 text-center" style={{ border: "1px solid oklch(0.72 0.18 145 / 0.4)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "oklch(0.72 0.18 145 / 0.1)" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "oklch(0.72 0.18 145)" }} />
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>Card Minted!</h2>
          <div className="space-y-2 mb-6">
            <div className="mono text-sm p-2 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", color: "oklch(0.72 0.18 200)" }}>{mintedCard.tokenId}</div>
            <div className="text-sm" style={{ color: "oklch(0.60 0.02 240)" }}>{mintedCard.athleteName} · {mintedCard.sport} · {mintedCard.cardYear}</div>
            {mintedCard.pufHash && (
              <div className="text-xs mono p-2 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", color: "oklch(0.50 0.02 240)" }}>PUF: {mintedCard.pufHash}</div>
            )}
            {mintedCard.imageUrl && (
              <img src={mintedCard.imageUrl} alt={mintedCard.athleteName} className="w-48 h-48 object-cover rounded-xl mx-auto mt-4" style={{ border: "1px solid oklch(0.22 0.02 240)" }} />
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setMintedCard(null); setForm({ athleteName: "", sport: "", cardYear: new Date().getFullYear(), series: "", cardNumber: "", edition: "base", generateAiImage: false, customImagePrompt: "" }); setScrubResult(null); }} variant="outline" style={{ borderColor: "oklch(0.25 0.02 240)", color: "oklch(0.80 0.01 240)" }}>Mint Another</Button>
            <Link href="/collection"><Button style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>View Collection</Button></Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card Details */}
          <div className="scn-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5" style={{ color: "oklch(0.72 0.18 200)" }} />
              <h2 className="font-bold" style={{ color: "oklch(0.92 0.01 240)" }}>Card Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.02 240)" }}>Athlete Name *</Label>
                <Input value={form.athleteName} onChange={e => setForm(p => ({ ...p, athleteName: e.target.value }))} placeholder="e.g. Michael Jordan" style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)" }} />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.02 240)" }}>Sport *</Label>
                <Input value={form.sport} onChange={e => setForm(p => ({ ...p, sport: e.target.value }))} placeholder="e.g. Basketball" style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)" }} />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.02 240)" }}>Card Year *</Label>
                <Input type="number" value={form.cardYear} onChange={e => setForm(p => ({ ...p, cardYear: parseInt(e.target.value) }))} style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)" }} />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.02 240)" }}>Series</Label>
                <Input value={form.series} onChange={e => setForm(p => ({ ...p, series: e.target.value }))} placeholder="e.g. Sovereign Rookies" style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)" }} />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.02 240)" }}>Card Number</Label>
                <Input value={form.cardNumber} onChange={e => setForm(p => ({ ...p, cardNumber: e.target.value }))} placeholder="e.g. 001/100" style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)" }} />
              </div>
            </div>
          </div>

          {/* Edition Selection */}
          <div className="scn-card p-6">
            <h2 className="font-bold mb-4" style={{ color: "oklch(0.92 0.01 240)" }}>Edition</h2>
            <div className="grid grid-cols-5 gap-2">
              {EDITIONS.map(({ value, label, color }) => (
                <button key={value} onClick={() => setForm(p => ({ ...p, edition: value }))} className="p-3 rounded-xl text-center transition-all" style={{
                  background: form.edition === value ? `${color}1a` : "oklch(0.10 0.01 240)",
                  border: `1px solid ${form.edition === value ? color : "oklch(0.22 0.02 240)"}`,
                  color: form.edition === value ? color : "oklch(0.55 0.02 240)",
                }}>
                  <div className="text-xs font-bold">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Image Generation */}
          <div className="scn-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" style={{ color: "oklch(0.82 0.18 85)" }} />
              <h2 className="font-bold" style={{ color: "oklch(0.92 0.01 240)" }}>AI Card Art</h2>
              <label className="ml-auto flex items-center gap-2 cursor-pointer">
                <span className="text-xs" style={{ color: "oklch(0.55 0.02 240)" }}>Generate AI Image</span>
                <div className={`w-10 h-5 rounded-full transition-colors relative ${form.generateAiImage ? "" : ""}`} style={{ background: form.generateAiImage ? "oklch(0.72 0.18 200)" : "oklch(0.20 0.02 240)" }} onClick={() => setForm(p => ({ ...p, generateAiImage: !p.generateAiImage }))}>
                  <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform" style={{ transform: form.generateAiImage ? "translateX(22px)" : "translateX(2px)" }} />
                </div>
              </label>
            </div>
            {form.generateAiImage && (
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.02 240)" }}>Custom Prompt (optional)</Label>
                <Input value={form.customImagePrompt} onChange={e => setForm(p => ({ ...p, customImagePrompt: e.target.value }))} placeholder="Describe the card art style..." style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)" }} />
                <p className="text-xs mt-2" style={{ color: "oklch(0.45 0.02 240)" }}>AI will automatically generate NIL-compliant art. No team logos or trademarks.</p>
              </div>
            )}
          </div>

          {/* AI Scrub Check */}
          <div className="scn-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" style={{ color: "oklch(0.72 0.18 145)" }} />
              <h2 className="font-bold" style={{ color: "oklch(0.92 0.01 240)" }}>AI Legal Firewall Check</h2>
            </div>
            <p className="text-xs mb-4" style={{ color: "oklch(0.50 0.02 240)" }}>Run the AI trademark scrubber to verify NIL compliance before minting.</p>
            <Button
              onClick={() => scrubCheck.mutate({ athleteName: form.athleteName, description: `${form.sport} card, ${form.series || "standard series"}, ${form.edition} edition` })}
              disabled={!form.athleteName || !form.sport || scrubCheck.isPending}
              variant="outline"
              className="gap-2 mb-4"
              style={{ borderColor: "oklch(0.72 0.18 145 / 0.5)", color: "oklch(0.72 0.18 145)" }}
            >
              <Shield className="w-4 h-4" />
              {scrubCheck.isPending ? "Scanning..." : "Run Scrub Check"}
            </Button>

            {scrubResult && (
              <div className="p-4 rounded-xl" style={{ background: scrubResult.safe ? "oklch(0.72 0.18 145 / 0.05)" : "oklch(0.60 0.22 25 / 0.05)", border: `1px solid ${scrubResult.safe ? "oklch(0.72 0.18 145 / 0.3)" : "oklch(0.60 0.22 25 / 0.3)"}` }}>
                <div className="flex items-center gap-2 mb-2">
                  {scrubResult.safe ? <CheckCircle className="w-4 h-4" style={{ color: "oklch(0.72 0.18 145)" }} /> : <AlertCircle className="w-4 h-4" style={{ color: "oklch(0.60 0.22 25)" }} />}
                  <span className="text-sm font-bold" style={{ color: scrubResult.safe ? "oklch(0.72 0.18 145)" : "oklch(0.60 0.22 25)" }}>
                    {scrubResult.safe ? "NIL Compliant — Safe to Mint" : "Issues Detected"}
                  </span>
                </div>
                {scrubResult.issues.length > 0 && (
                  <ul className="text-xs space-y-1 mb-2" style={{ color: "oklch(0.60 0.22 25)" }}>
                    {scrubResult.issues.map((issue, i) => <li key={i}>• {issue}</li>)}
                  </ul>
                )}
                {scrubResult.suggestions.length > 0 && (
                  <ul className="text-xs space-y-1" style={{ color: "oklch(0.55 0.02 240)" }}>
                    {scrubResult.suggestions.map((s, i) => <li key={i}>→ {s}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* PUF Info */}
          <div className="scn-card p-4 flex items-start gap-3" style={{ border: "1px solid oklch(0.82 0.18 85 / 0.3)" }}>
            <Cpu className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.82 0.18 85)" }} />
            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: "oklch(0.82 0.18 85)" }}>PUF Encoding</div>
              <p className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>A Physical Unclonable Function hash and fiber pattern will be automatically generated and encoded into this card's on-chain record. Scan the physical card later to verify authenticity.</p>
            </div>
          </div>

          {/* Mint Button */}
          <Button
            onClick={() => mintCard.mutate(form)}
            disabled={!form.athleteName || !form.sport || mintCard.isPending}
            className="w-full gap-2 py-6 text-base font-bold"
            style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}
          >
            <Layers className="w-5 h-5" />
            {mintCard.isPending ? "Minting on SCN Chain..." : "Mint Card to Blockchain"}
          </Button>
        </div>
      )}
    </div>
  );
}

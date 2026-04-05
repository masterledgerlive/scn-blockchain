import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Wallet, Shield, Star, Copy, ExternalLink, Zap, CheckCircle, AlertCircle } from "lucide-react";

const TIER_CONFIG = {
  newcomer: { label: "Newcomer", color: "oklch(0.55 0.02 240)", min: 0 },
  verified: { label: "Verified", color: "oklch(0.72 0.18 145)", min: 30 },
  certified_shop: { label: "Certified Shop", color: "oklch(0.72 0.18 200)", min: 100 },
  master_trader: { label: "Master Trader", color: "oklch(0.82 0.18 85)", min: 200 },
  verified_player: { label: "Verified Player", color: "oklch(0.65 0.22 280)", min: 500 },
};

export default function WalletPage() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: wallet, isLoading } = trpc.wallet.get.useQuery(undefined, { enabled: isAuthenticated });

  const createWallet = trpc.wallet.create.useMutation({
    onSuccess: () => {
      toast.success("Wallet created! SBT identity minted on-chain.");
      utils.wallet.get.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "oklch(0.72 0.18 200 / 0.1)", border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>
          <Wallet className="w-8 h-8" style={{ color: "oklch(0.72 0.18 200)" }} />
        </div>
        <h1 className="text-2xl font-black text-center" style={{ color: "oklch(0.95 0.01 240)" }}>Connect to Access Your Wallet</h1>
        <p className="text-center max-w-sm" style={{ color: "oklch(0.55 0.02 240)" }}>Sign in to create your SCN wallet and mint your Soulbound Token identity.</p>
        <a href={getLoginUrl()}>
          <Button style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>
            Connect & Sign In
          </Button>
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="h-8 w-48 rounded-lg animate-pulse mb-6" style={{ background: "oklch(0.14 0.015 240)" }} />
        <div className="h-64 rounded-2xl animate-pulse" style={{ background: "oklch(0.11 0.015 240)" }} />
      </div>
    );
  }

  const tier = wallet ? TIER_CONFIG[wallet.trustTier] : null;
  const nextTier = wallet ? Object.values(TIER_CONFIG).find(t => t.min > wallet.trustScore) : null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>Wallet & SBT Identity</h1>
        <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)" }}>Your sovereign on-chain identity. Non-transferable. Tamper-proof.</p>
      </div>

      {!wallet ? (
        <div className="scn-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "oklch(0.72 0.18 200 / 0.1)", border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>
            <Zap className="w-8 h-8" style={{ color: "oklch(0.72 0.18 200)" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>No Wallet Found</h2>
          <p className="text-sm mb-6" style={{ color: "oklch(0.55 0.02 240)" }}>
            Create your SCN wallet to receive a Soulbound Token (SBT) identity. This is your permanent, non-transferable on-chain identity.
          </p>
          <Button
            onClick={() => createWallet.mutate()}
            disabled={createWallet.isPending}
            className="gap-2"
            style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}
          >
            <Zap className="w-4 h-4" />
            {createWallet.isPending ? "Creating Wallet..." : "Create SCN Wallet + Mint SBT"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Wallet Address Card */}
          <div className="scn-card p-6" style={{ border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.72 0.18 200 / 0.1)" }}>
                <Wallet className="w-5 h-5" style={{ color: "oklch(0.72 0.18 200)" }} />
              </div>
              <div>
                <div className="text-xs font-semibold" style={{ color: "oklch(0.72 0.18 200)" }}>SCN WALLET ADDRESS</div>
                <div className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>Layer 1 Native Address</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
              <code className="text-sm flex-1 truncate mono" style={{ color: "oklch(0.80 0.01 240)" }}>{wallet.address}</code>
              <button onClick={() => { navigator.clipboard.writeText(wallet.address); toast.success("Address copied!"); }} className="p-1.5 rounded-md hover:bg-white/10 transition-colors">
                <Copy className="w-4 h-4" style={{ color: "oklch(0.55 0.02 240)" }} />
              </button>
            </div>
          </div>

          {/* SBT Identity Card */}
          <div className="scn-card p-6" style={{ border: "1px solid oklch(0.65 0.22 280 / 0.3)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.65 0.22 280 / 0.1)" }}>
                <Shield className="w-5 h-5" style={{ color: "oklch(0.65 0.22 280)" }} />
              </div>
              <div>
                <div className="text-xs font-semibold" style={{ color: "oklch(0.65 0.22 280)" }}>SOULBOUND TOKEN (SBT)</div>
                <div className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>Non-transferable identity token</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "oklch(0.72 0.18 145 / 0.1)", border: "1px solid oklch(0.72 0.18 145 / 0.3)" }}>
                <CheckCircle className="w-3.5 h-3.5" style={{ color: "oklch(0.72 0.18 145)" }} />
                <span className="text-xs font-semibold" style={{ color: "oklch(0.72 0.18 145)" }}>Minted</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
                <div className="text-xs mb-1" style={{ color: "oklch(0.45 0.02 240)" }}>Token ID</div>
                <code className="text-xs mono" style={{ color: "oklch(0.80 0.01 240)" }}>{wallet.sbtTokenId}</code>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
                <div className="text-xs mb-1" style={{ color: "oklch(0.45 0.02 240)" }}>Owner</div>
                <div className="text-xs font-medium" style={{ color: "oklch(0.80 0.01 240)" }}>{user?.name || "Anonymous"}</div>
              </div>
            </div>
          </div>

          {/* Trust Score Card */}
          <div className="scn-card p-6" style={{ border: `1px solid ${tier?.color}33` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${tier?.color}1a` }}>
                <Star className="w-5 h-5" style={{ color: tier?.color }} />
              </div>
              <div>
                <div className="text-xs font-semibold" style={{ color: tier?.color }}>TRUST SCORE</div>
                <div className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>On-chain reputation metric</div>
              </div>
              <div className="ml-auto">
                <div className="text-3xl font-black mono" style={{ color: tier?.color }}>{wallet.trustScore}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${tier?.color}1a`, color: tier?.color, border: `1px solid ${tier?.color}33` }}>
                {tier?.label}
              </div>
              {nextTier && (
                <div className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>
                  {nextTier.min - wallet.trustScore} points to {Object.values(TIER_CONFIG).find(t => t.min === nextTier.min)?.label}
                </div>
              )}
            </div>

            {/* Trust tier progression */}
            <div className="space-y-2">
              {Object.entries(TIER_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: wallet.trustTier === key ? cfg.color : "oklch(0.25 0.02 240)" }} />
                  <div className="text-xs flex-1" style={{ color: wallet.trustTier === key ? cfg.color : "oklch(0.40 0.02 240)" }}>{cfg.label}</div>
                  <div className="text-xs mono" style={{ color: "oklch(0.40 0.02 240)" }}>{cfg.min}+</div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
              <div className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>
                Earn trust by: minting cards (+5), verifying cards (+10), creating slabs (+15), buying (+8), voting (+3)
              </div>
            </div>
          </div>

          {/* Public Key */}
          <div className="scn-card p-6">
            <div className="text-xs font-semibold mb-3" style={{ color: "oklch(0.55 0.02 240)" }}>PUBLIC KEY</div>
            <div className="p-3 rounded-lg overflow-hidden" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
              <code className="text-xs mono break-all" style={{ color: "oklch(0.40 0.02 240)" }}>{wallet.publicKey}</code>
            </div>
          </div>

          {/* Stain Count */}
          {wallet.stainCount > 0 && (
            <div className="scn-card p-4 flex items-center gap-3" style={{ border: "1px solid oklch(0.60 0.22 25 / 0.3)" }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.60 0.22 25)" }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: "oklch(0.60 0.22 25)" }}>Reputation Stains: {wallet.stainCount}</div>
                <div className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>Stains are recorded for disputed transactions or flagged activity.</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

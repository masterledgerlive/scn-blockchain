import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ShieldCheck, Cpu, Search, CheckCircle, Clock, ArrowRight, AlertCircle, QrCode, ScanLine } from "lucide-react";
import { Link, useSearch } from "wouter";

export default function VerifyPage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: wallet } = trpc.wallet.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myCards } = trpc.cards.list.useQuery(undefined, { enabled: isAuthenticated });

  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ gradeScore: number; pufHash: string; txHash: string } | null>(null);
  const [custodyCardId, setCustodyCardId] = useState<number | null>(null);
  const [qrTokenId, setQrTokenId] = useState<string>("");
  const [showQr, setShowQr] = useState(false);

  // Support ?token= URL param for QR scan deep link
  const search = useSearch();
  const urlToken = new URLSearchParams(search).get("token");

  const { data: qrData } = trpc.qr.generate.useQuery(
    { tokenId: qrTokenId },
    { enabled: showQr && !!qrTokenId }
  );

  const { data: scannedCard } = trpc.qr.scan.useQuery(
    { tokenId: urlToken || "" },
    { enabled: !!urlToken }
  );

  const { data: custodyHistory } = trpc.explorer.cardCustody.useQuery(
    { cardId: custodyCardId! },
    { enabled: !!custodyCardId }
  );

  const verifyCard = trpc.cards.verify.useMutation({
    onSuccess: (result) => {
      setVerifyResult(result);
      setScanning(false);
      toast.success(`Verified! Grade: ${result.gradeScore}/10`);
      utils.cards.list.invalidate();
    },
    onError: (e) => { setScanning(false); toast.error(e.message); },
  });

  const handleVerify = () => {
    if (!selectedCardId) return;
    setScanning(true);
    setVerifyResult(null);
    setTimeout(() => {
      verifyCard.mutate({ cardId: selectedCardId, simulateScan: true });
    }, 2500);
  };

  const selectedCard = myCards?.find(c => c.id === selectedCardId);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <ShieldCheck className="w-12 h-12" style={{ color: "oklch(0.72 0.18 145)" }} />
        <h1 className="text-2xl font-black" style={{ color: "oklch(0.95 0.01 240)" }}>Sign In to Verify Cards</h1>
        <a href={getLoginUrl()}><Button style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>Connect</Button></a>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>Card Verification</h1>
        <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)" }}>PUF scan authentication and complete chain of custody tracking.</p>
      </div>

      {/* URL-based QR scan result */}
      {urlToken && scannedCard && (
        <div className="mb-6 p-5 rounded-xl" style={{ background: "oklch(0.72 0.18 145 / 0.08)", border: "1px solid oklch(0.72 0.18 145 / 0.35)" }}>
          <div className="flex items-center gap-2 mb-3">
            <ScanLine className="w-5 h-5" style={{ color: "oklch(0.72 0.18 145)" }} />
            <span className="font-bold" style={{ color: "oklch(0.72 0.18 145)" }}>QR Code Scan Result — {scannedCard.network}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
              <div className="text-xs mb-1" style={{ color: "oklch(0.45 0.02 240)" }}>Athlete</div>
              <div className="text-sm font-bold" style={{ color: "oklch(0.92 0.01 240)" }}>{scannedCard.card.athleteName}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
              <div className="text-xs mb-1" style={{ color: "oklch(0.45 0.02 240)" }}>Edition</div>
              <div className="text-sm font-bold" style={{ color: "oklch(0.82 0.18 85)" }}>{scannedCard.card.edition?.replace("_", " ")}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
              <div className="text-xs mb-1" style={{ color: "oklch(0.45 0.02 240)" }}>On-Chain Status</div>
              <div className="text-sm font-bold" style={{ color: scannedCard.verified ? "oklch(0.72 0.18 145)" : "oklch(0.72 0.18 30)" }}>
                {scannedCard.verified ? "✓ Verified" : "Unverified"}
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
              <div className="text-xs mb-1" style={{ color: "oklch(0.45 0.02 240)" }}>Custody Records</div>
              <div className="text-sm font-bold" style={{ color: "oklch(0.72 0.18 200)" }}>{scannedCard.custody.length}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PUF Scanner */}
        <div className="space-y-4">
          <div className="scn-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5" style={{ color: "oklch(0.82 0.18 85)" }} />
              <h2 className="font-bold" style={{ color: "oklch(0.92 0.01 240)" }}>PUF Scanner</h2>
            </div>

            {/* Select card */}
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: "oklch(0.55 0.02 240)" }}>SELECT CARD TO VERIFY</div>
              {!myCards || myCards.length === 0 ? (
                <div className="p-4 rounded-xl text-center" style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
                  <p className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>No cards found. <Link href="/mint"><span style={{ color: "oklch(0.72 0.18 200)" }}>Mint cards first.</span></Link></p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {myCards.map(card => (
                    <button key={card.id} onClick={() => { setSelectedCardId(card.id); setCustodyCardId(card.id); setVerifyResult(null); }} className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left" style={{
                      background: selectedCardId === card.id ? "oklch(0.82 0.18 85 / 0.1)" : "oklch(0.10 0.01 240)",
                      border: `1px solid ${selectedCardId === card.id ? "oklch(0.82 0.18 85 / 0.4)" : "oklch(0.18 0.02 240)"}`,
                    }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: "oklch(0.88 0.01 240)" }}>{card.athleteName}</div>
                        <div className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>{card.sport} · {card.cardYear}</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        background: card.verificationStatus === "verified" ? "oklch(0.72 0.18 145 / 0.1)" : "oklch(0.20 0.02 240)",
                        color: card.verificationStatus === "verified" ? "oklch(0.72 0.18 145)" : "oklch(0.50 0.02 240)",
                        border: `1px solid ${card.verificationStatus === "verified" ? "oklch(0.72 0.18 145 / 0.3)" : "oklch(0.25 0.02 240)"}`,
                      }}>{card.verificationStatus}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PUF Scan Visualization */}
            {selectedCard && (
              <div className={`relative h-32 rounded-xl mb-4 overflow-hidden ${scanning ? "puf-scan" : ""}`} style={{ background: "oklch(0.09 0.01 240)", border: `1px solid ${scanning ? "oklch(0.72 0.18 200 / 0.5)" : "oklch(0.18 0.02 240)"}` }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Cpu className={`w-8 h-8 ${scanning ? "animate-pulse" : ""}`} style={{ color: scanning ? "oklch(0.72 0.18 200)" : "oklch(0.35 0.02 240)" }} />
                  <div className="text-xs font-medium" style={{ color: scanning ? "oklch(0.72 0.18 200)" : "oklch(0.45 0.02 240)" }}>
                    {scanning ? "Scanning fiber pattern..." : "Ready to scan"}
                  </div>
                  {scanning && (
                    <div className="flex gap-1">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-1 rounded-full animate-pulse" style={{ height: `${8 + Math.random() * 16}px`, background: "oklch(0.72 0.18 200)", animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={handleVerify}
              disabled={!selectedCardId || scanning || verifyCard.isPending}
              className="w-full gap-2"
              style={{ background: "linear-gradient(135deg, oklch(0.82 0.18 85), oklch(0.72 0.18 200))", color: "white", border: "none" }}
            >
              <Cpu className="w-4 h-4" />
              {scanning ? "PUF Scanning..." : "Initiate PUF Scan"}
            </Button>
          </div>

          {/* QR Code Generator */}
          <div className="scn-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5" style={{ color: "oklch(0.72 0.18 200)" }} />
              <h2 className="font-bold" style={{ color: "oklch(0.92 0.01 240)" }}>Generate Card QR Code</h2>
            </div>
            <p className="text-xs mb-3" style={{ color: "oklch(0.50 0.02 240)" }}>Generate a QR code for any card token ID. Scan with any device to instantly verify authenticity on-chain.</p>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Enter Token ID (e.g. SCN-ABC123)"
                value={qrTokenId}
                onChange={(e) => { setQrTokenId(e.target.value); setShowQr(false); }}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
              />
              <Button
                onClick={() => setShowQr(true)}
                disabled={!qrTokenId.trim()}
                style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
            {/* Quick-select from owned cards */}
            {myCards && myCards.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {myCards.slice(0, 4).map(c => (
                  <button key={c.id} onClick={() => { setQrTokenId(c.tokenId); setShowQr(true); }} className="text-xs px-2 py-1 rounded-md transition-colors" style={{ background: "oklch(0.12 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.65 0.02 240)" }}>
                    {c.tokenId}
                  </button>
                ))}
              </div>
            )}
            {showQr && qrData && (
              <div className="flex flex-col items-center gap-3">
                <img src={qrData.qrDataUrl} alt="Card QR Code" className="w-40 h-40 rounded-xl" />
                <div className="text-center">
                  <div className="text-xs font-mono" style={{ color: "oklch(0.72 0.18 200)" }}>{qrData.tokenId}</div>
                  <div className="text-xs mt-1" style={{ color: "oklch(0.45 0.02 240)" }}>Scan to verify on SCN-TESTNET-1</div>
                </div>
                <a href={`/verify?token=${qrData.tokenId}`} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "oklch(0.72 0.18 200)" }}>Test scan link →</a>
              </div>
            )}
          </div>

          {/* Verification Result */}
          {verifyResult && (
            <div className="scn-card p-6" style={{ border: "1px solid oklch(0.72 0.18 145 / 0.4)" }}>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5" style={{ color: "oklch(0.72 0.18 145)" }} />
                <h3 className="font-bold" style={{ color: "oklch(0.72 0.18 145)" }}>Verification Complete</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
                  <div className="text-xs mb-1" style={{ color: "oklch(0.45 0.02 240)" }}>Grade Score</div>
                  <div className="text-2xl font-black mono" style={{ color: "oklch(0.82 0.18 85)" }}>{verifyResult.gradeScore}<span className="text-sm">/10</span></div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
                  <div className="text-xs mb-1" style={{ color: "oklch(0.45 0.02 240)" }}>PUF Status</div>
                  <div className="text-sm font-bold" style={{ color: "oklch(0.72 0.18 145)" }}>Authenticated</div>
                </div>
              </div>
              <div className="mt-3 p-2 rounded-lg" style={{ background: "oklch(0.09 0.01 240)", border: "1px solid oklch(0.18 0.02 240)" }}>
                <div className="text-xs mb-1" style={{ color: "oklch(0.45 0.02 240)" }}>TX Hash</div>
                <code className="text-xs mono" style={{ color: "oklch(0.50 0.02 240)" }}>{verifyResult.txHash}</code>
              </div>
            </div>
          )}
        </div>

        {/* Chain of Custody */}
        <div>
          <h2 className="font-bold mb-4" style={{ color: "oklch(0.92 0.01 240)" }}>Chain of Custody</h2>
          {!custodyCardId ? (
            <div className="scn-card p-8 text-center">
              <Search className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.30 0.02 240)" }} />
              <p className="text-sm" style={{ color: "oklch(0.45 0.02 240)" }}>Select a card to view its complete ownership history.</p>
            </div>
          ) : !custodyHistory || custodyHistory.length === 0 ? (
            <div className="scn-card p-8 text-center">
              <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.30 0.02 240)" }} />
              <p className="text-sm" style={{ color: "oklch(0.45 0.02 240)" }}>No custody records yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {custodyHistory.map((record, i) => (
                <div key={record.id} className="scn-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.72 0.18 200 / 0.1)", border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>
                        <span className="text-xs font-bold" style={{ color: "oklch(0.72 0.18 200)" }}>{custodyHistory.length - i}</span>
                      </div>
                      {i < custodyHistory.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "oklch(0.22 0.02 240)", minHeight: "16px" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "oklch(0.72 0.18 200 / 0.1)", color: "oklch(0.72 0.18 200)", border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>
                          {record.transferType.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="text-xs" style={{ color: "oklch(0.40 0.02 240)" }}>Block #{record.blockNumber.toLocaleString()}</span>
                      </div>
                      {record.notes && <div className="text-xs mb-1" style={{ color: "oklch(0.60 0.02 240)" }}>{record.notes}</div>}
                      <code className="text-xs mono" style={{ color: "oklch(0.40 0.02 240)" }}>{record.txHash.substring(0, 20)}...</code>
                      <div className="text-xs mt-1" style={{ color: "oklch(0.35 0.02 240)" }}>
                        {new Date(record.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

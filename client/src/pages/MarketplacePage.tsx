import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Store, Tag, ShoppingCart, Search, CheckCircle, Layers } from "lucide-react";
import { Link } from "wouter";

const EDITION_COLORS: Record<string, string> = {
  base: "oklch(0.55 0.02 240)",
  rare: "oklch(0.72 0.18 200)",
  ultra_rare: "oklch(0.65 0.22 280)",
  legendary: "oklch(0.82 0.18 85)",
  "1_of_1": "oklch(0.60 0.22 25)",
};

export default function MarketplacePage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [searchQuery, setSearchQuery] = useState("");
  const [editionFilter, setEditionFilter] = useState<string>("all");
  const [listingAssetId, setListingAssetId] = useState<number | null>(null);
  const [listingPrice, setListingPrice] = useState("");
  const [showListModal, setShowListModal] = useState(false);

  const { data: listings, isLoading } = trpc.marketplace.listings.useQuery();
  const { data: myCards } = trpc.cards.list.useQuery(undefined, { enabled: isAuthenticated });

  const listAsset = trpc.marketplace.list.useMutation({
    onSuccess: () => {
      toast.success("Card listed on marketplace!");
      setShowListModal(false);
      setListingAssetId(null);
      setListingPrice("");
      utils.marketplace.listings.invalidate();
      utils.cards.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const buyCard = trpc.marketplace.buy.useMutation({
    onSuccess: () => {
      toast.success("Card purchased! Check your collection.");
      utils.marketplace.listings.invalidate();
      utils.cards.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const cancelListing = trpc.marketplace.cancel.useMutation({
    onSuccess: () => {
      toast.success("Listing cancelled.");
      utils.marketplace.listings.invalidate();
      utils.cards.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const availableToList = myCards?.filter(c => !c.isListed && !c.isInSlab) ?? [];

  // Filter listings client-side
  const filteredListings = listings?.filter(l => {
    const asset = l.asset;
    if (!asset) return true;
    const isCard = l.assetType === "card";
    if (!isCard) return editionFilter === "all";
    const card = asset as any;
    const matchSearch = !searchQuery || card.athleteName?.toLowerCase().includes(searchQuery.toLowerCase()) || card.sport?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchEdition = editionFilter === "all" || card.edition === editionFilter;
    return matchSearch && matchEdition;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.95 0.01 240)" }}>Marketplace</h1>
        <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)" }}>Peer-to-peer trading. 2% fee flows to DAO treasury.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.45 0.02 240)" }} />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search athlete, sport..."
            className="pl-9"
            style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)" }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "base", "rare", "ultra_rare", "legendary", "1_of_1"].map(ed => (
            <button key={ed} onClick={() => setEditionFilter(ed)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{
              background: editionFilter === ed ? `${EDITION_COLORS[ed] || "oklch(0.72 0.18 200)"}1a` : "oklch(0.10 0.01 240)",
              border: `1px solid ${editionFilter === ed ? (EDITION_COLORS[ed] || "oklch(0.72 0.18 200)") + "66" : "oklch(0.22 0.02 240)"}`,
              color: editionFilter === ed ? (EDITION_COLORS[ed] || "oklch(0.72 0.18 200)") : "oklch(0.55 0.02 240)",
            }}>
              {ed === "all" ? "All" : ed.replace("_", " ")}
            </button>
          ))}
        </div>
        {isAuthenticated && (
          <Button onClick={() => setShowListModal(true)} className="gap-2" style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>
            <Tag className="w-4 h-4" />
            List a Card
          </Button>
        )}
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-56 rounded-2xl animate-pulse" style={{ background: "oklch(0.11 0.015 240)" }} />
          ))}
        </div>
      ) : !filteredListings || filteredListings.length === 0 ? (
        <div className="scn-card p-16 text-center">
          <Store className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.25 0.02 240)" }} />
          <h3 className="font-bold mb-2" style={{ color: "oklch(0.60 0.02 240)" }}>No Listings Found</h3>
          <p className="text-sm" style={{ color: "oklch(0.40 0.02 240)" }}>
            {searchQuery || editionFilter !== "all" ? "Try adjusting your filters." : "Be the first to list a card!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredListings.map((listing) => {
            const card = listing.assetType === "card" ? (listing.asset as any) : null;
            const edColor = EDITION_COLORS[card?.edition || "base"] || "oklch(0.55 0.02 240)";
            return (
              <div key={listing.id} className="scn-card scn-card-hover flex flex-col overflow-hidden">
                {/* Card Art Area */}
                <div className="relative h-40 holographic flex items-center justify-center" style={{ borderBottom: "1px solid oklch(0.20 0.02 240)" }}>
                  {card?.imageUrl ? (
                    <img src={card.imageUrl} alt={card.athleteName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Layers className="w-10 h-10" style={{ color: edColor, opacity: 0.6 }} />
                      <div className="text-xs font-bold" style={{ color: edColor }}>
                        {listing.assetType === "slab" ? "SMART SLAB" : card?.edition?.replace("_", " ").toUpperCase()}
                      </div>
                    </div>
                  )}
                  {card?.verificationStatus === "verified" && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "oklch(0.72 0.18 145 / 0.9)" }}>
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <div className="font-bold text-sm truncate" style={{ color: "oklch(0.92 0.01 240)" }}>
                      {card?.athleteName || `Slab #${listing.assetId}`}
                    </div>
                    <div className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>
                      {card ? `${card.sport} · ${card.cardYear}` : "Smart Slab"}
                    </div>
                  </div>
                  {card && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${edColor}1a`, color: edColor, border: `1px solid ${edColor}33` }}>
                        {card.edition?.replace("_", " ")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <div className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>Price</div>
                      <div className="text-lg font-black mono" style={{ color: "oklch(0.82 0.18 85)" }}>
                        ${parseFloat(listing.askPrice).toLocaleString()}
                      </div>
                    </div>
                    {isAuthenticated ? (
                      <Button
                        size="sm"
                        onClick={() => buyCard.mutate({ listingId: listing.listingId })}
                        disabled={buyCard.isPending}
                        className="gap-1.5"
                        style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none", fontSize: "0.75rem" }}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Buy
                      </Button>
                    ) : (
                      <a href={getLoginUrl()}>
                        <Button size="sm" variant="outline" style={{ borderColor: "oklch(0.25 0.02 240)", color: "oklch(0.70 0.02 240)", fontSize: "0.75rem" }}>Sign In</Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Card Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "oklch(0 0 0 / 0.7)" }}>
          <div className="w-full max-w-md scn-card p-6" style={{ border: "1px solid oklch(0.72 0.18 200 / 0.3)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "oklch(0.95 0.01 240)" }}>List Card for Sale</h3>
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: "oklch(0.55 0.02 240)" }}>SELECT CARD</div>
              {availableToList.length === 0 ? (
                <p className="text-sm" style={{ color: "oklch(0.45 0.02 240)" }}>No cards available. <Link href="/mint"><span style={{ color: "oklch(0.72 0.18 200)" }}>Mint cards first.</span></Link></p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableToList.map(card => (
                    <button key={card.id} onClick={() => setListingAssetId(card.id)} className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left" style={{
                      background: listingAssetId === card.id ? "oklch(0.72 0.18 200 / 0.1)" : "oklch(0.10 0.01 240)",
                      border: `1px solid ${listingAssetId === card.id ? "oklch(0.72 0.18 200 / 0.4)" : "oklch(0.18 0.02 240)"}`,
                    }}>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: "oklch(0.88 0.01 240)" }}>{card.athleteName}</div>
                        <div className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>{card.sport} · {card.edition}</div>
                      </div>
                      {listingAssetId === card.id && <CheckCircle className="w-4 h-4" style={{ color: "oklch(0.72 0.18 200)" }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: "oklch(0.55 0.02 240)" }}>LISTING PRICE (USD)</div>
              <Input
                type="number"
                value={listingPrice}
                onChange={e => setListingPrice(e.target.value)}
                placeholder="0.00"
                style={{ background: "oklch(0.10 0.01 240)", border: "1px solid oklch(0.22 0.02 240)", color: "oklch(0.90 0.01 240)" }}
              />
              <p className="text-xs mt-1" style={{ color: "oklch(0.40 0.02 240)" }}>2% marketplace fee goes to DAO treasury</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowListModal(false)} className="flex-1" style={{ borderColor: "oklch(0.25 0.02 240)", color: "oklch(0.70 0.02 240)" }}>Cancel</Button>
              <Button
                onClick={() => listAsset.mutate({ assetType: "card", assetId: listingAssetId!, askPrice: listingPrice })}
                disabled={!listingAssetId || !listingPrice || listAsset.isPending}
                className="flex-1"
                style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}
              >
                {listAsset.isPending ? "Listing..." : "List Card"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

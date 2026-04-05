import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ReactNode, useState } from "react";
import {
  Wallet,
  Layers,
  ShieldCheck,
  Store,
  Vote,
  LayoutGrid,
  Activity,
  Zap,
  Menu,
  X,
  LogOut,
  LogIn,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const navItems = [
  { href: "/", label: "Home", icon: Zap },
  { href: "/wallet", label: "Wallet / SBT", icon: Wallet },
  { href: "/mint", label: "Mint Card", icon: Layers },
  { href: "/slabs", label: "Smart Slab", icon: ShieldCheck },
  { href: "/verify", label: "Verify", icon: ShieldCheck },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/collection", label: "Collection", icon: LayoutGrid },
  { href: "/dao", label: "DAO / Gov", icon: Vote },
  { href: "/explorer", label: "Explorer", icon: Activity },
];

export default function NavLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
    onError: () => toast.error("Logout failed"),
  });

  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.08 0.01 240)" }}>
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `} style={{ background: "oklch(0.09 0.012 240)", borderRight: "1px solid oklch(0.20 0.02 240)" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: "1px solid oklch(0.18 0.02 240)" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))" }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.01 240)" }}>SCN</div>
            <div className="text-xs" style={{ color: "oklch(0.50 0.02 240)" }}>Layer 1 Blockchain</div>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" style={{ color: "oklch(0.55 0.02 240)" }} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/" && location.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150
                  ${active
                    ? "text-white"
                    : "hover:bg-white/5"
                  }
                `} style={active ? {
                  background: "oklch(0.72 0.18 200 / 0.15)",
                  color: "oklch(0.72 0.18 200)",
                  border: "1px solid oklch(0.72 0.18 200 / 0.2)",
                } : { color: "oklch(0.60 0.02 240)" }}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                  {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid oklch(0.18 0.02 240)" }}>
          {loading ? (
            <div className="h-10 rounded-lg animate-pulse" style={{ background: "oklch(0.14 0.015 240)" }} />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white" }}>
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: "oklch(0.90 0.01 240)" }}>{user.name || "User"}</div>
                <div className="text-xs truncate" style={{ color: "oklch(0.50 0.02 240)" }}>{user.email || "Connected"}</div>
              </div>
              <button onClick={() => logout.mutate()} className="p-1.5 rounded-md transition-colors hover:bg-white/10" style={{ color: "oklch(0.55 0.02 240)" }}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="w-full gap-2" size="sm" style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.22 280))", color: "white", border: "none" }}>
                <LogIn className="w-4 h-4" />
                Connect Wallet
              </Button>
            </a>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30" style={{ background: "oklch(0.09 0.012 240 / 0.95)", borderBottom: "1px solid oklch(0.18 0.02 240)", backdropFilter: "blur(12px)" }}>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg" style={{ color: "oklch(0.70 0.02 240)" }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.72 0.18 200)" }}>SCN Blockchain</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

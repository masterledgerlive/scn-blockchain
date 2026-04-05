import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import WalletPage from "./pages/WalletPage";
import MintCardPage from "./pages/MintCardPage";
import SlabPage from "./pages/SlabPage";
import VerifyPage from "./pages/VerifyPage";
import MarketplacePage from "./pages/MarketplacePage";
import DAOPage from "./pages/DAOPage";
import CollectionPage from "./pages/CollectionPage";
import ExplorerPage from "./pages/ExplorerPage";
import NavLayout from "./components/NavLayout";

function Router() {
  return (
    <NavLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/wallet" component={WalletPage} />
        <Route path="/mint" component={MintCardPage} />
        <Route path="/slabs" component={SlabPage} />
        <Route path="/verify" component={VerifyPage} />
        <Route path="/marketplace" component={MarketplacePage} />
        <Route path="/dao" component={DAOPage} />
        <Route path="/collection" component={CollectionPage} />
        <Route path="/explorer" component={ExplorerPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </NavLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster theme="dark" position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

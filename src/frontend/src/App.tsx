import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Package, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { LoginPage } from "./components/LoginPage";
import { ProfileSetupModal } from "./components/ProfileSetupModal";
import { SoldTab } from "./components/SoldTab";
import { StockTab } from "./components/StockTab";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";

const queryClient = new QueryClient();

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const [activeTab, setActiveTab] = useState<"stock" | "sold">("stock");

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <ProfileSetupModal open={showProfileSetup} />

      {/* Sub-navigation */}
      <div className="bg-accent/40 border-b border-border sticky top-16 z-30">
        <div className="container mx-auto px-6">
          <div className="flex gap-1 py-3">
            <button
              type="button"
              data-ocid="nav.tab"
              onClick={() => setActiveTab("stock")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === "stock"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              <Package className="w-4 h-4" />
              STOCK
            </button>
            <button
              type="button"
              data-ocid="nav.tab"
              onClick={() => setActiveTab("sold")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === "sold"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              SOLD
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
              {activeTab === "stock" ? "Active Stock" : "Sales History"}
            </h2>
            {activeTab === "stock" ? <StockTab /> : <SoldTab />}
          </motion.div>
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

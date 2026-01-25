import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TenantProvider } from "@/contexts/TenantContext";
import { useFavicon } from "@/hooks/useFavicon";
import { useBrandColors } from "@/hooks/useBrandColors";
import { useTrackingScripts } from "@/hooks/useTrackingScripts";
import { useAutoPageTracking } from "@/hooks/usePageTracking";
import { initializeTenant } from "@/hooks/useSupabaseData";
import ScrollToTop from "@/components/ScrollToTop";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { PublicTenantGate } from "@/components/tenant/PublicTenantGate";
import { Loader2 } from "lucide-react";

// Public Pages
import Index from "./pages/Index";
import PropertyPage from "./pages/PropertyPage";
import PropertiesPage from "./pages/PropertiesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FavoritesPage from "./pages/FavoritesPage";
import LocationPage from "./pages/LocationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to apply favicon, brand colors, tracking scripts, and page tracking
const BrandManager = () => {
  useFavicon();
  useBrandColors();
  useTrackingScripts();
  useAutoPageTracking();
  return null;
};

const App = () => {
  const [tenantReady, setTenantReady] = useState(false);

  useEffect(() => {
    initializeTenant().then(() => setTenantReady(true));
  }, []);

  if (!tenantReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <TenantProvider>
            <PublicTenantGate>
              <BrandManager />
              <AppErrorBoundary>
                <Routes>
                  {/* Public Routes Only */}
                  <Route path="/" element={<Index />} />
                  <Route path="/imoveis" element={<PropertiesPage />} />
                  <Route path="/imoveis/localizacao" element={<LocationPage />} />
                  <Route path="/imovel/:slug" element={<PropertyPage />} />
                  <Route path="/sobre" element={<AboutPage />} />
                  <Route path="/contato" element={<ContactPage />} />
                  <Route path="/favoritos" element={<FavoritesPage />} />
                  
                  {/* Any admin route redirects to 404 */}
                  <Route path="/admin/*" element={<NotFound />} />
                  
                  {/* Catch-all 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <FloatingWhatsApp />
              </AppErrorBoundary>
            </PublicTenantGate>
          </TenantProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

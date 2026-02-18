import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VirtualTryOn from "./pages/VirtualTryOn";
import ProductDetail from "./pages/ProductDetail";
import AIPhotoshoot from "./pages/AIPhotoshoot";
import NotFound from "./pages/NotFound";
import Tryon from "@/pages/Tryon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/virtual-tryon" element={<VirtualTryOn />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/ai-photoshoot" element={<AIPhotoshoot />} />
          <Route path="/tryon" element={<Tryon />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
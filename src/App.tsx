
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ImportTypeSelection from "./pages/ImportTypeSelection";
import ImportUpload from "./pages/ImportUpload";
import FileVerification from "./pages/FileVerification";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/import-wizard" element={<ImportTypeSelection />} />
          <Route path="/import-wizard/upload" element={<ImportUpload />} />
          <Route path="/import-wizard/verification" element={<FileVerification />} />
          <Route path="/import-wizard/column-mapping" element={<NotFound />} /> {/* Adding a new route that will link to NotFound until we implement it */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

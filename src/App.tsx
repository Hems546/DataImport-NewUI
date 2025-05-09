
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InstructionProvider } from "./contexts/InstructionContext";
import InstructionManager from "./components/instructions/InstructionManager";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ImportTypeSelection from "./pages/ImportTypeSelection";
import ImportUpload from "./pages/ImportUpload";
import FileVerification from "./pages/FileVerification";
import ColumnMapping from "./pages/ColumnMapping";
import DataQuality from "./pages/DataQuality";
import DataNormalization from "./pages/DataNormalization";
import Deduplication from "./pages/Deduplication";
import FinalReview from "./pages/FinalReview";
import ImportPush from "./pages/ImportPush";
import AdminDashboard from "./pages/AdminDashboard";
import FileHistoryDetails from "./pages/FileHistoryDetails"; 
import FileHistory from "./pages/FileHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <InstructionProvider>
        <Toaster />
        <Sonner />
        <InstructionManager />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/import-wizard" element={<ImportTypeSelection />} />
            <Route path="/import-wizard/upload" element={<ImportUpload />} />
            <Route path="/import-wizard/verification" element={<FileVerification />} />
            <Route path="/import-wizard/column-mapping" element={<ColumnMapping />} />
            <Route path="/import-wizard/data-quality" element={<DataQuality />} />
            <Route path="/import-wizard/normalization" element={<DataNormalization />} />
            <Route path="/import-wizard/deduplication" element={<Deduplication />} />
            <Route path="/import-wizard/review" element={<FinalReview />} />
            <Route path="/import-wizard/import" element={<ImportPush />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/file-history" element={<FileHistory />} />
            <Route path="/file-history/:fileId" element={<FileHistoryDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </InstructionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

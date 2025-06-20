import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { InstructionProvider } from "./contexts/InstructionContext";
import { ImportProvider } from "./contexts/ImportContext";
import InstructionManager from "./components/instructions/InstructionManager";
import { Loading } from "@/components/ui/loading";

// Lazy load all page components
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ImportTypeSelection = lazy(() => import("./pages/ImportTypeSelection"));
const ImportUpload = lazy(() => import("./pages/ImportUpload"));
const FileVerification = lazy(() => import("./pages/FileVerification"));
const ColumnMapping = lazy(() => import("./pages/ColumnMapping"));
const DataQuality = lazy(() => import("./pages/DataQuality"));
const DataNormalization = lazy(() => import("./pages/DataNormalization"));
const Deduplication = lazy(() => import("./pages/Deduplication"));
const FinalReview = lazy(() => import("./pages/FinalReview"));
const ImportPush = lazy(() => import("./pages/ImportPush"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const FileHistoryDetails = lazy(() => import("./pages/FileHistoryDetails"));
const FileHistory = lazy(() => import("./pages/FileHistory"));
const ContextDocument = lazy(() => import("./pages/ContextDocument"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <InstructionProvider>
        <ImportProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/newui">
            <InstructionManager />
            <Suspense fallback={<Loading message="Loading page..." size="lg" className="min-h-screen" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/import-wizard" element={<ImportTypeSelection />} />
                <Route path="/import-wizard/upload" element={<ImportUpload />} />
                <Route path="/import-wizard/column-mapping" element={<ColumnMapping />} />
                <Route path="/import-wizard/verification" element={<FileVerification />} />
                <Route path="/import-wizard/data-quality" element={<DataQuality />} />
                <Route path="/import-wizard/normalization" element={<DataNormalization />} />
                <Route path="/import-wizard/deduplication" element={<Deduplication />} />
                <Route path="/import-wizard/review" element={<FinalReview />} />
                <Route path="/import-wizard/import" element={<ImportPush />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/context" element={<ContextDocument />} />
                <Route path="/file-history" element={<FileHistory />} />
                <Route path="/file-history/:fileId" element={<FileHistoryDetails />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ImportProvider>
      </InstructionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

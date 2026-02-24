import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";
import ProfileSetup from "./pages/ProfileSetup";
import ContextChat from "./pages/ContextChat";
import DayPlan from "./pages/DayPlan";
import SafeMode from "./pages/SafeMode";
import Documents from "./pages/Documents";
import AdminTaskPlans from "./pages/AdminTaskPlans";
import AdminCommunications from "./pages/AdminCommunications";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import People from "./pages/People";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ContextChat />} />
            <Route path="/day-plan" element={<DayPlan />} />
            <Route path="/safe-mode" element={<SafeMode />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/admin/task-plans" element={<AdminTaskPlans />} />
            <Route path="/admin/communications" element={<AdminCommunications />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/people" element={<People />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

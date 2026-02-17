import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import ContextChat from "./pages/ContextChat";
import DayPlan from "./pages/DayPlan";
import SafeMode from "./pages/SafeMode";
import Documents from "./pages/Documents";
import UserManagement from "./pages/UserManagement";
import AdminTaskPlans from "./pages/AdminTaskPlans";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ContextChat />} />
            <Route path="/day-plan" element={<DayPlan />} />
            <Route path="/safe-mode" element={<SafeMode />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/task-plans" element={<AdminTaskPlans />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

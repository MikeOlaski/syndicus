import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Coaches from "./pages/Coaches";
import Syndic8 from "./pages/Syndic8";
import CreateClaim from "./pages/CreateClaim";
import SubscriberDashboard from "./pages/SubscriberDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import CoachProfile from "./pages/CoachProfile";
import ChatHome from "./pages/ChatHome";
import ChatActive from "./pages/ChatActive";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import SuccessStories from "./pages/SuccessStories";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/syndic8" element={<Syndic8 />} />
          <Route path="/create-claim" element={<CreateClaim />} />
          <Route path="/coach-dashboard" element={<CoachDashboard />} />
          <Route path="/coach-dashboard/chat" element={<ChatPage role="coach" />} />
          <Route path="/subscriber-dashboard" element={<SubscriberDashboard />} />
          <Route path="/subscriber-dashboard/chat" element={<ChatPage role="subscriber" />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-dashboard/chat" element={<ChatPage role="admin" />} />
          <Route path="/coach/:coachId" element={<CoachProfile />} />
          <Route path="/coach/:coachId/chat" element={<ChatHome />} />
          <Route path="/coach/:coachId/chat/active" element={<ChatActive />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Coaches from "./pages/Coaches";
import Syndic8 from "./pages/Syndic8";
import CreateClaim from "./pages/CreateClaim";
import SubscriberDashboard from "./pages/SubscriberDashboard";
import SubscriberOnboarding from "./pages/SubscriberOnboarding";
import CoachDashboard from "./pages/CoachDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCoaches from "./pages/AdminCoaches";
import AdminSubscribers from "./pages/AdminSubscribers";
import AdminWebhooks from "./pages/AdminWebhooks";
import AdminTemplates from "./pages/AdminTemplates";
import ChatPage from "./pages/ChatPage";
import MyTwin from "./pages/MyTwin";
import Conversations from "./pages/Conversations";
import CoachProfile from "./pages/CoachProfile";
import ChatHome from "./pages/ChatHome";
import ChatActive from "./pages/ChatActive";
import CoachRedirect from "./pages/CoachRedirect";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import SuccessStories from "./pages/SuccessStories";
import Help from "./pages/Help";
import Support from "./pages/Support";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Directory from "./pages/Directory";
import CoachProfileSetup from "./pages/CoachProfileSetup";
import CoachSubscribers from "./pages/CoachSubscribers";
import CoachTemplates from "./pages/CoachTemplates";
import SubscriberCoaches from "./pages/SubscriberCoaches";
import SubscriberProfile from "./pages/SubscriberProfile";

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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/syndic8" element={<Syndic8 />} />
          <Route path="/create-claim" element={<CreateClaim />} />
          <Route path="/coach-dashboard" element={<CoachDashboard />} />
          <Route path="/coach-dashboard/chat" element={<ChatPage role="coach" />} />
          <Route path="/coach-dashboard/my-twin" element={<MyTwin />} />
          <Route path="/coach-dashboard/conversations" element={<Conversations />} />
          <Route path="/coach-dashboard/profile" element={<CoachProfileSetup />} />
          <Route path="/coach-dashboard/subscribers" element={<CoachSubscribers />} />
          <Route path="/coach-dashboard/templates" element={<CoachTemplates />} />
          <Route path="/subscriber-onboarding" element={<SubscriberOnboarding />} />
          <Route path="/subscriber-dashboard" element={<SubscriberDashboard />} />
          <Route path="/subscriber-dashboard/coaches" element={<SubscriberCoaches />} />
          <Route path="/subscriber-dashboard/chat" element={<ChatPage role="subscriber" />} />
          <Route path="/subscriber-dashboard/profile" element={<SubscriberProfile />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-dashboard/coaches" element={<AdminCoaches />} />
          <Route path="/admin-dashboard/subscribers" element={<AdminSubscribers />} />
          <Route path="/admin-dashboard/templates" element={<AdminTemplates />} />
          <Route path="/admin-dashboard/webhooks" element={<AdminWebhooks />} />
          <Route path="/admin-dashboard/chat" element={<ChatPage role="admin" />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/help" element={<Help />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/directory" element={<Directory />} />
          {/* Legacy coach routes - redirect to new slug-based URLs */}
          <Route path="/coach/:coachId" element={<CoachRedirect />} />
          <Route path="/coach/:coachId/chat" element={<CoachRedirect />} />
          <Route path="/coach/:coachId/chat/active" element={<CoachRedirect />} />
          {/* Root-level coach routes - MUST be after all static routes */}
          <Route path="/:coachSlug" element={<CoachProfile />} />
          <Route path="/:coachSlug/chat" element={<ChatHome />} />
          <Route path="/:coachSlug/chat/active" element={<ChatActive />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { DashboardLayout } from "@/components/DashboardLayout";
import { ChatInterface } from "@/components/ChatInterface";

interface ChatPageProps {
  role?: "subscriber" | "coach" | "admin";
}

const ChatPage = ({ role }: ChatPageProps) => {
  const systemPrompts = {
    subscriber: "You are a helpful AI assistant for Syndic.us subscribers. Help them find coaches, manage subscriptions, and answer questions about the platform.",
    coach: "You are an AI assistant for Syndic.us coaches. Help them manage their digital twin, track subscribers, and optimize their coaching profile.",
    admin: "You are a system administrator AI for Syndic.us. Help manage coaches, subscribers, and system operations.",
  };

  return (
    <DashboardLayout requiredRole={role}>
      <div className="h-[calc(100vh-3.5rem)]">
        <ChatInterface 
          systemPrompt={role ? systemPrompts[role] : systemPrompts.subscriber}
          placeholder="Ask me anything..."
        />
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;

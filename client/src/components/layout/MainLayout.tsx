import { useState } from "react";
import { TabNavigation } from "./TabNavigation";
import { AIChatAssistant } from "../chat/AIChatAssistant";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TabNavigation />
      
      <main className="flex-1 flex">
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        
        {isChatOpen && (
          <AIChatAssistant onClose={() => setIsChatOpen(false)} />
        )}
      </main>
    </div>
  );
}

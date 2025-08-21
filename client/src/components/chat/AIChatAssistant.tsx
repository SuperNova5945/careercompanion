import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@/lib/types";

interface AIChatAssistantProps {
  onClose: () => void;
}

const quickActions = [
  {
    id: "resume-review",
    title: "Review my resume",
    description: "Get AI-powered improvement suggestions",
    bgColor: "bg-blue-50",
    textColor: "text-blue-900",
    subTextColor: "text-blue-700",
    hoverColor: "hover:bg-blue-100",
  },
  {
    id: "interview-prep",
    title: "Prep for Google interview",
    description: "Get customized interview questions",
    bgColor: "bg-green-50",
    textColor: "text-green-900",
    subTextColor: "text-green-700",
    hoverColor: "hover:bg-green-100",
  },
  {
    id: "skill-gap",
    title: "Skill gap analysis",
    description: "Identify skills to improve for target roles",
    bgColor: "bg-purple-50",
    textColor: "text-purple-900",
    subTextColor: "text-purple-700",
    hoverColor: "hover:bg-purple-100",
  },
];

export function AIChatAssistant({ onClose }: AIChatAssistantProps) {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    message: string;
    response: string;
    isUser: boolean;
  }>>([]);
  const { toast } = useToast();

  const { data: chatHistory } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/history"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, type }: { message: string; type?: string }) => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        type,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      const newMessage = {
        id: Date.now().toString(),
        message: variables.message,
        response: data.response,
        isUser: true,
      };
      setChatMessages(prev => [...prev, newMessage]);
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({ message });
  };

  const handleQuickAction = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (action) {
      sendMessageMutation.mutate({ 
        message: action.title,
        type: actionId.replace('-', '_')
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col" data-testid="ai-chat-assistant">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-primary-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
              <i className="fas fa-robot text-white text-sm"></i>
            </div>
            <h3 className="font-medium text-gray-900">Career Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            data-testid="button-close-chat"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Your AI-powered career advisor</p>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 space-y-4">
        {/* Welcome Message */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <i className="fas fa-robot text-white text-xs"></i>
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-900">Hi Chenkai! I'm here to help with your career journey. I can assist with:</p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• Resume optimization</li>
                <li>• Job search strategy</li>
                <li>• Interview preparation</li>
                <li>• Skill development planning</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        {chatMessages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {/* User Message */}
            <div className="flex items-start space-x-3 justify-end">
              <div className="bg-primary-600 text-white rounded-lg p-3 max-w-xs">
                <p className="text-sm">{msg.message}</p>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-gray-600 text-xs"></i>
              </div>
            </div>
            {/* AI Response */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-white text-xs"></i>
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-900 whitespace-pre-line">{msg.response}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Message */}
        {sendMessageMutation.isPending && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-white text-xs"></i>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-900">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Thinking...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {chatMessages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick Actions</p>
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className={`w-full text-left p-3 ${action.bgColor} rounded-lg ${action.hoverColor} transition-colors`}
                data-testid={`quick-action-${action.id}`}
              >
                <div className={`text-sm font-medium ${action.textColor}`}>{action.title}</div>
                <div className={`text-xs ${action.subTextColor}`}>{action.description}</div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Chat Input */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Ask me anything about your career..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 text-sm"
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="sm"
            data-testid="button-send-message"
          >
            <i className="fas fa-paper-plane text-sm"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}

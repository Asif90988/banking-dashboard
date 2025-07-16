"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import SectionCard from "./SectionCard";

interface ChatMessage {
  type: "user" | "bot";
  message: string;
  timestamp: string;
  error?: boolean;
}

interface ChatbotResponse {
  response: string;
  conversationId: string;
  timestamp: string;
  error?: boolean;
}

export default function ChatbotSection() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const timestamp = new Date().toISOString();
    
    const newChat: ChatMessage = { 
      type: "user", 
      message: userMessage, 
      timestamp 
    };
    
    setChatLog(prev => [...prev, newChat]);
    setInput("");
    setLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      const response = await fetch(`${API_BASE}/chatbot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          conversationId: conversationId 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatbotResponse = await response.json();

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const botMessage: ChatMessage = {
        type: "bot",
        message: data.response || "I'm sorry, I couldn't generate a response.",
        timestamp: data.timestamp,
        error: data.error
      };

      setChatLog(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: ChatMessage = {
        type: "bot",
        message: "I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString(),
        error: true
      };
      setChatLog(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SectionCard title="💬 Chat with RegInsight Assistant">
      <div className="flex flex-col gap-3">
        <div className="bg-gray-50 border rounded-lg p-4 h-80 overflow-y-auto">
          {chatLog.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="mb-2">👋 Hi! I'm your RegInsight Assistant</div>
              <div className="text-sm">Ask me about budgets, projects, compliance, or risks.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {chatLog.map((entry, i) => (
                <div
                  key={i}
                  className={`flex ${entry.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      entry.type === "user"
                        ? "bg-blue-600 text-white"
                        : entry.error
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <div className="text-sm leading-relaxed">{entry.message}</div>
                    <div className={`text-xs mt-1 ${
                      entry.type === "user" ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg max-w-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">Typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ask about budgets, projects, compliance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Ask about budget allocations, project statuses, compliance metrics, or operational risks
        </div>
      </div>
    </SectionCard>
  );
}

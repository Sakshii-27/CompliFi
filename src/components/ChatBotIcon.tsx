"use client";
import React, { useState, useEffect } from 'react';
import { MessageCircle, Bot, Sparkles, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  timestamp: number;
  isUser: boolean;
}

interface ChatBotIconProps {
  className?: string;
}

const ChatBotIcon: React.FC<ChatBotIconProps> = ({ className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('complifi-chat-history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
        
        // Check for unread messages (messages from last 5 minutes)
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const recentMessages = parsedHistory.filter((msg: ChatMessage) => 
          !msg.isUser && msg.timestamp > fiveMinutesAgo
        );
        setHasUnreadMessages(recentMessages.length > 0);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('complifi-chat-history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleChatBotClick = () => {
    // Mark messages as read
    setHasUnreadMessages(false);
    // Navigate to internal chatbot page
    try {
      if (typeof window !== 'undefined') {
        const isBlocked = (p: string | null) => {
          if (!p) return true;
          if (p.startsWith('/chatbot')) return true;
          const pattern = /(scan|scanning|check|checking|analyz|processing|progress)/i;
          return pattern.test(p);
        };
        const current = window.location.pathname;
        const raw = sessionStorage.getItem('complifi-path-history');
        let fallback = current;
        if (raw) {
          try {
            const arr: string[] = JSON.parse(raw);
            for (let i = arr.length - 1; i >= 0; i--) {
              const p = arr[i];
              if (!isBlocked(p) && p !== current) { fallback = p; break; }
            }
          } catch {}
        }
        sessionStorage.setItem('complifi-last-path', fallback);
      }
    } catch {}
    window.location.href = '/chatbot';
  };

  const getLastMessage = () => {
    if (chatHistory.length === 0) return "Start a conversation with CompliFi AI";
    const lastMessage = chatHistory[chatHistory.length - 1];
    return lastMessage.message.length > 50 
      ? lastMessage.message.substring(0, 50) + "..." 
      : lastMessage.message;
  };

  const getLastMessageTime = () => {
    if (chatHistory.length === 0) return "";
    const lastMessage = chatHistory[chatHistory.length - 1];
    const now = Date.now();
    const diff = now - lastMessage.timestamp;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Chat Preview Tooltip */}
      {showPreview && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-gray-900 border border-emerald-500/30 rounded-xl p-4 shadow-2xl backdrop-blur-sm z-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-black" />
              </div>
              <span className="text-white font-medium">CompliFi AI Assistant</span>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-300">
              {getLastMessage()}
            </div>
            {getLastMessageTime() && (
              <div className="text-xs text-gray-500">
                {getLastMessageTime()}
              </div>
            )}
          </div>
          
          <button
            onClick={handleChatBotClick}
            className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all duration-200"
          >
            Open Chat
          </button>
        </div>
      )}

      {/* Main ChatBot Icon */}
      <button
        onClick={handleChatBotClick}
        onMouseEnter={() => {
          setIsHovered(true);
          setShowPreview(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setTimeout(() => setShowPreview(false), 300); // Delay to allow hover over preview
        }}
        className="group relative w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-110"
      >
        {/* Pulsing ring animation */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-ping opacity-20"></div>
        
        {/* Sparkle effect on hover */}
        {isHovered && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <Sparkles className="absolute top-1 right-1 w-3 h-3 text-white animate-pulse" />
            <Sparkles className="absolute bottom-1 left-1 w-2 h-2 text-white animate-pulse delay-150" />
          </div>
        )}
        
        {/* Main icon */}
        <div className="relative z-10 flex items-center justify-center">
          {isHovered ? (
            <Bot className="w-6 h-6 text-white transition-all duration-200" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white transition-all duration-200" />
          )}
        </div>
        
        {/* Notification badge */}
        {hasUnreadMessages && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
        
        {/* Floating status indicator */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-gray-900 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </button>
      
      {/* Floating label */}
      {isHovered && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded border border-emerald-500/30 whitespace-nowrap">
          CompliFi AI Assistant
        </div>
      )}
    </div>
  );
};

export default ChatBotIcon;

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Plus,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  Train,
  Sparkles,
  User,
  Bot,
  Loader2,
  AlertCircle,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import chatService from '@/services/chatService';

// --- Constants & Theme ---
const COLORS = {
  primary: '#4E4E94',
  primaryLight: 'rgba(78,78,148,0.1)',
  primaryMedium: 'rgba(78,78,148,0.3)',
  success: '#28C840',
  warning: '#FEBC2E',
  danger: '#FF5F57',
  background: '#FFFFFF',
  foreground: '#1A1A2E',
  muted: '#4A4A6A',
  surface: '#F5F5FF',
};

const getPriorityColor = (priority) => {
  if (priority >= 80) return COLORS.danger;
  if (priority >= 60) return COLORS.warning;
  return COLORS.success;
};

const StatusBadge = ({ status }) => {
  const statusColors = {
    received: '#6366f1',
    assigned: '#3b82f6',
    working_on: '#f59e0b',
    hold: '#64748b',
    pending_info: '#8b5cf6',
    escalated: '#ef4444',
    resolved: '#10b981',
    closed: '#6b7280',
    rejected: '#dc2626'
  };
  const color = statusColors[status] || '#6b7280';
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {status?.replace('_', ' ') || 'N/A'}
    </span>
  );
};

// Source card for showing matched complaints from Pinecone
const SourceCard = ({ source, index }) => (
  <div
    className="rounded-xl border border-[rgba(78,78,148,0.12)] bg-white p-3 text-xs flex flex-col gap-1.5 shadow-sm"
    style={{ borderLeft: `3px solid ${getPriorityColor(source.priority)}` }}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="font-semibold text-[#1A1A2E] truncate">
        #{index + 1} · {source.category || 'General'}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        {source.status && <StatusBadge status={source.status} />}
        {source.priority !== undefined && (
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: getPriorityColor(source.priority) }}
          >
            {source.priority}%
          </span>
        )}
      </div>
    </div>
    <p className="text-[#4A4A6A] line-clamp-2 leading-relaxed">{source.description}</p>
    {(source.train || source.station) && (
      <div className="flex items-center gap-1.5 text-[10px] text-[#4A4A6A]">
        <Train size={10} />
        <span>{[source.train, source.station].filter(Boolean).join(' · ')}</span>
      </div>
    )}
  </div>
);

export default function ChatPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auth Check
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/chat');
    }
  }, [authLoading, isAuthenticated, router]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // 🔌 Real API call to backend RAG endpoint
      const { answer, sources } = await chatService.sendMessage(userMsg.content);

      const botResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        sources: sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);

      // Add to session history (first message sets title)
      if (messages.length === 0) {
        const newSession = {
          id: Date.now().toString(),
          title: userMsg.content.slice(0, 35) + (userMsg.content.length > 35 ? '...' : ''),
          date: new Date(),
          preview: userMsg.content,
        };
        setChatHistory((prev) => [newSession, ...prev]);
        setActiveChatId(newSession.id);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to get a response. Please try again.';
      setError(errMsg);
      // Add error message as assistant message so it shows inline
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: null,
          error: errMsg,
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setInputValue('');
    setError(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const loadChat = (id) => {
    setActiveChatId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5FF]">
        <div className="animate-pulse flex flex-col items-center">
          <Train size={48} className="text-[#4E4E94] mb-4" />
          <p className="text-[#4A4A6A]">Initializing RailMind AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F5F5FF] overflow-hidden font-sans text-[#1A1A2E]">

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 300 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="h-full bg-white border-r border-[rgba(78,78,148,0.15)] flex flex-col z-30 absolute md:relative shadow-2xl md:shadow-none overflow-hidden"
      >
        <div className="p-4 flex items-center justify-between border-b border-[rgba(78,78,148,0.1)]">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight" style={{ color: COLORS.primary }}>
            <div className="p-1.5 rounded-lg bg-[rgba(78,78,148,0.1)]">
              <Train size={20} />
            </div>
            RailMind
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[rgba(78,78,148,0.2)] hover:bg-[rgba(78,78,148,0.05)] transition-all font-semibold text-sm"
            style={{ color: COLORS.foreground }}
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {chatHistory.length > 0 && (
            <div className="text-xs font-semibold text-[#4A4A6A] px-3 py-2 uppercase tracking-wider">Recent</div>
          )}
          {chatHistory.map((chat) => (
            <button
              key={chat.id}
              onClick={() => loadChat(chat.id)}
              className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all group ${
                activeChatId === chat.id
                  ? 'bg-[rgba(78,78,148,0.1)] border border-[rgba(78,78,148,0.2)]'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <MessageSquare size={16} className="mt-1 text-[#4A4A6A] shrink-0" />
              <div className="overflow-hidden">
                <div className="text-sm font-medium truncate text-[#1A1A2E]">{chat.title}</div>
                <div className="text-xs text-[#4A4A6A] truncate">{chat.preview}</div>
              </div>
            </button>
          ))}

          {chatHistory.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-[#4A4A6A]">
              <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
              No chats yet. Start a conversation!
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[rgba(78,78,148,0.1)]">
          <div className="bg-gradient-to-br from-[#F5F5FF] to-white p-4 rounded-xl border border-[rgba(78,78,148,0.15)]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[#4E4E94]" />
              <span className="text-xs font-bold text-[#4E4E94]">Pro Tip</span>
            </div>
            <p className="text-xs text-[#4A4A6A] leading-relaxed">
              Ask me about train delays, priority complaints, or station analytics.
            </p>
          </div>
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative min-w-0">

        {/* Header */}
        <header className="h-16 border-b border-[rgba(78,78,148,0.1)] bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <ChevronRight size={20} className="rotate-180" /> : <Menu size={20} />}
            </button>
            <h1 className="font-semibold text-lg hidden md:block">
              {activeChatId ? 'Conversation' : 'RailMind Assistant'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(78,78,148,0.05)] border border-[rgba(78,78,148,0.1)]">
              <div className="w-2 h-2 rounded-full bg-[#28C840] animate-pulse" />
              <span className="text-xs font-medium text-[#4A4A6A]">AI Online · RAG Powered</span>
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-[#F5F5FF] relative">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 border border-[rgba(78,78,148,0.1)]"
              >
                <Bot size={40} className="text-[#4E4E94]" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-[#1A1A2E]">How can I help you today?</h2>
              <p className="text-[#4A4A6A] max-w-md mb-2">
                I analyze your live complaint database using AI. Ask me anything about train issues, priorities, or station status.
              </p>
              <p className="text-[10px] text-[#4A4A6A]/60 mb-8">Powered by Gemini · Pinecone RAG</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  "Show me the highest priority complaints right now",
                  "What are the most common complaint categories?",
                  "Summarize recent security or safety issues",
                  "Which trains have the most unresolved complaints?"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(suggestion)}
                    className="p-4 rounded-xl bg-white border border-[rgba(78,78,148,0.15)] hover:border-[#4E4E94] hover:shadow-md transition-all text-left text-sm text-[#1A1A2E]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-[#4E4E94] text-white'
                      : msg.error
                        ? 'bg-red-100 text-red-500'
                        : 'bg-white border border-[rgba(78,78,148,0.2)] text-[#4E4E94]'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : msg.error ? <AlertCircle size={16} /> : <Bot size={16} />}
                  </div>

                  <div className={`max-w-[85%] md:max-w-[75%] flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Main message bubble */}
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#4E4E94] text-white rounded-tr-none'
                        : msg.error
                          ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-none'
                          : 'bg-white text-[#1A1A2E] border border-[rgba(78,78,148,0.1)] rounded-tl-none'
                    }`}>
                      {msg.error ? (
                        <div className="flex items-center gap-2">
                          <AlertCircle size={14} />
                          <span>{msg.error}</span>
                        </div>
                      ) : (
                        // Render newlines in AI response
                        msg.content?.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < msg.content.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))
                      )}
                    </div>

                    {/* Source documents (only for assistant messages with sources) */}
                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                      <div className="w-full">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#4A4A6A] mb-2 px-1">
                          <FileText size={10} />
                          <span>{msg.sources.length} RELEVANT COMPLAINT{msg.sources.length > 1 ? 'S' : ''} FOUND</span>
                          <TrendingUp size={10} className="ml-auto" />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.sources.map((src, i) => (
                            <SourceCard key={src.id || i} source={src} index={i} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-[rgba(78,78,148,0.2)] text-[#4E4E94] flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-[rgba(78,78,148,0.1)] p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#4E4E94]" />
                    <span className="text-xs text-[#4A4A6A]">RailMind is searching your complaint database...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[rgba(78,78,148,0.1)] shrink-0">
          <div className="max-w-4xl mx-auto relative">
            <div className="relative flex items-end bg-[#F5F5FF] rounded-2xl border border-[rgba(78,78,148,0.15)] focus-within:border-[#4E4E94] focus-within:ring-2 focus-within:ring-[rgba(78,78,148,0.1)] transition-all shadow-sm">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about trains, delays, or complaints..."
                rows={1}
                className="w-full bg-transparent py-4 px-5 pr-14 max-h-32 resize-none outline-none text-[#1A1A2E] placeholder:text-[#4A4A6A]/50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
                  inputValue.trim() && !isLoading
                    ? 'bg-[#4E4E94] text-white hover:bg-[#3d3d75] shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="text-center mt-2 text-[10px] text-[#4A4A6A]/60">
              RailMind searches your live complaint database · Powered by Gemini + Pinecone
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
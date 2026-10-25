import {
  Bot,
  Calendar,
  CheckCircle2,
  CornerDownLeft,
  Loader2,
  Send,
  Sparkles,
  User,
  Users,
  Wallet
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { ChatMessage } from '../types';
import { formatINR } from '../utils/currency';

export const AssistantPage: React.FC = () => {
  const { activeEvent } = useEventContext();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      role: 'assistant',
      content: activeEvent
        ? `Hello! I am Planora AI, your context-aware event co-planner. I have fully indexed your event: "${activeEvent.name}" (${activeEvent.type} in ${activeEvent.city}) with a budget of ${formatINR(activeEvent.totalBudget)} for ${activeEvent.guests} guests. How can I assist with your planning today?`
        : 'Hello! I am Planora AI. Create or select an event to begin intelligent contextual planning.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (!activeEvent) return null;

  const totalSpent = (activeEvent.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const tasksCompleted = (activeEvent.tasks || []).filter((t) => t.completed).length;

  const PROMPT_SUGGESTIONS = [
    `Suggest an authentic Bengali wedding menu with both veg & non-veg dishes`,
    `How can I reduce decoration costs by 15% without affecting aesthetics?`,
    `What are the most critical milestones I should complete 30 days before the wedding?`,
    `Review my ₹${(activeEvent.totalBudget / 100000).toFixed(1)} Lakh budget for ${activeEvent.guests} guests in ${activeEvent.city}`
  ];

  const handleSendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.chatAssistant(trimmed, historyPayload, activeEvent);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat Assistant error:', err);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content:
          'I encountered a temporary communication issue with the Gemini service. Please verify your connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-3xl border border-slate-200/80 bg-white shadow-soft-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Active Event Context Header Banner */}
      <div className="border-b border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-600 text-white shadow-soft-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Planora AI Assistant</h2>
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                Gemini 3.8 Flash Contextual
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-md">
              Context: {activeEvent.name} • {activeEvent.city} • {activeEvent.guests} Guests
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Wallet className="h-3.5 w-3.5 text-brand-600" />
            <span>Budget: <strong className="text-slate-900 dark:text-white">{formatINR(activeEvent.totalBudget)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
            <span>Date: <strong className="text-slate-900 dark:text-white">{activeEvent.date}</strong></span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-brand-600 text-white shadow-soft-sm'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-soft-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`mt-1.5 text-[9px] ${
                    isUser ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
              <span>Analyzing event parameters and drafting response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 overflow-x-auto flex gap-2">
        {PROMPT_SUGGESTIONS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            disabled={isLoading}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-400 shrink-0 transition"
          >
            "{chip.substring(0, 48)}..."
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputPrompt);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Ask Planora AI anything about your budget, catering, schedule, or cultural traditions..."
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-soft-sm hover:opacity-95 transition disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

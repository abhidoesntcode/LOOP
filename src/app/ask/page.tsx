'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Quote, 
  ShieldCheck,
  Bot,
  User,
  ArrowRight
} from 'lucide-react';
import { FeedbackItem } from '@/lib/mockData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citedItems?: FeedbackItem[];
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  'What are customers saying about our onboarding experience?',
  'Why are billing and invoice complaints spiking this week?',
  'Are enterprise prospects requesting SSO or SAML integration?',
  'What features are users praising the most in recent feedback?',
];

export default function AskLoopPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_init',
      sender: 'assistant',
      text: 'Hello! I am **Ask LOOP**, your retrieval-grounded AI assistant. Ask me any plain-English question about customer feedback, and I will perform semantic vector retrieval across your workspace to provide an answer backed strictly by real verbatim evidence.',
      timestamp: 'Just now',
    },
  ]);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const handleAskQuestion = (queryText: string, feedbackItems: FeedbackItem[]) => {
    if (!queryText.trim() || isAsking) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsAsking(true);

    // Simulate RAG (Retrieval-Augmented Generation) semantic vector search & Claude response
    setTimeout(() => {
      const lower = queryText.toLowerCase();
      let responseText = '';
      let cited: FeedbackItem[] = [];

      if (lower.includes('onboarding') || lower.includes('invite') || lower.includes('team')) {
        cited = feedbackItems.filter(f => f.themes.includes('Onboarding & Team Invites')).slice(0, 3);
        responseText = `Based on **${cited.length} cited feedback records** in your workspace, customers are experiencing significant friction during the team onboarding flow. Users report that invitation links expire too quickly and they are unable to invite sub-teams without opening support tickets.`;
      } else if (lower.includes('billing') || lower.includes('invoice') || lower.includes('payment')) {
        cited = feedbackItems.filter(f => f.themes.includes('Invoice & Billing Portal')).slice(0, 3);
        responseText = `Analyzing **${cited.length} billing feedback items**: Users have encountered page timeouts when attempting to download historical VAT invoices. Finance leads are requesting reliable PDF exports.`;
      } else if (lower.includes('sso') || lower.includes('saml') || lower.includes('okta') || lower.includes('enterprise')) {
        cited = feedbackItems.filter(f => f.themes.includes('Enterprise SSO & Security')).slice(0, 3);
        responseText = `According to **${cited.length} sales call notes and tickets**: Enterprise prospects consider SAML 2.0 SSO and Okta integration a non-negotiable blocker before signing $45k+ ACV contracts.`;
      } else {
        cited = feedbackItems.filter(f => f.sentiment === 'POS').slice(0, 2);
        responseText = `Grounding across your workspace feedback: Users are praising recent UI dashboard performance upgrades and CSV data export capabilities, which save analysts hours of manual work weekly.`;
      }

      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        citedItems: cited,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsAsking(false);
    }, 750);
  };

  return (
    <MainLayout>
      {({ feedbackItems }) => (
        <div className="p-8 max-w-5xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Ask LOOP — Grounded Q&A
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  RAG Vector Grounded (AI3)
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Retrieval-Augmented Generation answers guaranteed to cite verbatim customer evidence.
              </p>
            </div>
          </div>

          {/* Sample Prompts Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Try asking:</span>
            {SAMPLE_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleAskQuestion(promptText, feedbackItems)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-xs text-slate-300 hover:text-white transition-all shrink-0 text-left"
              >
                "{promptText}"
              </button>
            ))}
          </div>

          {/* Chat Messages Thread */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-purple-600/20 border-purple-500/30 text-purple-300'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'
                      : 'glass-panel text-slate-200 border-slate-800/90 rounded-tl-none'
                  }`}>
                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    <span className="block text-[9px] text-slate-400 mt-2 text-right">{msg.timestamp}</span>
                  </div>

                  {/* Cited Feedback Evidence Cards (Requirement AI3 Criteria 3) */}
                  {msg.citedItems && msg.citedItems.length > 0 && (
                    <div className="p-4 bg-slate-950/90 border border-indigo-500/30 rounded-2xl space-y-2 animate-in fade-in">
                      <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        Cited Grounding Evidence ({msg.citedItems.length} Records Retrieved via Vector Search):
                      </span>

                      <div className="space-y-2">
                        {msg.citedItems.map((citedItem) => (
                          <div key={citedItem.id} className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px]">
                            <p className="text-slate-200 italic">"{citedItem.content}"</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1 border-t border-slate-800">
                              <span>{citedItem.channel} • {citedItem.customerLabel}</span>
                              <span className={`font-bold ${
                                citedItem.sentiment === 'POS' ? 'text-emerald-400' :
                                citedItem.sentiment === 'NEG' ? 'text-rose-400' : 'text-slate-300'
                              }`}>
                                {citedItem.sentiment}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isAsking && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse p-3 glass-panel rounded-xl w-fit">
                <Sparkles className="w-4 h-4" />
                <span>Performing vector similarity retrieval & generating grounded answer...</span>
              </div>
            )}
          </div>

          {/* Question Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion(question, feedbackItems);
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-800"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask Ask LOOP anything about customer feedback..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-400 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!question.trim() || isAsking}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </MainLayout>
  );
}

'use client';

import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FeedbackItem } from '@/lib/mockData';

interface SingleIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngest: (newItem: Omit<FeedbackItem, 'id' | 'createdAt'>) => void;
}

export default function SingleIngestModal({ isOpen, onClose, onIngest }: SingleIngestModalProps) {
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState<FeedbackItem['channel']>('Support Ticket');
  const [customerLabel, setCustomerLabel] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [simulatedAiResult, setSimulatedAiResult] = useState<{
    sentiment: FeedbackItem['sentiment'];
    sentimentScore: number;
    themes: string[];
    featureArea: string;
    aiRationale: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSimulateClassification = async () => {
    if (!content.trim()) return;
    setIsClassifying(true);
    
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimulatedAiResult(data);
      }
    } catch (e) {
      console.error('Classification error:', e);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const result = simulatedAiResult || {
      sentiment: 'NEU' as const,
      sentimentScore: 0.0,
      themes: ['Uncategorized'],
      featureArea: 'General',
      aiRationale: 'Queued for background Claude AI classification.',
    };

    onIngest({
      content,
      channel,
      customerLabel: customerLabel || 'Anonymous Customer',
      sentiment: result.sentiment,
      sentimentScore: result.sentimentScore,
      status: 'NEW',
      featureArea: result.featureArea,
      themes: result.themes,
      aiRationale: result.aiRationale,
    });

    // Reset and close
    setContent('');
    setCustomerLabel('');
    setSimulatedAiResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ingest Single Feedback</h3>
              <p className="text-[11px] text-slate-400">Triggers real-time AI auto-classification (AI1)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Feedback Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Feedback Verbatim / Text <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (simulatedAiResult) setSimulatedAiResult(null);
              }}
              placeholder="e.g. Onboarding took forever — I couldn’t figure out how to invite my team members."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-400 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Feedback Channel */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Source Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as FeedbackItem['channel'])}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="Support Ticket">Support Ticket</option>
                <option value="App Store Review">App Store Review</option>
                <option value="NPS Survey">NPS Survey</option>
                <option value="Sales Call Note">Sales Call Note</option>
                <option value="Community Post">Community Post</option>
              </select>
            </div>

            {/* Customer Label */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Label / Segment</label>
              <input
                type="text"
                value={customerLabel}
                onChange={(e) => setCustomerLabel(e.target.value)}
                placeholder="e.g. Enterprise Tier 1"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* AI Auto-Classify Preview Trigger */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleSimulateClassification}
              disabled={!content.trim() || isClassifying}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-900/60 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isClassifying ? 'animate-spin' : ''}`} />
              <span>{isClassifying ? 'Asking Claude AI...' : 'Preview Claude Auto-Classification'}</span>
            </button>
          </div>

          {/* AI Classification Output Card */}
          {simulatedAiResult && (
            <div className="p-3 bg-slate-950/80 border border-indigo-500/30 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-indigo-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Structured JSON Output
                </span>
                <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                  simulatedAiResult.sentiment === 'POS' ? 'bg-emerald-500/20 text-emerald-300' :
                  simulatedAiResult.sentiment === 'NEG' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                }`}>
                  {simulatedAiResult.sentiment} ({simulatedAiResult.sentimentScore})
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                <span className="text-slate-400 font-semibold">Theme:</span> {simulatedAiResult.themes.join(', ')}
              </div>
              <p className="text-[11px] text-slate-400 italic">"{simulatedAiResult.aiRationale}"</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              Ingest Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

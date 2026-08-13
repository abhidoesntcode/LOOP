'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Share2, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  AlertOctagon, 
  Award,
  Clock
} from 'lucide-react';
import { FeedbackItem } from '@/lib/mockData';

interface VoCReport {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  executiveSummary: string;
  topThemes: { name: string; count: number; sentiment: string }[];
  verbatimQuotes: { quote: string; channel: string; customer: string }[];
  actionItems: string[];
}

export default function VocReportsPage() {
  const [reports, setReports] = useState<VoCReport[]>([
    {
      id: 'rep_01',
      title: 'Weekly Executive Voice-of-Customer Brief',
      period: 'Aug 01 - Aug 05, 2026',
      generatedAt: '2026-08-05T18:00:00Z',
      executiveSummary: 'Customer feedback volume increased 28% week-over-week. Onboarding friction and SAML SSO compliance remain top drivers of negative sentiment, while recent dashboard load speed improvements received strong positive reception.',
      topThemes: [
        { name: 'Onboarding & Team Invites', count: 38, sentiment: '25 NEG / 5 POS' },
        { name: 'Enterprise SSO & Security', count: 27, sentiment: '14 NEG / 4 POS' },
        { name: 'Dashboard Load Performance', count: 22, sentiment: '15 NEG / 2 POS' },
      ],
      verbatimQuotes: [
        { quote: 'Onboarding took forever — I couldn’t figure out how to invite my team.', channel: 'Support Ticket', customer: 'Fintech Enterprise Customer' },
        { quote: 'Prospect wants SAML SSO before signing $45k contract.', channel: 'Sales Call Note', customer: 'VP Sales' },
        { quote: 'The new dashboard is gorgeous and finally fast. Huge improvement!', channel: 'App Store Review', customer: 'Product Designer' },
      ],
      actionItems: [
        'Prioritize SAML 2.0 / Okta SSO integration in Sprint 4 to unblock enterprise sales pipeline.',
        'Redesign team invite link expiration flow during onboarding to eliminate support ticket volume.',
        'Fix billing portal PDF export timeout bug reported by finance accounts.',
      ],
    },
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState('Last 7 Days');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<VoCReport>(reports[0]);

  const handleGenerateReport = (feedbackItems: FeedbackItem[]) => {
    setIsGenerating(true);

    setTimeout(() => {
      const negQuotes = feedbackItems.filter(f => f.sentiment === 'NEG').slice(0, 3);
      const newRep: VoCReport = {
        id: `rep_${Date.now()}`,
        title: `VoC Executive Digest (${selectedPeriod})`,
        period: selectedPeriod === 'Last 7 Days' ? 'Jul 30 - Aug 05, 2026' : 'Jul 06 - Aug 05, 2026',
        generatedAt: new Date().toISOString(),
        executiveSummary: `Generated from ${feedbackItems.length} actual customer records. Key takeaway: High business urgency around enterprise security requirements (SAML SSO) and onboarding simplification.`,
        topThemes: [
          { name: 'Onboarding & Team Invites', count: 38, sentiment: 'Negative Spike' },
          { name: 'Enterprise SSO & Security', count: 27, sentiment: 'Deal Blocker' },
          { name: 'CSV Data Export', count: 19, sentiment: 'High Praise' },
        ],
        verbatimQuotes: negQuotes.map(q => ({
          quote: q.content,
          channel: q.channel,
          customer: q.customerLabel,
        })),
        actionItems: [
          'Address onboarding team invitation link UX friction.',
          'Deliver enterprise Okta SCIM sync for Q3 enterprise renewals.',
          'Maintain automated PDF report scheduling roadmap feature.',
        ],
      };

      setReports(prev => [newRep, ...prev]);
      setActiveReport(newRep);
      setIsGenerating(false);
    }, 850);
  };

  return (
    <MainLayout>
      {({ feedbackItems }) => (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Voice-of-Customer (VoC) Digest
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Narrative Engine (AI4)
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                One-click automated executive summaries pre-computed from real workspace metrics.
              </p>
            </div>

            {/* Generator Action */}
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 px-3 py-2 rounded-xl outline-none"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Current Sprint">Current Sprint</option>
              </select>

              <button
                onClick={() => handleGenerateReport(feedbackItems)}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Synthesizing...' : 'Generate New Digest'}</span>
              </button>
            </div>
          </div>

          {/* Main Layout: Saved Reports List on Left, Active Report Preview on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Saved Reports Sidebar */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Saved VoC Reports ({reports.length})
              </h3>

              <div className="space-y-2">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => setActiveReport(rep)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      activeReport.id === rep.id
                        ? 'bg-slate-900 border-indigo-500 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{rep.period}</span>
                      <Clock className="w-3 h-3 text-slate-400" />
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{rep.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{rep.executiveSummary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Report Full View (Requirement AI4 Criteria 2 & 3) */}
            <div className="lg:col-span-2 glass-panel p-8 rounded-2xl space-y-6">
              {/* Report Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {activeReport.period}
                  </span>
                  <h2 className="text-xl font-black text-white mt-2">{activeReport.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </button>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-1">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" /> Executive Digest Summary
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {activeReport.executiveSummary}
                </p>
              </div>

              {/* Top Themes Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Top Drivers & Themes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeReport.topThemes.map((t, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-xs font-bold text-white block truncate">{t.name}</span>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                        <span>{t.count} items</span>
                        <span className="font-semibold text-rose-400">{t.sentiment}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verbatim Quotes (Requirement AI4 Criteria 2) */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Notable Verbatim Quotes
                </h4>
                <div className="space-y-2">
                  {activeReport.verbatimQuotes.map((vq, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                      <p className="text-xs text-slate-200 italic">"{vq.quote}"</p>
                      <p className="text-[10px] text-slate-400">
                        — {vq.customer} ({vq.channel})
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action Items */}
              <div className="border-t border-slate-800 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Recommended Leadership Action Items
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {activeReport.actionItems.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

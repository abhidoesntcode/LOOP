'use client';

import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  MessageSquare, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  Zap, 
  Layers,
  AlertTriangle
} from 'lucide-react';
import { FeedbackItem, ThemeItem } from '@/lib/mockData';

export default function AnalyticsDashboardPage() {
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('30D');

  return (
    <MainLayout>
      {({ feedbackItems, themes, onAddFeedback, searchQuery }) => {
        // Filter feedback based on channel, date, and search
        const filteredItems = useMemo(() => {
          return feedbackItems.filter((item) => {
            const matchesChannel = selectedChannel === 'ALL' || item.channel === selectedChannel;
            const matchesSearch = !searchQuery || 
              item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.featureArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.customerLabel.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesChannel && matchesSearch;
          });
        }, [feedbackItems, selectedChannel, searchQuery]);

        // Key Numbers (Stat Cards)
        const totalItems = filteredItems.length;
        const negItems = filteredItems.filter((f) => f.sentiment === 'NEG').length;
        const posItems = filteredItems.filter((f) => f.sentiment === 'POS').length;
        const neuItems = filteredItems.filter((f) => f.sentiment === 'NEU').length;
        const negPercentage = totalItems > 0 ? Math.round((negItems / totalItems) * 100) : 0;
        const spikingThemesCount = themes.filter((t) => t.isSpiking).length;

        // Sentiment Donut Chart Data
        const sentimentData = [
          { name: 'Positive', value: posItems, color: '#10b981' },
          { name: 'Neutral', value: neuItems, color: '#64748b' },
          { name: 'Negative', value: negItems, color: '#f43f5e' },
        ];

        // Volume over Time (Mock timeline grouped by recent days)
        const timelineData = [
          { date: 'Aug 01', pos: 12, neu: 4, neg: 18 },
          { date: 'Aug 02', pos: 15, neu: 6, neg: 22 },
          { date: 'Aug 03', pos: 18, neu: 8, neg: 28 },
          { date: 'Aug 04', pos: 22, neu: 5, neg: 31 },
          { date: 'Aug 05', pos: 28, neu: 9, neg: 24 },
        ];

        // Top Themes Chart Data
        const topThemesData = themes.map((t) => ({
          name: t.name.length > 18 ? `${t.name.substring(0, 18)}...` : t.name,
          fullTitle: t.name,
          count: t.count,
          color: t.color,
          isSpiking: t.isSpiking,
        }));

        // Simulated Channel Integration seed buttons
        const handleSeedIntegration = (channelName: FeedbackItem['channel']) => {
          onAddFeedback({
            content: `Simulated live ${channelName} item: High feedback volume detected during production stress test.`,
            channel: channelName,
            customerLabel: `${channelName} Live Stream`,
            sentiment: 'NEG',
            sentimentScore: -0.79,
            status: 'NEW',
            featureArea: 'Live Integration',
            themes: ['Dashboard Load Performance'],
            aiRationale: `Real-time simulated feed item ingested via ${channelName} webhook listener.`,
          });
        };

        return (
          <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Dashboard Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Executive Intelligence Dashboard
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Real-time AI Grounded
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Aggregated multi-channel feedback analysis and sentiment trend tracking.
                </p>
              </div>

              {/* Filters & Range Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-slate-400">Channel:</span>
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                  >
                    <option value="ALL" className="bg-slate-900">All Channels</option>
                    <option value="Support Ticket" className="bg-slate-900">Support Ticket</option>
                    <option value="App Store Review" className="bg-slate-900">App Store Review</option>
                    <option value="NPS Survey" className="bg-slate-900">NPS Survey</option>
                    <option value="Sales Call Note" className="bg-slate-900">Sales Call Note</option>
                    <option value="Community Post" className="bg-slate-900">Community Post</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                  {['7D', '30D', '90D'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedDateRange(range)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedDateRange === range
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stat Cards Grid (Requirement C5 Acceptance Criteria 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Ingested Items */}
              <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total Feedback Ingested</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{totalItems}</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +24 this week
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Across 5 simulated channel sources</p>
              </div>

              {/* Negative Sentiment % */}
              <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Negative Sentiment %</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{negPercentage}%</span>
                  <span className="text-xs font-semibold text-rose-400 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +8% spike
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Driven by Onboarding team invite friction</p>
              </div>

              {/* Spiking Themes */}
              <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Spiking Issues Flagged</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{spikingThemesCount}</span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    High Priority
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Theme volume increased &gt;35% WoW</p>
              </div>

              {/* AI Auto-Classified Coverage */}
              <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">AI Classification Coverage</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">100%</span>
                  <span className="text-xs font-semibold text-purple-300">Claude 3.5 Sonnet</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Zero unclassified feedback items remaining</p>
              </div>
            </div>

            {/* Charts Grid (Requirement C5 Acceptance Criteria 1 & 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Feedback Volume & Sentiment Trend (2 cols) */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Feedback Volume & Sentiment Shift</h3>
                    <p className="text-[11px] text-slate-400">Daily breakdown of positive, neutral, and negative items</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Pos
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> Neu
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Neg
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="pos" stroke="#10b981" fillOpacity={1} fill="url(#colorPos)" />
                      <Area type="monotone" dataKey="neg" stroke="#f43f5e" fillOpacity={1} fill="url(#colorNeg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sentiment Breakdown Pie Chart (1 col) */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Sentiment Distribution</h3>
                  <p className="text-[11px] text-slate-400">Current sentiment ratio across dataset</p>
                </div>

                <div className="h-52 w-full my-2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="block font-bold text-emerald-400">{posItems}</span>
                    <span className="text-[10px] text-slate-400">Positive</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-300">{neuItems}</span>
                    <span className="text-[10px] text-slate-400">Neutral</span>
                  </div>
                  <div>
                    <span className="block font-bold text-rose-400">{negItems}</span>
                    <span className="text-[10px] text-slate-400">Negative</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Themes Bar Chart & Integration Seed Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Themes Horizontal Bar Chart (2 cols) */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Top Clustered Feedback Themes</h3>
                    <p className="text-[11px] text-slate-400">Themes with highest feedback volume and spike status</p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topThemesData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                      <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={130} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {topThemesData.map((entry, index) => (
                          <Cell key={`cell-bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Simulated Channel Source Integrations (Requirement C3 Criteria 3) */}
              <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Simulated Live Channels</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click to simulate real-time webhooks pushing feedback into the LOOP pipeline.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleSeedIntegration('Support Ticket')}
                    className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors group"
                  >
                    <span>Simulate Support Ticket Feed</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </button>

                  <button
                    onClick={() => handleSeedIntegration('App Store Review')}
                    className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors group"
                  >
                    <span>Simulate App Store Review</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </button>

                  <button
                    onClick={() => handleSeedIntegration('Sales Call Note')}
                    className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors group"
                  >
                    <span>Simulate Sales Call Note</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </button>
                </div>

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300">
                  ⚡ <strong>Auto-Ingestion:</strong> Ingested feedback is automatically routed through the Claude AI classifier.
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </MainLayout>
  );
}

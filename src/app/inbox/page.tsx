'use client';

import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Inbox, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Tag, 
  ExternalLink,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { FeedbackItem } from '@/lib/mockData';

const PAGE_SIZE = 10;

export default function FeedbackInboxPage() {
  // Inbox Filters State
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [themeFilter, setThemeFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<FeedbackItem | null>(null);

  return (
    <MainLayout>
      {({ feedbackItems, themes, currentUser, searchQuery, onUpdateStatus, onReclassify }) => {
        const isViewer = currentUser.role === 'VIEWER';

        // Multi-Filter & Search Pipeline
        const filteredFeedback = useMemo(() => {
          return feedbackItems.filter((item) => {
            const matchesChannel = channelFilter === 'ALL' || item.channel === channelFilter;
            const matchesSentiment = sentimentFilter === 'ALL' || item.sentiment === sentimentFilter;
            const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
            const matchesTheme = themeFilter === 'ALL' || item.themes.includes(themeFilter);
            const matchesSearch = !searchQuery || 
              item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.customerLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.featureArea.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesChannel && matchesSentiment && matchesStatus && matchesTheme && matchesSearch;
          });
        }, [feedbackItems, channelFilter, sentimentFilter, statusFilter, themeFilter, searchQuery]);

        // Pagination Math (Requirement C4 Criteria 1)
        const totalPages = Math.ceil(filteredFeedback.length / PAGE_SIZE) || 1;
        const paginatedItems = useMemo(() => {
          const start = (currentPage - 1) * PAGE_SIZE;
          return filteredFeedback.slice(start, start + PAGE_SIZE);
        }, [filteredFeedback, currentPage]);

        return (
          <div className="p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Feedback Triage Inbox
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {filteredFeedback.length} Items Total
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Search, filter, and action incoming customer feedback items inline.
                </p>
              </div>

              {/* Status Breakdown Pills */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>NEW ({feedbackItems.filter(f => f.status === 'NEW').length})</span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>REVIEWED ({feedbackItems.filter(f => f.status === 'REVIEWED').length})</span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ACTIONED ({feedbackItems.filter(f => f.status === 'ACTIONED').length})</span>
                </div>
              </div>
            </div>

            {/* Filter Control Toolbar (Requirement C4 Criteria 2) */}
            <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400 mr-1" />
                
                {/* Channel Filter */}
                <select
                  value={channelFilter}
                  onChange={(e) => { setChannelFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl px-3 py-1.5 outline-none font-medium cursor-pointer"
                >
                  <option value="ALL">All Channels</option>
                  <option value="Support Ticket">Support Ticket</option>
                  <option value="App Store Review">App Store Review</option>
                  <option value="NPS Survey">NPS Survey</option>
                  <option value="Sales Call Note">Sales Call Note</option>
                  <option value="Community Post">Community Post</option>
                </select>

                {/* Sentiment Filter */}
                <select
                  value={sentimentFilter}
                  onChange={(e) => { setSentimentFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl px-3 py-1.5 outline-none font-medium cursor-pointer"
                >
                  <option value="ALL">All Sentiments</option>
                  <option value="POS">Positive (POS)</option>
                  <option value="NEU">Neutral (NEU)</option>
                  <option value="NEG">Negative (NEG)</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl px-3 py-1.5 outline-none font-medium cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">NEW</option>
                  <option value="REVIEWED">REVIEWED</option>
                  <option value="ACTIONED">ACTIONED</option>
                </select>

                {/* Theme Filter */}
                <select
                  value={themeFilter}
                  onChange={(e) => { setThemeFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl px-3 py-1.5 outline-none font-medium cursor-pointer"
                >
                  <option value="ALL">All Themes</option>
                  {themes.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters reset button */}
              {(channelFilter !== 'ALL' || sentimentFilter !== 'ALL' || statusFilter !== 'ALL' || themeFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setChannelFilter('ALL');
                    setSentimentFilter('ALL');
                    setStatusFilter('ALL');
                    setThemeFilter('ALL');
                    setCurrentPage(1);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Inbox Data Table (Requirement C4 Criteria 3 & 4) */}
            <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-800/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                      <th className="py-3 px-4">Sentiment</th>
                      <th className="py-3 px-4">Content Verbatim</th>
                      <th className="py-3 px-4">Channel & Segment</th>
                      <th className="py-3 px-4">Feature & Theme</th>
                      <th className="py-3 px-4">Status Workflow</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="font-semibold text-slate-300">No feedback items match your filters.</p>
                          <p className="text-[11px] text-slate-400 mt-1">Try clearing your search query or dropdown filters.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-900/40 transition-colors group">
                          {/* Sentiment Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                              item.sentiment === 'POS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              item.sentiment === 'NEG' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {item.sentiment} ({item.sentimentScore > 0 ? `+${item.sentimentScore.toFixed(2)}` : item.sentimentScore.toFixed(2)})
                            </span>
                          </td>

                          {/* Content */}
                          <td className="py-3.5 px-4 max-w-md">
                            <p 
                              onClick={() => setSelectedDrawerItem(item)}
                              className="text-slate-200 font-medium line-clamp-2 hover:text-indigo-300 cursor-pointer transition-colors"
                            >
                              "{item.content}"
                            </p>
                          </td>

                          {/* Channel & Customer */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="block font-semibold text-slate-300">{item.channel}</span>
                            <span className="text-[10px] text-slate-400 block">{item.customerLabel}</span>
                          </td>

                          {/* Feature & Theme */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="inline-block bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-bold mb-1">
                              {item.featureArea}
                            </span>
                            <div className="text-[10px] text-indigo-400 font-medium truncate">
                              {item.themes.join(', ')}
                            </div>
                          </td>

                          {/* Status Inline Switcher (Requirement C4 Criteria 4) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <select
                              disabled={isViewer}
                              value={item.status}
                              onChange={(e) => onUpdateStatus(item.id, e.target.value as FeedbackItem['status'])}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-xl outline-none border cursor-pointer transition-all ${
                                item.status === 'NEW'
                                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20'
                                  : item.status === 'REVIEWED'
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                              } ${isViewer ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              <option value="NEW" className="bg-slate-900 text-slate-200">NEW</option>
                              <option value="REVIEWED" className="bg-slate-900 text-slate-200">REVIEWED</option>
                              <option value="ACTIONED" className="bg-slate-900 text-slate-200">ACTIONED</option>
                            </select>
                          </td>

                          {/* Actions (Reclassify & Details) */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1">
                            <button
                              disabled={isViewer}
                              onClick={() => onReclassify(item.id)}
                              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500 text-[10px] font-semibold text-slate-400 hover:text-indigo-300 transition-all disabled:opacity-40"
                              title={isViewer ? 'Viewer role cannot re-classify.' : 'Re-classify sentiment with Claude AI'}
                            >
                              Re-classify
                            </button>

                            <button
                              onClick={() => setSelectedDrawerItem(item)}
                              className="px-2 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-[10px] font-semibold text-indigo-300 hover:bg-indigo-600/30 transition-all"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar (Requirement C4 Criteria 1) */}
              <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredFeedback.length} total filtered items)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Detail Drawer Modal */}
            {selectedDrawerItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 space-y-6 overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="text-sm font-bold text-white">Feedback Record Details</h3>
                    <button
                      onClick={() => setSelectedDrawerItem(null)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-slate-400 uppercase font-semibold text-[10px]">Verbatim Text</span>
                      <p className="text-slate-100 font-medium bg-slate-950 p-3 rounded-xl border border-slate-800 mt-1">
                        "{selectedDrawerItem.content}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 uppercase font-semibold text-[10px]">Channel</span>
                        <p className="text-slate-200 font-bold mt-0.5">{selectedDrawerItem.channel}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-semibold text-[10px]">Customer Label</span>
                        <p className="text-slate-200 font-bold mt-0.5">{selectedDrawerItem.customerLabel}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        Claude AI Classification Metadata (AI1)
                      </span>
                      <div className="text-[11px] text-slate-300 space-y-1">
                        <p><strong>Sentiment:</strong> {selectedDrawerItem.sentiment} ({selectedDrawerItem.sentimentScore})</p>
                        <p><strong>Feature Area:</strong> {selectedDrawerItem.featureArea}</p>
                        <p><strong>Clustered Themes:</strong> {selectedDrawerItem.themes.join(', ')}</p>
                        <p className="text-slate-400 italic pt-1 border-t border-slate-800">
                          Rationale: "{selectedDrawerItem.aiRationale}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}

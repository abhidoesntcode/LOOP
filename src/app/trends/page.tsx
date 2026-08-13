'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  TrendingUp, 
  Zap, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { ThemeItem, FeedbackItem } from '@/lib/mockData';

export default function ThemeTrendsPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeItem | null>(null);

  return (
    <MainLayout>
      {({ feedbackItems, themes, searchQuery }) => {
        // Filter themes based on search query
        const filteredThemes = themes.filter((t) =>
          !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Get feedback matching active selected theme drill-down
        const activeThemeFeedback = selectedTheme
          ? feedbackItems.filter((item) => item.themes.includes(selectedTheme.name))
          : [];

        return (
          <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Theme Clustering & Trends
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    AI Cluster Engine (AI2)
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Automated feedback group clustering with WoW volume spike detection.
                </p>
              </div>

              {/* Spiking summary pill */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>2 Themes Spiking WoW (&gt;35% growth)</span>
                </div>
              </div>
            </div>

            {/* Main Layout Grid: Themes Cards on Left (2 cols), Drill-down on Right (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Themes Grid (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Active Themes ({filteredThemes.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredThemes.map((theme) => {
                    const isSelected = selectedTheme?.id === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme)}
                        className={`glass-panel p-5 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                            : 'hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: theme.color }}
                            />
                            <h3 className="text-sm font-bold text-white leading-tight">{theme.name}</h3>
                          </div>

                          {theme.isSpiking && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 shrink-0">
                              <TrendingUp className="w-3 h-3" />
                              +{theme.spikePercent}%
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{theme.description}</p>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-200">
                            {theme.count} Feedback Items
                          </span>

                          <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Drill Down <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Theme Drill-Down Panel (Requirement AI2 Criteria 3) */}
              <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col h-full min-h-[500px]">
                {selectedTheme ? (
                  <>
                    <div className="border-b border-slate-800 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                          Theme Drill-Down
                        </span>
                        <button
                          onClick={() => setSelectedTheme(null)}
                          className="text-[11px] text-slate-400 hover:text-white"
                        >
                          Clear Selection
                        </button>
                      </div>
                      <h3 className="text-lg font-black text-white mt-1">{selectedTheme.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{selectedTheme.description}</p>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[450px] pr-1">
                      <span className="text-xs font-semibold text-slate-300 block">
                        Matching Verbatim Quotes ({activeThemeFeedback.length}):
                      </span>

                      {activeThemeFeedback.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No feedback verbatim linked to this theme.</p>
                      ) : (
                        activeThemeFeedback.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs"
                          >
                            <p className="text-slate-200 font-medium italic">"{item.content}"</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                              <span>{item.channel}</span>
                              <span className={`font-bold ${
                                item.sentiment === 'POS' ? 'text-emerald-400' :
                                item.sentiment === 'NEG' ? 'text-rose-400' : 'text-slate-300'
                              }`}>
                                {item.sentiment} ({item.sentimentScore})
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Layers className="w-10 h-10 text-slate-600 mb-3" />
                    <p className="font-bold text-slate-300 text-sm">Select a Theme to Drill Down</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Click any theme card on the left to view matching customer quotes and sentiment breakdown.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </MainLayout>
  );
}

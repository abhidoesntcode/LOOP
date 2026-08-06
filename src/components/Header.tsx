'use client';

import React from 'react';
import { 
  Building2, 
  Plus, 
  UploadCloud, 
  Search, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { WorkspaceUser, WorkspaceInfo } from '@/lib/mockData';

interface HeaderProps {
  workspace: WorkspaceInfo;
  currentUser: WorkspaceUser;
  onOpenSingleIngest: () => void;
  onOpenCsvImport: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({
  workspace,
  currentUser,
  onOpenSingleIngest,
  onOpenCsvImport,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const isViewer = currentUser.role === 'VIEWER';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      {/* Workspace Switcher (Multi-Tenant Demo) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl hover:border-slate-700 transition-colors cursor-pointer group">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200 group-hover:text-white">{workspace.name}</span>
              <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                Tenant Isolated
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search feedback verbatim, feature areas, themes..."
          className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 outline-none transition-all"
        />
      </div>

      {/* Action Buttons (Restricted for Viewer role based on RBAC requirements!) */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenCsvImport}
          disabled={isViewer}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isViewer
              ? 'bg-slate-900/40 text-slate-600 border-slate-800/60 cursor-not-allowed'
              : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
          }`}
          title={isViewer ? 'Viewer role is read-only. Switch to Admin/Analyst to import CSV.' : 'CSV Bulk Import'}
        >
          <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
          <span>CSV Import</span>
        </button>

        <button
          onClick={onOpenSingleIngest}
          disabled={isViewer}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
            isViewer
              ? 'bg-indigo-950/40 text-indigo-300/40 border border-indigo-900/30 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
          }`}
          title={isViewer ? 'Viewer role is read-only.' : 'Add Single Feedback'}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ingest Feedback</span>
        </button>
      </div>
    </header>
  );
}

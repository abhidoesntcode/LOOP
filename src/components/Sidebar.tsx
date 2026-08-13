'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Inbox, 
  TrendingUp, 
  Sparkles, 
  FileText, 
  Settings, 
  ShieldCheck, 
  Layers, 
  UserCheck
} from 'lucide-react';
import { WorkspaceUser } from '@/lib/mockData';

interface SidebarProps {
  currentUser: WorkspaceUser;
  onRoleChange: (role: WorkspaceUser['role']) => void;
}

export default function Sidebar({ currentUser, onRoleChange }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Feedback Inbox', href: '/inbox', icon: Inbox },
    { name: 'Theme Trends', href: '/trends', icon: TrendingUp },
    { name: 'Ask LOOP (AI)', href: '/ask', icon: Sparkles, badge: 'RAG' },
    { name: 'VoC Reports', href: '/reports', icon: FileText },
    { name: 'Workspace & RBAC', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-40">
      <div>
        {/* Logo & Brand Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">LOOP</span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Customer Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher & User Profile (RBAC Testing widget) */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-900/30">
        <div className="mb-2 px-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Role:</span>
          </div>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
            currentUser.role === 'ADMIN' 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : currentUser.role === 'ANALYST'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {currentUser.role}
          </span>
        </div>

        {/* Quick Role Switch Buttons */}
        <div className="grid grid-cols-3 gap-1 mb-3">
          {(['ADMIN', 'ANALYST', 'VIEWER'] as const).map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              className={`py-1 text-[10px] font-bold rounded-lg transition-all border ${
                currentUser.role === role
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Current User Card */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-indigo-500/30"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

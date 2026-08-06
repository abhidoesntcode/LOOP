'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Settings, 
  ShieldCheck, 
  Users, 
  Building2, 
  Key, 
  Lock, 
  UserPlus, 
  Check,
  X
} from 'lucide-react';
import { WorkspaceUser } from '@/lib/mockData';

export default function SettingsPage() {
  const [members, setMembers] = useState<WorkspaceUser[]>([
    { id: 'u1', name: 'Alex Rivera', email: 'alex@acme.com', role: 'ADMIN', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { id: 'u2', name: 'Sarah Chen', email: 'sarah@acme.com', role: 'ANALYST', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { id: 'u3', name: 'Marcus Vance', email: 'marcus@acme.com', role: 'VIEWER', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceUser['role']>('ANALYST');

  const handleInviteMember = (currentUserRole: WorkspaceUser['role']) => {
    if (currentUserRole !== 'ADMIN') return;
    if (!inviteEmail.trim()) return;

    const newMember: WorkspaceUser = {
      id: `u_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    setMembers(prev => [...prev, newMember]);
    setInviteEmail('');
  };

  const handleRoleChange = (memberId: string, newRole: WorkspaceUser['role'], currentUserRole: WorkspaceUser['role']) => {
    if (currentUserRole !== 'ADMIN') return;
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  };

  return (
    <MainLayout>
      {({ currentUser, workspace }) => {
        const isAdmin = currentUser.role === 'ADMIN';

        return (
          <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Workspace & Role-Based Access Control (RBAC)
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure tenant isolation and member permissions across ADMIN, ANALYST, and VIEWER roles.
              </p>
            </div>

            {/* Tenant Information Card */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{workspace.name}</h3>
                  <p className="text-xs text-slate-400">Tenant ID: <code className="text-indigo-300 font-mono">{workspace.id}</code> • {workspace.plan}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Strict Tenant Query Isolation Enforced
                </span>
              </div>
            </div>

            {/* Members & RBAC Management (Requirement C2 Criteria 2 & 3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Member List (2 cols) */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Team Members ({members.length})
                  </h3>
                  {!isAdmin && (
                    <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 font-semibold">
                      🔒 ADMIN role required to manage member roles
                    </span>
                  )}
                </div>

                {/* Member Invite Form (ADMIN only) */}
                {isAdmin && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleInviteMember(currentUser.role);
                    }}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2"
                  >
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@acme.com"
                      className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-200 outline-none placeholder-slate-400"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as WorkspaceUser['role'])}
                      className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-2.5 py-1.5 rounded-lg outline-none font-semibold"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="ANALYST">ANALYST</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                    <button
                      type="submit"
                      disabled={!inviteEmail.trim()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Invite
                    </button>
                  </form>
                )}

                {/* Members Table */}
                <div className="divide-y divide-slate-800/80">
                  {members.map((member) => (
                    <div key={member.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-800"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{member.name}</p>
                          <p className="text-[11px] text-slate-400">{member.email}</p>
                        </div>
                      </div>

                      <select
                        disabled={!isAdmin}
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as WorkspaceUser['role'], currentUser.role)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl border outline-none cursor-pointer transition-all ${
                          member.role === 'ADMIN'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : member.role === 'ANALYST'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        } ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <option value="ADMIN" className="bg-slate-900 text-slate-200">ADMIN</option>
                        <option value="ANALYST" className="bg-slate-900 text-slate-200">ANALYST</option>
                        <option value="VIEWER" className="bg-slate-900 text-slate-200">VIEWER</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* RBAC Matrix Explainer (1 col) */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  Role Permissions Matrix
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-950/80 border border-rose-500/20 rounded-xl space-y-1">
                    <span className="font-extrabold text-rose-400 block">ADMIN Role</span>
                    <p className="text-[11px] text-slate-300">
                      Full ownership. Manage workspace members, assign RBAC roles, ingest single/bulk CSV feedback, action status, and run AI reports.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-amber-500/20 rounded-xl space-y-1">
                    <span className="font-extrabold text-amber-400 block">ANALYST Role</span>
                    <p className="text-[11px] text-slate-300">
                      Operational access. Ingest feedback, run CSV bulk uploads, triage status workflow, re-classify sentiment, and generate VoC digests.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-emerald-500/20 rounded-xl space-y-1">
                    <span className="font-extrabold text-emerald-400 block">VIEWER Role</span>
                    <p className="text-[11px] text-slate-300">
                      Read-only access. Browse analytics dashboard, view feedback inbox, search, drill down themes, and ask questions via Ask LOOP AI. (Ingestion and role editing return 403 Forbidden).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </MainLayout>
  );
}

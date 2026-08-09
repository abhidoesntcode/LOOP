'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import SingleIngestModal from '@/components/SingleIngestModal';
import CsvImportModal from '@/components/CsvImportModal';
import { 
  SEEDED_FEEDBACK, 
  INITIAL_THEMES, 
  INITIAL_USERS, 
  INITIAL_WORKSPACE,
  FeedbackItem,
  ThemeItem,
  WorkspaceUser,
  WorkspaceInfo
} from '@/lib/mockData';

interface MainLayoutRenderProps {
  feedbackItems: FeedbackItem[];
  themes: ThemeItem[];
  currentUser: WorkspaceUser;
  workspace: WorkspaceInfo;
  searchQuery: string;
  onAddFeedback: (newItem: Omit<FeedbackItem, 'id' | 'createdAt'>) => void;
  onBulkImport: (items: Omit<FeedbackItem, 'id' | 'createdAt'>[]) => void;
  onUpdateStatus: (id: string, status: FeedbackItem['status']) => void;
  onReclassify: (id: string) => void;
}

interface MainLayoutProps {
  children: (props: MainLayoutRenderProps) => React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(SEEDED_FEEDBACK);
  const [themes, setThemes] = useState<ThemeItem[]>(INITIAL_THEMES);
  const [currentUser, setCurrentUser] = useState<WorkspaceUser>(INITIAL_USERS[0]); // Alex (ADMIN) by default
  const [workspace] = useState<WorkspaceInfo>(INITIAL_WORKSPACE);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetch('/api/feedbacks')
      .then(res => res.json())
      .then(data => {
        if (!data.error && Array.isArray(data) && data.length > 0) {
          setFeedbackItems(data);
        }
      })
      .catch(console.error);

    fetch('/api/themes')
      .then(res => res.json())
      .then(data => {
        if (!data.error && Array.isArray(data) && data.length > 0) {
          setThemes(data);
        }
      })
      .catch(console.error);
  }, []);

  // Modals state
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const handleRoleChange = (role: WorkspaceUser['role']) => {
    const targetUser = INITIAL_USERS.find(u => u.role === role) || {
      id: `u_${role.toLowerCase()}`,
      name: `Demo ${role}`,
      email: `${role.toLowerCase()}@acme.com`,
      role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    setCurrentUser(targetUser);
  };

  const handleAddFeedback = (newItem: Omit<FeedbackItem, 'id' | 'createdAt'>) => {
    const createdRecord: FeedbackItem = {
      ...newItem,
      id: `fb_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFeedbackItems(prev => [createdRecord, ...prev]);

    // If new themes generated, add to theme count
    if (newItem.themes && newItem.themes.length > 0) {
      const themeName = newItem.themes[0];
      setThemes(prev => prev.map(t => t.name === themeName ? { ...t, count: t.count + 1 } : t));
    }
  };

  const handleBulkImport = (items: Omit<FeedbackItem, 'id' | 'createdAt'>[]) => {
    const createdRecords: FeedbackItem[] = items.map((item, idx) => ({
      ...item,
      id: `fb_bulk_${Date.now()}_${idx}`,
      createdAt: new Date().toISOString(),
    }));
    setFeedbackItems(prev => [...createdRecords, ...prev]);
  };

  const handleUpdateStatus = (id: string, newStatus: FeedbackItem['status']) => {
    setFeedbackItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleReclassify = (id: string) => {
    setFeedbackItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        return {
          ...item,
          sentiment: item.sentiment === 'NEG' ? 'NEU' : item.sentiment === 'NEU' ? 'POS' : 'NEG',
          aiRationale: 'Manually reclassified by user override (Requirement AI1 Criteria 4).',
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar currentUser={currentUser} onRoleChange={handleRoleChange} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          workspace={workspace}
          currentUser={currentUser}
          onOpenSingleIngest={() => setIsSingleModalOpen(true)}
          onOpenCsvImport={() => setIsCsvModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto">
          {children({
            feedbackItems,
            themes,
            currentUser,
            workspace,
            searchQuery,
            onAddFeedback: handleAddFeedback,
            onBulkImport: handleBulkImport,
            onUpdateStatus: handleUpdateStatus,
            onReclassify: handleReclassify,
          })}
        </main>
      </div>

      {/* Modals */}
      <SingleIngestModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onIngest={handleAddFeedback}
      />
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onBulkImport={handleBulkImport}
      />
    </div>
  );
}

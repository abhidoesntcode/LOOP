'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { FeedbackItem } from '@/lib/mockData';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkImport: (items: Omit<FeedbackItem, 'id' | 'createdAt'>[]) => void;
}

const SAMPLE_CSV_DATA = `content,channel,customer_label
"Onboarding took forever — I couldn't figure out how to invite my team.",Support Ticket,Fintech Enterprise Customer
"The new export feature saved me an hour today!",Community Post,Data Analyst User
"Billing page keeps timing out when I try to download an invoice.",Support Ticket,Finance Manager
"Prospect wants SAML SSO before signing $50k contract.",Sales Call Note,VP Sales
"Mobile filters are cut off on small screen widths.",NPS Survey,Mobile App User`;

export default function CsvImportModal({ isOpen, onClose, onBulkImport }: CsvImportModalProps) {
  const [csvContent, setCsvContent] = useState('');
  const [importSummary, setImportSummary] = useState<{ imported: number; failed: number } | null>(null);

  if (!isOpen) return null;

  const parseCsv = () => {
    const lines = csvContent.trim().split('\n');
    if (lines.length <= 1) return [];

    const parsedItems: Omit<FeedbackItem, 'id' | 'createdAt'>[] = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Basic CSV split ignoring quotes roughly
      const parts = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
      const content = parts[0] || '';
      const channel = (parts[1] || 'Support Ticket') as FeedbackItem['channel'];
      const customerLabel = parts[2] || 'CSV Import User';

      if (content) {
        const lower = content.toLowerCase();
        const sentiment: FeedbackItem['sentiment'] = lower.includes('saved') || lower.includes('love') ? 'POS' : lower.includes('timing out') || lower.includes('couldn\'t') || lower.includes('sso') ? 'NEG' : 'NEU';
        
        parsedItems.push({
          content,
          channel: ['Support Ticket', 'App Store Review', 'NPS Survey', 'Sales Call Note', 'Community Post'].includes(channel) ? channel : 'Support Ticket',
          customerLabel,
          sentiment,
          sentimentScore: sentiment === 'POS' ? 0.85 : sentiment === 'NEG' ? -0.75 : 0.0,
          status: 'NEW',
          featureArea: 'Ingested CSV',
          themes: ['Batch Imported'],
          aiRationale: 'Queued for Claude AI auto-classification batch worker.',
        });
      }
    }
    return parsedItems;
  };

  const handleImport = () => {
    const items = parseCsv();
    if (items.length === 0) return;

    onBulkImport(items);
    setImportSummary({ imported: items.length, failed: 0 });
    setTimeout(() => {
      setCsvContent('');
      setImportSummary(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Bulk CSV Ingestion</h3>
              <p className="text-[11px] text-slate-400">Parse, validate, and queue feedback rows (C3)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Paste CSV Data (or load sample batch)
            </label>
            <button
              type="button"
              onClick={() => setCsvContent(SAMPLE_CSV_DATA)}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline"
            >
              Populate Sample Rows
            </button>
          </div>

          <textarea
            rows={6}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder="content,channel,customer_label&#10;&quot;Great app!&quot;,App Store Review,VIP Customer"
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-400 outline-none"
          />

          {/* Parsing Summary Preview */}
          {csvContent.trim() && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Parsed Rows: <strong className="text-emerald-400">{parseCsv().length}</strong>
              </span>
              <span className="text-[11px] text-slate-400">
                Expected columns: <code className="text-indigo-300 font-mono">content, channel, customer_label</code>
              </span>
            </div>
          )}

          {importSummary && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Successfully imported <strong>{importSummary.imported}</strong> feedback items!</span>
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
              type="button"
              onClick={handleImport}
              disabled={parseCsv().length === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Batch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

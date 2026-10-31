import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { SyncStatus } from '../types/league';
import { generateStarterTemplateCSV } from '../services/googleSheetsSync';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  onSync: (url: string) => Promise<void>;
  onResetToBuiltIn: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  onSync,
  onResetToBuiltIn,
}) => {
  const [inputUrl, setInputUrl] = useState(syncStatus.sheetUrl || '');
  const [activeTabGuide, setActiveTabGuide] = useState<string>('Matches');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyTemplate = (tabName: string) => {
    const csv = generateStarterTemplateCSV(tabName);
    navigator.clipboard.writeText(csv);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleDownloadCSV = (tabName: string) => {
    const csv = generateStarterTemplateCSV(tabName);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bgfutsal_${tabName.toLowerCase()}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = ['Seasons', 'Divisions', 'Teams', 'Matches', 'Honors', 'News'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-[#071324] via-[#0b1f3a] to-[#071324] border-b border-[#142944] text-white flex items-center justify-between shrink-0">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Administrator Data Sync
              </h3>
              <p className="text-xs text-slate-300">
                Private organizer configuration. Spreadsheet links are never displayed publicly.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Connection Input Box */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Google Sheet Sharing URL or Spreadsheet ID
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-2xs"
              />
              <button
                onClick={() => onSync(inputUrl)}
                disabled={syncStatus.isSyncing || !inputUrl.trim()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {syncStatus.isSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            {/* Status & Last Synced Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Active Source:</span>
                {syncStatus.dataSource === 'google-sheets' ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Live Google Sheet Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md">
                    <span>Built-in League Archive (Default)</span>
                  </span>
                )}
              </div>

              {syncStatus.lastSynced && (
                <span className="text-slate-500">Last Synced: {syncStatus.lastSynced}</span>
              )}

              {syncStatus.dataSource === 'google-sheets' && (
                <button
                  onClick={onResetToBuiltIn}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Reset to built-in data
                </button>
              )}
            </div>

            {/* Error Message if any */}
            {syncStatus.error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Sync Error: </span>
                  <span>{syncStatus.error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Data Health Inspector */}
          {syncStatus.validationIssues && syncStatus.validationIssues.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Data Health Inspector Warnings</span>
              </div>
              <ul className="text-xs text-amber-900 list-disc list-inside space-y-1">
                {syncStatus.validationIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Organizer Setup Reference */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Organizer Reference Guide</span>
            </h4>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
              <li>
                In your private Google Sheet, share access directly with your fellow organizers.
              </li>
              <li>
                Set General Access to <span className="font-bold text-emerald-700">"Anyone with the link can view"</span> so the site's sync engine can read the CSV tabs without login prompts.
              </li>
              <li>
                Paste your sheet URL in the box above. The site will pull updates and cache them locally. No external link to your spreadsheet is ever rendered publicly to visitors.
              </li>
            </ol>
          </div>

          {/* Template Schema & Copy Tool */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                Starter Spreadsheet Tab Templates
              </h4>
              <span className="text-xs text-slate-500">Copy or download pre-formatted columns</span>
            </div>

            {/* Tab Selection */}
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar p-1 bg-slate-100 rounded-xl border border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTabGuide(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeTabGuide === tab
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab} Tab
                </button>
              ))}
            </div>

            {/* Active Tab Preview & Actions */}
            <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 font-bold">
                  {activeTabGuide} Columns & Sample Format
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyTemplate(activeTabGuide)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedTab === activeTabGuide ? 'Copied!' : 'Copy CSV'}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadCSV(activeTabGuide)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-medium text-white transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <pre className="text-xs font-mono bg-black/40 p-3 rounded-xl overflow-x-auto custom-scrollbar text-slate-300">
                {generateStarterTemplateCSV(activeTabGuide)}
              </pre>

              {activeTabGuide === 'Matches' && (
                <p className="text-[11px] text-emerald-300/80 leading-normal">
                  * <strong>Forfeits</strong>: Set <code className="font-mono bg-slate-800 px-1 py-0.5 rounded text-white">forfeit</code> to <code className="font-mono bg-slate-800 px-1 py-0.5 rounded text-white">home</code> or <code className="font-mono bg-slate-800 px-1 py-0.5 rounded text-white">away</code>. The opposing team automatically receives a 2-0 victory, 3 points, and +2 goal differential!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

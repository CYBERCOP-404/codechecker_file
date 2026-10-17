import React, { useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  Copy,
  Check,
  Database,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { StoredCode } from '../types';

interface SavedCodesProps {
  savedCodes: StoredCode[];
  onDeleteCode: (id: string, code: string) => Promise<boolean>;
  onClearAllCodes?: () => Promise<boolean>;
  onRequestCopyAll: () => void;
  onGoToDetector: () => void;
  isLoading: boolean;
}

export const SavedCodes: React.FC<SavedCodesProps> = ({
  savedCodes,
  onDeleteCode,
  onClearAllCodes,
  onRequestCopyAll,
  onGoToDetector,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [codeToDelete, setCodeToDelete] = useState<StoredCode | null>(null);

  // Filtered codes based on search query (case-insensitive)
  const filteredCodes = useMemo(() => {
    if (!searchQuery.trim()) return savedCodes;
    const q = searchQuery.trim().toUpperCase();
    return savedCodes.filter(c => c.normalized.includes(q) || c.code.toUpperCase().includes(q));
  }, [savedCodes, searchQuery]);

  const handleCopySingle = async (item: StoredCode) => {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!codeToDelete) return;
    setDeletingId(codeToDelete.id);
    const success = await onDeleteCode(codeToDelete.id, codeToDelete.code);
    setDeletingId(null);
    setCodeToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Saved Unique Codes
              </h2>
              <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full border border-teal-200/60">
                {savedCodes.length} Total
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              All codes stored persistently in the database across all visitors
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* All Codes Copy Button */}
            <button
              type="button"
              disabled={savedCodes.length === 0}
              onClick={onRequestCopyAll}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                savedCodes.length > 0
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Copy All Codes</span>
              <span className="bg-slate-800 text-teal-300 text-[11px] px-1.5 py-0.2 rounded-md font-bold">
                {savedCodes.length}
              </span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved codes (case-insensitive)..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder:text-slate-400 font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-slate-500 mt-2">
              Found <strong className="text-teal-700">{filteredCodes.length}</strong> matching codes
            </p>
          )}
        </div>
      </div>

      {/* Codes List / Cards */}
      {filteredCodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCodes.map((item) => {
            const isCopied = copiedId === item.id;
            const isDeleting = deletingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-teal-300 p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-sm sm:text-base font-semibold text-slate-900 break-all select-all">
                      {item.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-3">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()} at{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  {/* Single Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopySingle(item)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'text-teal-700 hover:text-teal-800 bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/60'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  {/* Individual Delete Button */}
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setCodeToDelete(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete this code from database"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Database className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            {searchQuery ? 'No matching codes found' : 'No Saved Codes Yet'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery
              ? `No codes matched "${searchQuery}". Try a different keyword.`
              : 'Paste your codes in the Code Detector tab. Any newly detected unique code will automatically appear here.'}
          </p>

          <div className="mt-5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoToDetector}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-teal-600/20 transition-all inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Go to Code Detector</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {codeToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Delete this code?
            </h4>
            <p className="text-xs text-slate-500 mt-1 font-mono break-all p-2 bg-slate-50 rounded-lg border border-slate-200 mt-2">
              {codeToDelete.code}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              This code will be removed from the shared database. If someone submits it again in the future, it will be detected as new.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCodeToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
              >
                Delete Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

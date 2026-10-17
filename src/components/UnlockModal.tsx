import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Heart,
  Copy,
  Check,
  Layers,
  AlertCircle,
} from 'lucide-react';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyConfirmed: (codes: string[]) => void;
  nonDuplicateCodes: string[];
  duplicateCount: number;
  mode?: 'detected' | 'all_codes';
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  onCopyConfirmed,
  nonDuplicateCodes,
  duplicateCount,
  mode = 'detected',
}) => {
  const [hasVisited, setHasVisited] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Reset visited state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopiedCode(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlockClick = () => {
    setHasVisited(true);
  };

  const handleCompleteCopy = () => {
    onCopyConfirmed(nonDuplicateCodes);
    onClose();
  };

  const handleCopySingleCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const isAllCodesMode = mode === 'all_codes';
  const hasCodes = nonDuplicateCodes.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm transition-all animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-teal-100 overflow-hidden transform transition-all flex flex-col max-h-[92vh]">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500 z-10" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center ring-4 ring-teal-50/50 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                  CYBER COP-404
                </span>
                <span className="text-xs text-slate-400">
                  {isAllCodesMode ? 'Database Codes' : 'Detection Results'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mt-0.5">
                {isAllCodesMode
                  ? 'সকল সংরক্ষিত কোড কপি করুন'
                  : 'আপনার কোড কপি করার জন্য পেজটি ভিজিট করুন'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="বন্ধ করুন"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Line: Duplicate & Non-Duplicate Counters */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-100/70 border border-teal-200 px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span>নন-ডুপ্লিকেট: <strong>{nonDuplicateCodes.length} টি</strong></span>
          </div>

          {!isAllCodesMode && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-200/70 border border-slate-300/80 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>ডুপ্লিকেট: <strong>{duplicateCount} টি</strong></span>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Exact Bangla Text Requested by User */}
          <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl">
            <p className="text-sm font-semibold text-teal-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-teal-600 shrink-0 fill-teal-500/20" />
              <span>গার্লফ্রেন্ড খুঁজে দিলে সকল চ্যালেঞ্জ কোড দেওয়া হবে।</span>
            </p>
          </div>

          {/* Non-duplicate Codes List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>নন-ডুপ্লিকেট ইউনিক কোডসমূহ ({nonDuplicateCodes.length}):</span>
              </span>
            </div>

            {hasCodes ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs sm:text-sm">
                {nonDuplicateCodes.map((code, index) => {
                  const isCopied = copiedCode === code;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200/90 hover:border-teal-300 transition-colors shadow-2xs group"
                    >
                      <span className="font-semibold text-slate-800 break-all select-all">
                        {code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySingleCode(code)}
                        className={`p-1 rounded text-xs font-medium transition-colors shrink-0 ${
                          isCopied
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-slate-400 group-hover:text-teal-700 hover:bg-slate-100'
                        }`}
                        title="Copy this code"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <AlertCircle className="w-7 h-7 text-amber-500 mx-auto mb-1.5" />
                <p className="text-sm font-semibold text-slate-800">
                  কোনো নন-ডুপ্লিকেট কোড নেই
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  আপনার পেস্ট করা কোডগুলো আগে থেকেই ডাটাবেজে রয়েছে অথবা ইনপুটে ডুপ্লিকেট ছিল।
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Unlock & Copy Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 space-y-2 shrink-0">
          {!hasVisited ? (
            <div>
              <a
                href="https://github.com/CYBERCOP-404"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleUnlockClick}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 active:scale-[0.99] transition-all text-sm sm:text-base cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>আনলক করুন</span>
                <ExternalLink className="w-4 h-4 opacity-80 ml-0.5" />
              </a>
              <p className="text-center text-[11px] text-slate-500 mt-1.5">
                পেজ ভিজিট করার পর কপি বাটন সক্রিয় হবে
              </p>
            </div>
          ) : (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>কপি আনলক হয়েছে! এখন কোডগুলো কপি করতে পারেন।</span>
              </div>

              <button
                type="button"
                disabled={!hasCodes}
                onClick={handleCompleteCopy}
                className={`w-full flex items-center justify-center gap-2 px-5 py-3 text-white font-bold rounded-xl shadow-md active:scale-[0.99] transition-all text-sm sm:text-base ${
                  hasCodes
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>সবগুলো নন-ডুপ্লিকেট কোড কপি করুন ({nonDuplicateCodes.length})</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 font-mono">
              Prefix: Code From &gt; CYBER COP-404
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium py-1 px-2 rounded hover:bg-slate-200/60 transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

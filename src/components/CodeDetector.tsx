import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  ShieldCheck,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { DetectionResult } from '../types';
import { parseRawInput } from '../utils/codeParser';

interface CodeDetectorProps {
  onDetectAndSave: (candidateCodes: string[], rawParse: ReturnType<typeof parseRawInput>) => Promise<DetectionResult | null>;
  onRequestCopyNew: (codes: string[]) => void;
  onRequestCopyAll: () => void;
  totalSavedCount: number;
  isLoading: boolean;
  latestResult: DetectionResult | null;
  onClearLatestResult: () => void;
  onReopenResultPopup: () => void;
}

export const CodeDetector: React.FC<CodeDetectorProps> = ({
  onDetectAndSave,
  onRequestCopyNew,
  onRequestCopyAll,
  totalSavedCount,
  isLoading,
  latestResult,
  onClearLatestResult,
  onReopenResultPopup,
}) => {
  const [inputText, setInputText] = useState('');

  // Quick sample loader for demonstration & user testing
  const handleLoadSample = () => {
    const sample = `1. PROMO-ALPHA-2025
2. PROMO-ALPHA-2025 (Duplicate in input)
3. 00412 (Pure serial number - ignored)
4. Code: CYBER-BETA-7700
#05: GIFT-VOUCHER-X9
6. Status: Valid (Unrelated text - ignored)
7. promo-alpha-2025 (Case-insensitive duplicate)
8. NITRO-BOOST-404
9. https://cybercop404.dev (URL - ignored)
10. GAMER-PASS-881`;
    setInputText(sample);
  };

  const handleClearInput = () => {
    setInputText('');
    onClearLatestResult();
  };

  const handleProcessInput = async () => {
    if (!inputText.trim()) return;
    const parsed = parseRawInput(inputText);
    if (parsed.candidateCodes.length === 0) {
      alert('কোনো বৈধ কোড পাওয়া যায়নি। সিরিয়াল নম্বর ও অনাবশ্যক টেক্সট বাদ দেওয়া হয়েছে।');
      return;
    }
    await onDetectAndSave(parsed.candidateCodes, parsed);
  };

  const hasNewCodes = latestResult && latestResult.newCodes.length > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Hero / Instructions Banner */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 rounded-3xl pl-[23px] pr-[26px] pt-[18px] pb-3 text-white shadow-xl shadow-teal-900/10 relative overflow-hidden min-h-[122.833px]">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 pl-[12px] pr-[15px] pt-[5px] pb-[4px] mx-0 -mt-[10px] -mb-[5px] h-[25.3333px] rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
            <span>CYBER COP-404 Security Engine</span>
          </div>
          <h2 className="text-[17px] h-[28px] leading-[28px] max-w-[666.667px] font-extrabold tracking-tight text-white mb-1">
            Automated Unique Code Detector
          </h2>
          <p className="text-teal-100/90 text-[11px] leading-[16.75px]">
            পেস্ট করুন আপনার কোডগুলোর তালিকা। সিরিয়াল নম্বর ও অনাকাঙ্ক্ষিত টেক্সট স্বয়ংক্রিয়ভাবে বাদ দিয়ে
            পপআপ উইন্ডোতে কেবলমাত্র নন-ডুপ্লিকেট ইউনিক কোড প্রদর্শন ও কপি করার সুযোগ পাবেন।
          </p>
        </div>
      </div>

      {/* Main Detector Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div>
            <label
              htmlFor="codeInputArea"
              className="block text-sm sm:text-base font-bold text-slate-800"
            >
              Paste Your Codes or Text Below
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports multiline, serial lists (1., #01, [1]), comma or space separated codes
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200/60"
            >
              Load Sample
            </button>
            {inputText && (
              <button
                type="button"
                onClick={handleClearInput}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            id="codeInputArea"
            rows={7}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="উদাহরণ:
1. ABCD-1234-EFGH
2. KLMN-5678-OPQR
3. ABCD-1234-EFGH (ডুপ্লিকেট স্বয়ংক্রিয়ভাবে বাদ যাবে)
#04: PROMO-9900"
            className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder:text-slate-400 resize-y"
          />
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
            <span>Case-Insensitive (ABC == abc) • Auto-filtered serials</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading || !inputText.trim()}
              onClick={handleProcessInput}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all ${
                isLoading || !inputText.trim()
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                  : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.99] shadow-teal-600/20'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Checking Database...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>Detect &amp; Open Codes Popup</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global Quick Copy Bar */}
      <div className="bg-gradient-to-r from-teal-50 via-white to-teal-50/40 border border-teal-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Copy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              One-Click Copy Center
            </h3>
            <p className="text-xs text-slate-500">
              Header prefix: Code From &gt; CYBER COP-404
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Copy All New Codes Button */}
          <button
            type="button"
            disabled={!hasNewCodes}
            onClick={() => latestResult && onRequestCopyNew(latestResult.newCodes)}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              hasNewCodes
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>Copy New Codes</span>
            {hasNewCodes && (
              <span className="bg-teal-800 text-teal-100 text-[11px] px-1.5 py-0.2 rounded font-bold ml-1">
                {latestResult.newCodes.length}
              </span>
            )}
          </button>

          {/* All Codes Button */}
          <button
            type="button"
            disabled={totalSavedCount === 0}
            onClick={onRequestCopyAll}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              totalSavedCount > 0
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>All Codes ({totalSavedCount})</span>
          </button>
        </div>
      </div>

      {/* Detection Status Banner with Quick Reopen (Clean, no huge lists at bottom) */}
      {latestResult && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              সর্বশেষ সনাক্তকরণ: <strong className="text-teal-900">{latestResult.newCodes.length} টি নন-ডুপ্লিকেট</strong> ও{' '}
              <strong className="text-slate-900">
                {latestResult.alreadyInDbCount + latestResult.duplicateInInputCount} টি ডুপ্লিকেট
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onReopenResultPopup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <span>পপআপ ওপেন করুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

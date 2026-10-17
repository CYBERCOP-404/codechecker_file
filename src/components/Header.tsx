import React from 'react';
import { Shield, Database, Sparkles, Binary } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  totalSavedCount: number;
  dbConnected: boolean;
  onOpenTerms: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  totalSavedCount,
  dbConnected,
  onOpenTerms,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 pl-0 pt-0 pr-[2px] pb-[13px]">
          {/* Brand Logo & Info */}
          <div className="flex items-center gap-3 min-w-0 h-[41px] text-[10px] -ml-1">
            <div className="w-[43px] h-[43px] rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                  CYBER COP-404
                </h1>
                <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                  <span className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {dbConnected ? 'Live Database' : 'Connecting'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                <span>Code Detector</span>
                <span className="text-slate-300">•</span>
                <span className="text-teal-700 font-semibold">{totalSavedCount.toLocaleString()} Unique Saved</span>
              </p>
            </div>
          </div>

          {/* Nav Tabs & Terms */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => onTabChange('detector')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'detector'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
                <span>Detector</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange('saved')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'saved'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
                <span>Saved Codes</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${
                  activeTab === 'saved' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {totalSavedCount}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenTerms}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              title="Official Terms & Conditions"
            >
              <span>Terms</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

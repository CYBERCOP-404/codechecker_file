import React from 'react';
import { Shield, Github, ExternalLink, FileText } from 'lucide-react';

interface FooterProps {
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTerms }) => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto py-3.5 sm:py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Brand & Rights */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <div className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <span className="font-semibold text-white">All rights reserved © CYBER COP-404</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400">MD. NAHIDUL ISLAM</span>
          </div>

          {/* Links & Terms */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenTerms}
              className="inline-flex items-center gap-1.5 text-teal-300 hover:text-teal-200 hover:underline transition-colors py-1 px-2 rounded hover:bg-slate-800"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Terms & Conditions</span>
            </button>

            <span className="text-slate-700">|</span>

            <a
              href="https://github.com/CYBERCOP-404"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors py-1 px-2 rounded hover:bg-slate-800"
            >
              <Github className="w-3.5 h-3.5 text-teal-400" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

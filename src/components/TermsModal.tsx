import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Building2 } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Official Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-7 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-teal-900/80 text-teal-300 border border-teal-700/60">
                  OFFICIAL LEGAL DOCUMENT
                </span>
                <span className="text-xs text-slate-400">October 2026</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                Terms & Conditions — Code Detector
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 text-slate-700 text-sm leading-relaxed space-y-6">
          {/* Document Banner */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-3">
            <FileText className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-teal-950">
                Official User Agreement & Operational Guidelines
              </p>
              <p className="text-xs text-teal-800/90 mt-0.5">
                CYBER COP-404 • Developed and maintained by MD. NAHIDUL ISLAM.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="text-teal-600">1.</span> Introduction
            </h3>
            <p>
              Welcome to <strong>Code Detector</strong>, developed and maintained by{' '}
              <strong className="text-slate-900">CYBER COP-404</strong>. By accessing or using this
              website, you agree to the following Terms and Conditions. If you do not agree with
              these terms, please discontinue using the website.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="text-teal-600">2.</span> Purpose of the Website
            </h3>
            <p>
              Code Detector is a browser-based utility designed to help users identify codes from
              pasted text, detect duplicate codes, compare newly entered codes with previously
              saved codes, and copy unique codes for personal use.
            </p>
            <p className="font-medium text-slate-800">The website may provide features such as:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Extracting codes from text containing codes, serial numbers, or other information.</li>
              <li>Detecting duplicate codes within submitted text.</li>
              <li>Comparing codes against previously saved codes available in the current browser.</li>
              <li>Saving unique codes locally in the browser.</li>
              <li>Viewing saved codes and copying all saved or newly detected unique codes.</li>
            </ul>
            <p className="text-xs text-slate-500 italic">
              The accuracy of code detection depends on the format and content of the submitted text.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="text-teal-600">3.</span> No Server-Side Data Storage
            </h3>
            <p className="bg-amber-50/80 border border-amber-200 p-3 rounded-lg text-amber-950 font-medium">
              Code Detector does not maintain a server-side database of users&apos; codes. Codes
              processed or saved through the website are stored locally in the user&apos;s browser,
              using browser storage where supported.
            </p>
            <p className="font-medium text-slate-800">This means:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Codes saved in one browser or device are not automatically available in another browser or device.</li>
              <li>Clearing browser data, uninstalling or resetting the browser, using private browsing, changing devices, or certain browser settings may result in saved codes being lost.</li>
              <li>Browser storage availability and retention are controlled partly by the browser and the user&apos;s device.</li>
              <li>The website does not guarantee permanent storage, recovery, synchronization, or backup of saved codes.</li>
            </ul>
            <p className="text-xs text-slate-600">
              Users are responsible for managing their browser data and keeping any records they consider important.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="text-teal-600">4.</span> Data Loss and Availability
            </h3>
            <p>
              The website is provided on an <strong>“AS IS”</strong> and <strong>“AS AVAILABLE”</strong> basis. Although reasonable efforts may be made to keep the website functional, uninterrupted access and error-free operation are not guaranteed.
            </p>
            <p className="p-3 bg-slate-50 border-l-4 border-slate-400 text-slate-800 text-xs">
              To the fullest extent permitted by applicable law, <strong>MD. NAHIDUL ISLAM and CYBER COP-404 shall not be held responsible for loss, deletion, corruption, inaccessibility, or failure to retain codes or other data stored in the user&apos;s browser.</strong>
            </p>
            <p className="text-xs text-slate-600">
              This includes data loss resulting from browser updates, device failures, accidental deletion, storage limitations, software errors, or actions taken by the user or third-party software.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="text-teal-600">5.</span> User Responsibilities
            </h3>
            <p className="font-medium text-slate-800">Users agree to:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Use the website lawfully and responsibly.</li>
              <li>Ensure they have the right to process any text or codes they submit.</li>
              <li>Verify extracted codes before relying on them.</li>
              <li>Understand that code detection may produce incorrect or incomplete results.</li>
              <li>Avoid relying on browser storage as the sole permanent record of important information.</li>
            </ul>
            <p className="text-xs text-slate-600">
              Users are solely responsible for how they use, copy, share, or act upon the results generated by the website.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="text-teal-600">6.</span> No Warranty
            </h3>
            <p>
              CYBER COP-404 makes no express or implied warranties regarding the accuracy, reliability, completeness, availability, or suitability of the website for any particular purpose.
            </p>
            <p className="text-xs text-slate-600">
              We do not guarantee that every code will be detected correctly, that all duplicates will always be identified, or that the website will operate without errors.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="text-teal-600">7.</span> Limitation of Liability
            </h3>
            <p className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-lg text-xs text-rose-950">
              To the fullest extent permitted by applicable law, <strong>MD. NAHIDUL ISLAM, CYBER COP-404, and any associated contributors shall not be liable for any direct, indirect, incidental, consequential, or other losses arising from the use of, inability to use, or reliance on this website.</strong>
            </p>
            <p className="text-xs text-slate-600">
              This includes, without limitation, data loss, inaccurate results, missed codes, duplicate detection errors, service interruptions, and browser or device-related problems.
            </p>
            <p className="text-xs text-slate-500 italic">
              Nothing in these Terms excludes or limits liability where such exclusion or limitation is prohibited by applicable law.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="text-teal-600">8.</span> Third-Party Services and Links
            </h3>
            <p>
              The website may contain links to third-party websites, including GitHub. These websites are operated independently and are subject to their own terms and privacy policies.
            </p>
            <p className="text-xs text-slate-600">
              CYBER COP-404 does not control or guarantee the availability, content, security, or practices of third-party websites.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="text-teal-600">9.</span> Changes to the Website and Terms
            </h3>
            <p>
              CYBER COP-404 reserves the right to modify, suspend, or discontinue any website feature at any time, with or without notice.
            </p>
            <p className="text-xs text-slate-600">
              These Terms and Conditions may also be updated when necessary. Continued use of the website after an update constitutes acceptance of the revised terms, to the extent permitted by applicable law.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>10. Contact and Ownership</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1 text-slate-800">
              <div><strong>Website:</strong> Code Detector</div>
              <div><strong>Brand:</strong> CYBER COP-404</div>
              <div><strong>Developer / Owner:</strong> MD. NAHIDUL ISLAM</div>
              <div><strong>GitHub:</strong> https://github.com/CYBERCOP-404</div>
            </div>
          </section>

          {/* Section 11 */}
          <section className="space-y-2 pt-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="text-teal-600">11.</span> Acceptance of Terms
            </h3>
            <p className="text-xs text-slate-700">
              By using Code Detector, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Official Terms Active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors shadow-xs"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

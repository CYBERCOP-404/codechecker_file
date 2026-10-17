import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CodeDetector } from './components/CodeDetector';
import { SavedCodes } from './components/SavedCodes';
import { UnlockModal } from './components/UnlockModal';
import { TermsModal } from './components/TermsModal';
import { Toast, ToastMessage } from './components/Toast';
import { ActiveTab, StoredCode, DetectionResult } from './types';
import { formatOutputForClipboard, parseRawInput } from './utils/codeParser';

const LOCAL_STORAGE_KEY = 'cybercop404_saved_codes_v1';

function getLocalCodes(): StoredCode[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCodes(codes: StoredCode[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(codes));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('detector');
  const [savedCodes, setSavedCodes] = useState<StoredCode[]>([]);
  const [totalSavedCount, setTotalSavedCount] = useState<number>(0);
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState<boolean>(false);
  const [latestResult, setLatestResult] = useState<DetectionResult | null>(null);

  // Modals state
  const [unlockModalOpen, setUnlockModalOpen] = useState<boolean>(false);
  const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'detected' | 'all_codes'>('detected');
  const [activeCodesForModal, setActiveCodesForModal] = useState<string[]>([]);
  const [duplicateCountForModal, setDuplicateCountForModal] = useState<number>(0);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all saved codes from shared persistent database (or fallback to local storage on static hosts like Vercel)
  const fetchSavedCodes = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoadingSaved(true);
    try {
      const res = await fetch('/api/codes');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSavedCodes(data.codes || []);
          setTotalSavedCount(data.total || 0);
          setDbConnected(true);
          saveLocalCodes(data.codes || []);
          return;
        }
      }
      throw new Error('API unavailable');
    } catch {
      // Graceful fallback for static deployment (e.g. Vercel, Netlify)
      const local = getLocalCodes();
      setSavedCodes(local);
      setTotalSavedCount(local.length);
      setDbConnected(false);
    } finally {
      if (!quiet) setIsLoadingSaved(false);
    }
  }, []);

  // Initial load and periodic sync
  useEffect(() => {
    fetchSavedCodes();

    const interval = setInterval(() => {
      fetchSavedCodes(true);
    }, 8000);

    const handleFocus = () => {
      fetchSavedCodes(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchSavedCodes]);

  // Handle detection and auto-saving of new unique codes
  const handleDetectAndSave = async (
    candidateCodes: string[],
    rawParse: ReturnType<typeof parseRawInput>
  ): Promise<DetectionResult | null> => {
    setIsDetecting(true);
    try {
      const res = await fetch('/api/codes/check-and-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes: candidateCodes }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const result: DetectionResult = {
            newCodes: data.newCodes || [],
            newRecords: data.newRecords || [],
            alreadyInDbCodes: data.alreadyInDbCodes || [],
            alreadyInDbCount: data.alreadyInDbCount || 0,
            duplicateInInputCount: data.duplicateInInputCount || 0,
            duplicateInInputCodes: rawParse.duplicateInInput || [],
            ignoredCount: rawParse.ignoredItems.length,
            ignoredItems: rawParse.ignoredItems,
            totalSavedCount: data.totalSavedCount,
            processedAt: Date.now(),
          };

          setLatestResult(result);
          setTotalSavedCount(data.totalSavedCount);

          if (data.newRecords && data.newRecords.length > 0) {
            setSavedCodes((prev) => {
              const updated = [...data.newRecords, ...prev];
              saveLocalCodes(updated);
              return updated;
            });
          }

          setDbConnected(true);

          const totalDuplicates = (data.alreadyInDbCount || 0) + (data.duplicateInInputCount || 0);
          setActiveCodesForModal(data.newCodes || []);
          setDuplicateCountForModal(totalDuplicates);
          setModalMode('detected');
          setUnlockModalOpen(true);

          return result;
        }
      }
      throw new Error('API unavailable, running offline detection');
    } catch {
      // Local fallback detection for Vercel/offline environments
      const currentList = getLocalCodes();
      const currentMap = new Set(currentList.map((c) => c.normalized));
      const newlyAdded: StoredCode[] = [];
      const alreadyInDb: string[] = [];
      const duplicateInInput: string[] = [];
      const seenInInput = new Set<string>();

      for (const raw of candidateCodes) {
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const norm = trimmed.toUpperCase();

        if (seenInInput.has(norm)) {
          duplicateInInput.push(trimmed);
          continue;
        }
        seenInInput.add(norm);

        if (currentMap.has(norm)) {
          alreadyInDb.push(trimmed);
        } else {
          const newRec: StoredCode = {
            id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            code: trimmed,
            normalized: norm,
            createdAt: Date.now(),
          };
          currentMap.add(norm);
          newlyAdded.push(newRec);
        }
      }

      const updated = [...newlyAdded, ...currentList];
      saveLocalCodes(updated);
      setSavedCodes(updated);
      setTotalSavedCount(updated.length);

      const result: DetectionResult = {
        newCodes: newlyAdded.map((c) => c.code),
        newRecords: newlyAdded,
        alreadyInDbCodes: alreadyInDb,
        alreadyInDbCount: alreadyInDb.length,
        duplicateInInputCount: duplicateInInput.length,
        duplicateInInputCodes: rawParse.duplicateInInput || [],
        ignoredCount: rawParse.ignoredItems.length,
        ignoredItems: rawParse.ignoredItems,
        totalSavedCount: updated.length,
        processedAt: Date.now(),
      };

      setLatestResult(result);
      const totalDuplicates = alreadyInDb.length + duplicateInInput.length;
      setActiveCodesForModal(newlyAdded.map((c) => c.code));
      setDuplicateCountForModal(totalDuplicates);
      setModalMode('detected');
      setUnlockModalOpen(true);
      return result;
    } finally {
      setIsDetecting(false);
    }
  };

  // Reopen result popup on demand
  const handleReopenResultPopup = () => {
    if (!latestResult) return;
    const totalDuplicates = latestResult.alreadyInDbCount + latestResult.duplicateInInputCount;
    setActiveCodesForModal(latestResult.newCodes);
    setDuplicateCountForModal(totalDuplicates);
    setModalMode('detected');
    setUnlockModalOpen(true);
  };

  // Handle single code deletion
  const handleDeleteCode = async (id: string, codeString: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/codes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSavedCodes((prev) => {
            const updated = prev.filter((item) => item.id !== id);
            saveLocalCodes(updated);
            return updated;
          });
          setTotalSavedCount(data.totalSavedCount ?? Math.max(0, totalSavedCount - 1));
          addToast(`কোড "${codeString}" মুছে ফেলা হয়েছে।`, 'info');
          return true;
        }
      }
      throw new Error('API delete failed');
    } catch {
      // Local fallback deletion
      const updated = getLocalCodes().filter((item) => item.id !== id);
      saveLocalCodes(updated);
      setSavedCodes(updated);
      setTotalSavedCount(updated.length);
      addToast(`কোড "${codeString}" মুছে ফেলা হয়েছে।`, 'info');
      return true;
    }
  };

  // Trigger copy flow for newly detected unique codes
  const handleRequestCopyNew = (codes: string[]) => {
    if (!codes || codes.length === 0) return;
    setActiveCodesForModal(codes);
    setDuplicateCountForModal(
      latestResult ? latestResult.alreadyInDbCount + latestResult.duplicateInInputCount : 0
    );
    setModalMode('detected');
    setUnlockModalOpen(true);
  };

  // Trigger copy flow for ALL saved unique codes
  const handleRequestCopyAll = () => {
    const allUniqueCodes = savedCodes.map((item) => item.code);
    if (allUniqueCodes.length === 0) {
      addToast('ডাটাবেজে কপি করার মতো কোনো সংরক্ষিত কোড নেই।', 'info');
      return;
    }
    setActiveCodesForModal(allUniqueCodes);
    setDuplicateCountForModal(0);
    setModalMode('all_codes');
    setUnlockModalOpen(true);
  };

  // Executed when copy is confirmed through unlock modal
  const handleExecuteCopy = async (codesToCopy: string[]) => {
    const formatted = formatOutputForClipboard(codesToCopy);

    try {
      await navigator.clipboard.writeText(formatted);
      addToast(
        `${codesToCopy.length} টি কোড কপি হয়েছে! (CYBER COP-404 ফরম্যাট)`,
        'success'
      );
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = formatted;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      addToast(`${codesToCopy.length} টি কোড কপি হয়েছে!`, 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalSavedCount={totalSavedCount}
        dbConnected={dbConnected}
        onOpenTerms={() => setTermsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {activeTab === 'detector' ? (
          <CodeDetector
            onDetectAndSave={handleDetectAndSave}
            onRequestCopyNew={handleRequestCopyNew}
            onRequestCopyAll={handleRequestCopyAll}
            totalSavedCount={totalSavedCount}
            isLoading={isDetecting}
            latestResult={latestResult}
            onClearLatestResult={() => setLatestResult(null)}
            onReopenResultPopup={handleReopenResultPopup}
          />
        ) : (
          <SavedCodes
            savedCodes={savedCodes}
            onDeleteCode={handleDeleteCode}
            onRequestCopyAll={handleRequestCopyAll}
            onGoToDetector={() => setActiveTab('detector')}
            isLoading={isLoadingSaved}
          />
        )}
      </main>

      {/* Bangla Detection & Unlock Popup Modal */}
      <UnlockModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        onCopyConfirmed={handleExecuteCopy}
        nonDuplicateCodes={activeCodesForModal}
        duplicateCount={duplicateCountForModal}
        mode={modalMode}
      />

      {/* Official Terms & Conditions Modal */}
      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Persistent Slim Brand Footer */}
      <Footer onOpenTerms={() => setTermsModalOpen(true)} />
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import HeaderCarousel from './components/HeaderCarousel';
import PromptsSection from './components/PromptsSection';
import AmbassadorsSection from './components/AmbassadorsSection';
import DoubtsSection from './components/DoubtsSection';
import AdminPanel from './components/AdminPanel';
import { fetchPrompts, fetchAmbassadors, fetchDoubts } from './lib/supabase';

export default function App() {
  const [activeSection, setActiveSection] = useState('prompts'); // 'prompts' | 'ambassadors' | 'doubts'
  const [isAdminView, setIsAdminView] = useState(
    () =>
      window.location.hash === '#admin' ||
      window.location.pathname.endsWith('/admin')
  );

  const [prompts, setPrompts] = useState([]);
  const [ambassadors, setAmbassadors] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 2600);
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      const [promptsData, ambassadorsData, doubtsData] = await Promise.all([
        fetchPrompts(),
        fetchAmbassadors(),
        fetchDoubts(),
      ]);
      setPrompts(promptsData);
      setAmbassadors(ambassadorsData);
      setDoubts(doubtsData);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin');
    };
    const handleSecretShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        openAdmin();
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleSecretShortcut);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleSecretShortcut);
    };
  }, []);

  const openAdmin = () => {
    window.location.hash = 'admin';
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitAdmin = () => {
    if (window.location.hash === '#admin') {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
    setIsAdminView(false);
    loadAllData();
  };

  return (
    <div className="min-h-screen flex flex-col text-gray-800 antialiased">
      {isAdminView ? (
        <AdminPanel
          prompts={prompts}
          ambassadors={ambassadors}
          doubts={doubts}
          onRefreshData={loadAllData}
          onExitAdmin={exitAdmin}
          onShowToast={showToast}
        />
      ) : (
        <>
          <HeaderCarousel
            activeSection={activeSection}
            onSelectSection={(sec) => {
              setActiveSection(sec);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            onOpenAdmin={openAdmin}
            totalPromptsCount={prompts.filter((p) => p.is_active !== false).length}
          />

          <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
            {isLoading ? (
              <div className="space-y-4 py-8">
                <div className="h-12 bg-white/70 rounded-2xl animate-pulse" />
                <div className="h-64 bg-white/70 rounded-2xl animate-pulse" />
              </div>
            ) : (
              <>
                {activeSection === 'prompts' && (
                  <PromptsSection
                    prompts={prompts}
                    searchQuery={searchQuery}
                    onClearSearch={() => setSearchQuery('')}
                    onShowToast={showToast}
                  />
                )}

                {activeSection === 'ambassadors' && (
                  <AmbassadorsSection
                    ambassadors={ambassadors}
                    onGoToDoubts={() => {
                      setActiveSection('doubts');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}

                {activeSection === 'doubts' && (
                  <DoubtsSection
                    onShowToast={showToast}
                    onBackToPrompts={() => {
                      setActiveSection('prompts');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}
              </>
            )}
          </main>

          {/* Pie de página con acceso discreto para embajadores */}
          <footer className="w-full py-6 px-4 text-center text-xs text-gray-500 border-t border-gray-200/80 mt-auto">
            <div className="max-w-5xl mx-auto flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={openAdmin}
                aria-label="Comunidad Universitaria"
                className="inline-flex items-center justify-center p-1 rounded-full text-gray-400/70 hover:text-gray-500 transition-colors cursor-default"
              >
                <img
                  src="/gemini.png"
                  alt=""
                  className="w-4 h-4 object-contain opacity-60 hover:opacity-100 transition-opacity"
                />
              </button>
              <span>Comunidad Universitaria · Embajadores para Google Gemini</span>
            </div>
          </footer>
        </>
      )}

      {/* Toast Global de Confirmación */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 transform transition-all duration-300 z-50 pointer-events-none ${
          isToastVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <span className="text-sm font-medium">{toastMessage}</span>
      </div>
    </div>
  );
}

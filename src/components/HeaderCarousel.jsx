import React, { useEffect, useRef } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

const SECTIONS = [
  {
    id: 'prompts',
    title: 'BIBLIOTECA DE PROMPTS',
    shortLabel: 'Biblioteca de Prompts',
    subtitle: 'Copia y personaliza prompts probados para potenciar tu estudio con Gemini',
    useOriginalBanner: true,
    headerBg: 'bg-[#F5BF23]',
    isDarkBg: false,
  },
  {
    id: 'ambassadors',
    title: 'EMBAJADORES GEMINI',
    shortLabel: 'Nuestro Equipo',
    subtitle: 'Conoce a los estudiantes embajadores de Google en nuestra universidad',
    useOriginalBanner: false,
    iconType: 'team',
    headerBg: 'bg-[#0085FF]',
    isDarkBg: true,
  },
  {
    id: 'doubts',
    title: 'BUZÓN DE DUDAS',
    shortLabel: 'Buzón de Dudas',
    subtitle: '¿Tienes preguntas sobre Gemini o prompts? Escríbenos y te ayudamos',
    useOriginalBanner: false,
    iconType: 'doubts',
    headerBg: 'bg-[#EA4335]',
    isDarkBg: true,
  },
];

export default function HeaderCarousel({
  activeSection,
  onSelectSection,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  setIsSearchOpen,
  onOpenAdmin,
  totalPromptsCount,
}) {
  const searchInputRef = useRef(null);
  const touchStartXRef = useRef(null);

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeSection);
  const currentSectionObj = SECTIONS[activeIndex] || SECTIONS[0];

  // Determinar posición relativa (-1 = izquierda, 0 = centro/frente, 1 = derecha)
  const getRelativePosition = (index) => {
    const diff = (index - activeIndex + SECTIONS.length) % SECTIONS.length;
    if (diff === 0) return 'center';
    if (diff === 1) return 'right';
    return 'left';
  };

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + SECTIONS.length) % SECTIONS.length;
    onSelectSection(SECTIONS[prevIndex].id);
  };

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % SECTIONS.length;
    onSelectSection(SECTIONS[nextIndex].id);
  };

  // Soporte táctil (Swipe en celulares y tablets)
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    if (Math.abs(deltaX) > 42) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    touchStartXRef.current = null;
  };

  // Soporte de teclado (Flechas izquierda/derecha cuando no se está escribiendo en un input)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        if (e.key === 'Escape' && isSearchOpen) {
          onSearchChange('');
          setIsSearchOpen(false);
        }
        return;
      }
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '/' && activeSection === 'prompts') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, isSearchOpen, activeSection]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  return (
    <>
      {/* ================= SECCIÓN SUPERIOR CON TRANSICIÓN DE COLOR GEMINI Y CARRUSEL 3D ================= */}
      <header
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-full ${currentSectionObj.headerBg} transition-colors duration-500 ease-in-out relative pt-6 pb-8 sm:pt-10 sm:pb-11 px-3 sm:px-4 flex flex-col items-center justify-center overflow-hidden select-none`}
      >
        {/* Barra de utilidades superior: Buscador alineado a la derecha */}
        <div className="w-full max-w-6xl flex items-center justify-end gap-2 mb-3 sm:mb-6 z-30 px-1">
          {/* Buscador interactivo adaptable a pantallas pequeñas */}
          <div className={`flex items-center justify-end ${isSearchOpen ? 'flex-1 sm:flex-initial' : ''}`}>
            {isSearchOpen ? (
              <div className="flex items-center bg-white rounded-full shadow-md px-3.5 py-1.5 border border-black/10 w-full sm:w-80 transition-all">
                <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    if (activeSection !== 'prompts') {
                      onSelectSection('prompts');
                    }
                  }}
                  placeholder={`Buscar en ${totalPromptsCount} prompts...`}
                  className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent min-w-0"
                  aria-label="Buscar prompts por palabra clave"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-full flex-shrink-0"
                    title="Limpiar texto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setIsSearchOpen(false);
                  }}
                  className="ml-1 text-xs font-medium text-gray-500 hover:text-gray-800 px-1.5 py-0.5 rounded flex-shrink-0"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(true);
                  if (activeSection !== 'prompts') {
                    onSelectSection('prompts');
                  }
                }}
                aria-label="Buscar prompts"
                title="Buscar prompts (Atajo: tecla /)"
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                  currentSectionObj.isDarkBg
                    ? 'bg-black/20 hover:bg-black/35 text-white border border-white/25'
                    : 'bg-white/50 hover:bg-white/85 text-gray-900'
                }`}
              >
                <svg
                  className="w-4 h-4 stroke-[2.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                  />
                </svg>
                <span>Buscar</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= ESCENARIO DEL CARRUSEL (3 TARJETAS PÍLDORA) ================= */}
        <div
          className="carousel-stage relative w-full max-w-6xl h-24 sm:h-36 md:h-40 flex items-center justify-center my-1"
          role="region"
          aria-label="Selector de secciones principales"
        >
          {/* Botón Anterior (Izquierda) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Ir a la sección anterior"
            className="absolute left-0 sm:left-3 z-40 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md hover:shadow-lg flex items-center justify-center transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>

          {/* Tarjetas del Carrusel */}
          {SECTIONS.map((sec, idx) => {
            const pos = getRelativePosition(idx);

            let positionClasses = '';
            if (pos === 'center') {
              positionClasses =
                'z-30 translate-x-0 scale-100 opacity-100 shadow-2xl ring-4 ring-white/80 cursor-default';
            } else if (pos === 'left') {
              positionClasses =
                'z-10 -translate-x-[46%] sm:-translate-x-[62%] md:-translate-x-[68%] scale-[0.62] sm:scale-[0.72] opacity-70 sm:opacity-75 hover:opacity-95 shadow-lg cursor-pointer hover:scale-[0.66] sm:hover:scale-[0.76]';
            } else {
              positionClasses =
                'z-10 translate-x-[46%] sm:translate-x-[62%] md:translate-x-[68%] scale-[0.62] sm:scale-[0.72] opacity-70 sm:opacity-75 hover:opacity-95 shadow-lg cursor-pointer hover:scale-[0.66] sm:hover:scale-[0.76]';
            }

            return (
              <div
                key={sec.id}
                role="button"
                tabIndex={0}
                aria-current={pos === 'center' ? 'page' : undefined}
                aria-label={`Cambiar a sección ${sec.shortLabel}`}
                onClick={() => {
                  if (pos !== 'center') onSelectSection(sec.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSection(sec.id);
                  }
                }}
                className={`carousel-card absolute flex items-center justify-center bg-white rounded-full px-4 sm:px-9 py-2.5 sm:py-4 w-[76%] max-w-[290px] sm:max-w-[520px] md:max-w-[590px] min-h-[68px] sm:min-h-[108px] group ${positionClasses}`}
              >
                {/* Etiqueta flotante de ayuda cuando está a los lados (pantallas medianas/grandes) */}
                {pos !== 'center' && (
                  <span className="hidden sm:inline-block -top-3.5 absolute bg-gray-900 text-white text-[11px] font-semibold px-3 py-0.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Haz clic para abrir {sec.shortLabel}
                  </span>
                )}

                {sec.useOriginalBanner ? (
                  <img
                    src="/bblioteca.png"
                    alt="BIBLIOTECA DE PROMPTS"
                    className="w-full max-w-xl h-auto max-h-14 sm:max-h-24 object-contain select-none pointer-events-none"
                  />
                ) : (
                  <div className="flex items-center justify-center gap-2.5 sm:gap-5 w-full py-0.5 sm:py-1">
                    {/* Ilustración estilo 3D coherente con el ícono de libros de bblioteca.png */}
                    {sec.iconType === 'team' ? (
                      <div className="relative flex-shrink-0 w-10 h-10 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#0085FF] via-blue-600 to-indigo-800 shadow-md flex items-center justify-center transform -rotate-3">
                        <span className="text-xl sm:text-3xl filter drop-shadow">🎓</span>
                        <span className="absolute -top-1 -right-1 text-xs sm:text-base">✨</span>
                      </div>
                    ) : (
                      <div className="relative flex-shrink-0 w-10 h-10 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#EA4335] via-red-600 to-rose-800 shadow-md flex items-center justify-center transform rotate-3">
                        <span className="text-xl sm:text-3xl filter drop-shadow">💬</span>
                        <span className="absolute -top-1 -right-1 text-xs sm:text-base">✦</span>
                      </div>
                    )}

                    <span className="font-brand font-black text-black tracking-tight text-sm sm:text-2xl md:text-[27px] leading-tight uppercase text-left">
                      {sec.title}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Botón Siguiente (Derecha) */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Ir a la sección siguiente"
            className="absolute right-0 sm:right-3 z-40 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md hover:shadow-lg flex items-center justify-center transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Subtítulo contextual de la sección activa con contraste automático */}
        <p
          className={`text-xs sm:text-sm font-medium text-center max-w-xl mt-2 px-4 transition-colors duration-300 ${
            currentSectionObj.isDarkBg ? 'text-white/95' : 'text-gray-900/90'
          }`}
        >
          {currentSectionObj.subtitle}
        </p>

        {/* Indicadores de posición del carrusel (3 puntos interactivos) */}
        <div className="flex items-center gap-2 mt-3" role="tablist" aria-label="Indicador de sección">
          {SECTIONS.map((sec) => {
            const isActive = sec.id === activeSection;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                aria-label={`Ir a ${sec.shortLabel}`}
                aria-selected={isActive}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? currentSectionObj.isDarkBg
                      ? 'w-7 bg-white'
                      : 'w-7 bg-gray-900'
                    : currentSectionObj.isDarkBg
                    ? 'w-2 bg-white/45 hover:bg-white/75'
                    : 'w-2 bg-gray-900/30 hover:bg-gray-900/60'
                }`}
              />
            );
          })}
        </div>
      </header>

      {/* ================= FRANJA NEGRA INTERMEDIA CON BOTÓN GOOGLE GEMINI ================= */}
      <nav
        aria-label="Acceso directo a Google Gemini"
        className="w-full bg-black py-4 px-4 flex items-center justify-center shadow-md"
      >
        <a
          href="https://goo.gle/prueba-Gemini"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex h-10 gap-2.5 bg-white text-black hover:bg-gray-100 rounded-full px-6 py-2 shadow-sm transition-all duration-200 transform hover:scale-105 active:scale-95 items-center"
          title="Abrir Google Gemini en una nueva pestaña"
        >
          <img
            src="/accede.png"
            alt="Accede a Google Gemini"
            className="w-full max-w-xl h-12 object-contain transform hover:scale-[1.01] transition-transform duration-200 items-center"
          />
        </a>
      </nav>
    </>
  );
}

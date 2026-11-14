import React, { useState } from 'react';
import { ChevronDown, Copy, Check, SearchX, ChevronsUpDown } from 'lucide-react';

const BADGE_STYLES = {
  blue: 'text-blue-600 bg-blue-50 border-blue-200',
  purple: 'text-purple-600 bg-purple-50 border-purple-200',
  emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  amber: 'text-amber-800 bg-amber-50 border-amber-200',
  rose: 'text-rose-600 bg-rose-50 border-rose-200',
};

const PILL_STYLES = {
  gray: 'bg-gray-50 border-gray-200 text-gray-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  dark: 'bg-gray-100 border-gray-300 text-gray-900',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
};

export default function PromptsSection({
  prompts,
  searchQuery,
  onClearSearch,
  onShowToast,
}) {
  // Por defecto todos los acordeones de prompts inician contraídos
  const [expandedIds, setExpandedIds] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const activePrompts = prompts.filter((p) => p.is_active !== false);

  const filteredPrompts = activePrompts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.badge_text?.toLowerCase().includes(q) ||
      p.prompt_content?.toLowerCase().includes(q) ||
      p.instruction_note?.toLowerCase().includes(q)
    );
  });

  const toggleItem = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allCollapsed =
    filteredPrompts.length > 0 &&
    filteredPrompts.every((p) => !expandedIds[p.id]);

  const toggleAll = () => {
    if (allCollapsed) {
      const next = {};
      filteredPrompts.forEach((p) => {
        next[p.id] = true;
      });
      setExpandedIds(next);
    } else {
      setExpandedIds({});
    }
  };

  const handleCopy = async (prompt) => {
    const textToCopy = prompt.prompt_content || '';
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(prompt.id);
      onShowToast('¡Prompt copiado al portapapeles!');
      setTimeout(() => {
        setCopiedId((current) => (current === prompt.id ? null : current));
      }, 2200);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra superior informativa y control rápido de acordeones */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-blue-200/60">
        <div className="text-sm text-gray-600">
          {searchQuery.trim() ? (
            <span>
              Mostrando <strong className="text-gray-900">{filteredPrompts.length}</strong>{' '}
              resultado(s) para <span className="font-semibold text-blue-700">"{searchQuery}"</span>
            </span>
          ) : (
            <span>
              Explora <strong className="text-gray-900">{filteredPrompts.length}</strong> prompts
              listos para copiar y usar en Google Gemini
            </span>
          )}
        </div>

        {filteredPrompts.length > 1 && (
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007CF0] hover:text-blue-800 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <span>{allCollapsed ? 'Desplegar todos' : 'Contraer todos'}</span>
          </button>
        )}
      </div>

      {/* Estado vacío si la búsqueda no arroja coincidencias */}
      {filteredPrompts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-10 text-center max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0085FF] flex items-center justify-center mx-auto mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            No encontramos prompts con "{searchQuery}"
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            Intenta con otra palabra clave o revisa todos los prompts disponibles en la biblioteca.
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="inline-flex items-center justify-center bg-[#0085FF] hover:bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              Ver todos los prompts
            </button>
          )}
        </div>
      ) : (
        filteredPrompts.map((prompt, index) => {
          const isExpanded = Boolean(expandedIds[prompt.id]);
          const isCopied = copiedId === prompt.id;
          const badgeClass = BADGE_STYLES[prompt.badge_color] || BADGE_STYLES.blue;
          const pills = Array.isArray(prompt.visual_pills) ? prompt.visual_pills : [];

          return (
            <section
              key={prompt.id || index}
              className="border-b border-gray-300 pb-5 transition-all"
            >
              {/* Encabezado del Acordeón */}
              <button
                type="button"
                onClick={() => toggleItem(prompt.id)}
                className="w-full flex items-center justify-between text-left py-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg px-1 transition-colors"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3 pr-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-brand tracking-wide text-[#007CF0] group-hover:text-blue-700 transition-colors uppercase">
                    {prompt.title}
                  </h2>
                </div>

                <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors flex-shrink-0">
                  <ChevronDown
                    className={`w-6 h-6 text-gray-600 group-hover:text-blue-600 stroke-[2.5] transition-transform duration-300 ${
                      isExpanded ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </div>
              </button>

              {/* Contenido Desplegable */}
              {isExpanded && (
                <div className="mt-3 animate-fadeIn">
                  <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 sm:p-8 space-y-6">
                    {/* Encabezado de la Tarjeta del Prompt */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                      <div>
                        <span
                          className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-1.5 border ${badgeClass}`}
                        >
                          {prompt.badge_text || `Prompt Destacado 0${index + 1}`}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                          <span>{prompt.emoji || '✨'}</span>
                          <span>{prompt.title}</span>
                        </h3>
                      </div>

                      {/* Botón Copiar Prompt (ancho completo en celular para fácil toque) */}
                      <button
                        type="button"
                        onClick={() => handleCopy(prompt)}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-150 self-start sm:self-auto cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-[#0085FF] hover:bg-blue-600 active:bg-blue-700'
                        }`}
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>{isCopied ? '¡Copiado!' : 'Copiar Prompt'}</span>
                      </button>
                    </div>

                    {/* Nota de instrucción opcional */}
                    {prompt.instruction_note && (
                      <p className="text-sm text-gray-600 italic bg-amber-50/80 border-l-4 border-amber-400 p-3.5 rounded-r-lg">
                        {prompt.instruction_note}
                      </p>
                    )}

                    {/* Píldoras visuales opcionales (ej. 6 Sombreros para pensar) */}
                    {pills.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 pb-2">
                        {pills.map((pill, idx) => {
                          const pStyle = PILL_STYLES[pill.color] || PILL_STYLES.gray;
                          return (
                            <div
                              key={idx}
                              className={`border rounded-lg p-2 text-center text-xs font-semibold ${pStyle}`}
                            >
                              {pill.label}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Bloque de Texto del Prompt */}
                    <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 text-gray-800 leading-relaxed text-sm sm:text-base font-sans select-all whitespace-pre-line">
                      {prompt.prompt_content}
                    </div>
                  </div>
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}

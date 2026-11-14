import React from 'react';
import { Sparkles, GraduationCap, Linkedin, Instagram, MessageSquareHeart } from 'lucide-react';

const AVATAR_GRADIENTS = [
  'from-[#0085FF] to-indigo-700',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-700',
  'from-purple-600 to-pink-600',
];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}

export default function AmbassadorsSection({ ambassadors, onGoToDoubts }) {
  const activeMembers = ambassadors.filter((m) => m.is_active !== false);

  return (
    <div className="space-y-8">
      {/* Encabezado de bienvenida de la sección */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            Equipo Universitario Google Gemini
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-brand text-gray-900 tracking-tight">
            Conoce a tus Embajadores
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Somos un equipo multidisciplinario combinando tecnología, comercio y administración para
            acercar las herramientas de Inteligencia Artificial de Google a cada carrera de nuestra
            universidad.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToDoubts}
          className="inline-flex items-center gap-2 bg-[#0085FF] hover:bg-blue-600 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-sm transition-all flex-shrink-0"
        >
          <MessageSquareHeart className="w-4 h-4" />
          <span>Pregúntanos algo</span>
        </button>
      </div>

      {/* Grid de Tarjetas de Embajadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeMembers.map((member, idx) => {
          const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];

          return (
            <article
              key={member.id || idx}
              className="bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              {/* Franja decorativa superior */}
              <div className="h-20 bg-gradient-to-r from-[#F5BF23]/90 via-amber-300 to-[#0085FF]/85 relative" />

              <div className="px-6 pb-6 flex-1 flex flex-col">
                {/* Foto de perfil o Avatar con Iniciales */}
                <div className="-mt-12 mb-4 flex items-end justify-between">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={`Foto de ${member.full_name}`}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                    />
                  ) : (
                    <div
                      className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} border-4 border-white shadow-md flex items-center justify-center text-white font-brand font-black text-2xl select-none`}
                    >
                      {getInitials(member.full_name) || 'G'}
                    </div>
                  )}

                  {/* Redes Sociales (si están configuradas) */}
                  <div className="flex items-center gap-2 pb-1">
                    {member.linkedin_url && (
                      <a
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`LinkedIn de ${member.full_name}`}
                        title="Ver perfil de LinkedIn"
                        className="p-2 rounded-lg text-gray-500 hover:text-[#0077B5] hover:bg-blue-50 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.instagram_url && (
                      <a
                        href={member.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Instagram de ${member.full_name}`}
                        title="Ver perfil de Instagram"
                        className="p-2 rounded-lg text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Nombre, Rol y Carrera */}
                <div className="mb-4">
                  <span className="inline-block text-xs font-semibold text-[#007CF0] bg-blue-50 px-2.5 py-0.5 rounded-md mb-1">
                    {member.role_title}
                  </span>
                  <h3 className="text-xl font-extrabold font-brand text-gray-900">
                    {member.full_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-1">
                    <GraduationCap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>{member.career}</span>
                  </div>
                </div>

                {/* Biografía / About Me */}
                <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1">
                  {member.bio}
                </p>

                {/* Tip o Uso Favorito de Gemini */}
                {member.favorite_prompt && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mt-auto">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1">
                      <span>💡</span> Cómo uso Gemini en mi carrera:
                    </div>
                    <p className="text-xs text-gray-700 italic leading-relaxed">
                      "{member.favorite_prompt}"
                    </p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

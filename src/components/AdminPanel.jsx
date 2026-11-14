import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Mail,
  Upload,
  LogOut,
  BookOpen,
  Users,
  Inbox,
  Sparkles,
  AlertTriangle,
  X,
  Database,
  Lock,
  Image as ImageIcon,
  KeyRound,
} from 'lucide-react';
import {
  supabase,
  isSupabaseConfigured,
  savePrompt,
  deletePromptById,
  saveAmbassador,
  deleteAmbassadorById,
  uploadAmbassadorAvatar,
  uploadAmbassadorBanner,
  updateDoubtStatus,
  deleteDoubtById,
} from '../lib/supabase';

const EMOJI_PRESETS = ['🧠', '🎩', '📊', '💡', '🚀', '📚', '✍️', '🎯', '💼', '✨'];

const COLOR_OPTIONS = [
  { id: 'blue', label: 'Azul Gemini', sample: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'purple', label: 'Morado Creativo', sample: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'emerald', label: 'Verde Éxito', sample: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { id: 'amber', label: 'Ámbar Destacado', sample: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'rose', label: 'Rosa Dinámico', sample: 'bg-rose-100 text-rose-700 border-rose-300' },
];

export default function AdminPanel({
  prompts,
  ambassadors,
  doubts,
  onRefreshData,
  onExitAdmin,
  onShowToast,
}) {
  const [session, setSession] = useState(null);
  const [demoUnlocked, setDemoUnlocked] = useState(!isSupabaseConfigured);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('prompts'); // 'prompts' | 'ambassadors' | 'doubts'
  const [doubtFilter, setDoubtFilter] = useState('all'); // 'all' | 'pendiente' | 'respondida'

  // Estados de edición de Prompt
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);

  // Estados de edición de Embajador
  const [editingAmbassador, setEditingAmbassador] = useState(null);
  const [isSavingAmbassador, setIsSavingAmbassador] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Confirmación antes de eliminar (Prevención de errores)
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'prompt'|'ambassador'|'doubt', id, title }

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data?.session || null);
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });
      return () => listener?.subscription?.unsubscribe();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!isSupabaseConfigured) {
      setDemoUnlocked(true);
      return;
    }
    setIsLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) throw error;
      onShowToast('Sesión iniciada correctamente');
    } catch (err) {
      setLoginError(
        'Correo o contraseña incorrectos. Verifica tus datos o consulta con el administrador técnico.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setDemoUnlocked(false);
    onExitAdmin();
  };

  // ================= MANEJO DE PROMPTS =================
  const openNewPromptModal = () => {
    setEditingPrompt({
      title: '',
      emoji: '🧠',
      badge_text: `Prompt Destacado 0${prompts.length + 1}`,
      badge_color: 'blue',
      instruction_note:
        'Copia y pega este prompt en tu chat con Gemini. Rellena los campos entre corchetes con tus datos.',
      prompt_content: '',
      display_order: prompts.length + 1,
      is_active: true,
      visual_pills: [],
    });
  };

  const handleSavePromptForm = async (e) => {
    e.preventDefault();
    if (!editingPrompt.title?.trim() || !editingPrompt.prompt_content?.trim()) {
      onShowToast('Por favor completa el título y el texto del prompt');
      return;
    }
    setIsSavingPrompt(true);
    try {
      await savePrompt(editingPrompt);
      await onRefreshData();
      setEditingPrompt(null);
      onShowToast('¡Prompt guardado y actualizado en la web!');
    } catch (err) {
      console.error(err);
      onShowToast('Error al guardar el prompt');
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const handleTogglePromptActive = async (prompt) => {
    try {
      await savePrompt({ ...prompt, is_active: !prompt.is_active });
      await onRefreshData();
      onShowToast(
        !prompt.is_active
          ? `Prompt "${prompt.title}" ahora es visible`
          : `Prompt "${prompt.title}" se ocultó del público`
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ================= MANEJO DE EMBAJADORES =================
  const openNewAmbassadorModal = () => {
    setEditingAmbassador({
      full_name: '',
      email: '',
      newPassword: '',
      career: '',
      role_title: 'Embajador(a) Google Gemini',
      bio: '',
      favorite_prompt: '',
      avatar_url: '',
      banner_url: '',
      linkedin_url: '',
      instagram_url: '',
      display_order: ambassadors.length + 1,
      is_active: true,
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const url = await uploadAmbassadorAvatar(file);
      setEditingAmbassador((prev) => ({ ...prev, avatar_url: url }));
      onShowToast('Foto de perfil ajustada (400×400 px) y cargada');
    } catch (err) {
      console.error(err);
      onShowToast('No se pudo subir la imagen. Intenta con otra foto.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    try {
      const url = await uploadAmbassadorBanner(file);
      setEditingAmbassador((prev) => ({ ...prev, banner_url: url }));
      onShowToast('Banner ajustado automáticamente (900×300 px) y cargado');
    } catch (err) {
      console.error(err);
      onShowToast('No se pudo subir el banner. Intenta con otra imagen.');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSaveAmbassadorForm = async (e) => {
    e.preventDefault();
    if (!editingAmbassador.full_name?.trim() || !editingAmbassador.career?.trim()) {
      onShowToast('Por favor escribe el nombre y la carrera del embajador(a)');
      return;
    }
    if (!editingAmbassador.email?.trim()) {
      onShowToast('Por favor ingresa el correo electrónico de acceso');
      return;
    }
    if (
      editingAmbassador.newPassword &&
      editingAmbassador.newPassword.trim().length > 0 &&
      editingAmbassador.newPassword.trim().length < 6
    ) {
      onShowToast('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    const isCreatingNew =
      !editingAmbassador.id || String(editingAmbassador.id).startsWith('amb-');

    setIsSavingAmbassador(true);
    try {
      await saveAmbassador(editingAmbassador, {
        email: editingAmbassador.email,
        newPassword: editingAmbassador.newPassword,
      });

      if (!isCreatingNew && isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.refreshSession();
        if (data?.session) {
          setSession(data.session);
        }
      }

      await onRefreshData();
      setEditingAmbassador(null);
      onShowToast(
        isCreatingNew
          ? '¡Nuevo embajador(a) registrado con contraseña inicial Embajadores2026!'
          : '¡Tu perfil y datos de cuenta se actualizaron correctamente!'
      );
    } catch (err) {
      console.error(err);
      onShowToast(err.message || 'Error al guardar el perfil');
    } finally {
      setIsSavingAmbassador(false);
    }
  };

  // ================= ELIMINACIÓN SEGURA CON CONFIRMACIÓN =================
  const executeConfirmedDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'prompt') {
        await deletePromptById(confirmDelete.id);
        onShowToast('Prompt eliminado');
      } else if (confirmDelete.type === 'ambassador') {
        await deleteAmbassadorById(confirmDelete.id);
        onShowToast('Perfil eliminado');
      } else if (confirmDelete.type === 'doubt') {
        await deleteDoubtById(confirmDelete.id);
        onShowToast('Duda eliminada del registro');
      }
      await onRefreshData();
    } catch (err) {
      console.error(err);
      onShowToast('No se pudo completar la acción');
    } finally {
      setConfirmDelete(null);
    }
  };

  // ================= LOGIN SI SUPABASE ESTÁ ACTIVO Y NO HAY SESIÓN =================
  const isAuthenticated = Boolean(session || demoUnlocked);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#EDF4FC] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-blue-100 shadow-lg p-8">
          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la página pública</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#F5BF23] flex items-center justify-center font-brand font-black text-lg">
              G
            </div>
            <div>
              <h1 className="text-xl font-extrabold font-brand text-gray-900">
                Panel de Embajadores
              </h1>
              <p className="text-xs text-gray-500">
                Administración de Prompts, Perfiles y Dudas
              </p>
            </div>
          </div>

          {loginError && (
            <div className="my-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs text-red-700">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 mt-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Correo de Embajador(a)
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="tu.correo@universidad.edu"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0085FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0085FF]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#0085FF] hover:bg-blue-600 text-white font-semibold text-sm py-3 rounded-xl shadow-sm transition-colors"
            >
              {isLoggingIn ? 'Iniciando sesión...' : 'Entrar al Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingDoubtsCount = doubts.filter((d) => d.status !== 'respondida').length;
  const filteredDoubts = doubts.filter((d) => {
    if (doubtFilter === 'all') return true;
    return d.status === doubtFilter;
  });

  return (
    <div className="min-h-screen bg-[#EDF4FC] flex flex-col">
      {/* Encabezado Superior del Panel Admin */}
      <header className="bg-gray-900 text-white py-4 px-4 sm:px-8 shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#F5BF23] text-black font-brand font-black flex items-center justify-center text-base">
              ✨
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold font-brand tracking-wide">
                PANEL DE CONTROL · EMBAJADORES GEMINI
              </h1>
              <p className="text-xs text-gray-400">
                Actualiza prompts, perfiles del equipo y responde dudas sin tocar código
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver Página Pública</span>
            </button>

            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Aviso de estado de conexión (Modo Local vs Conectado a Supabase) */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6">
        {!isSupabaseConfigured ? (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900">
            <div className="flex items-start sm:items-center gap-3">
              <Database className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <strong>Modo Prueba Activo (Guardado en este navegador):</strong> Puedes crear y
                editar prompts, embajadores y dudas ahora mismo. Cuando agregues tus llaves de
                Supabase en el archivo <code>.env</code>, todo se guardará en la nube.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Conectado en vivo con tu base de datos Supabase</span>
          </div>
        )}
      </div>

      {/* Pestañas del Panel Admin */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-2 rounded-2xl border border-blue-100 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'prompts'
                ? 'bg-[#0085FF] text-white shadow-sm'
                : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Biblioteca de Prompts ({prompts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ambassadors')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'ambassadors'
                ? 'bg-[#0085FF] text-white shadow-sm'
                : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Equipo Embajadores ({ambassadors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('doubts')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'doubts'
                ? 'bg-[#0085FF] text-white shadow-sm'
                : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>3. Buzón de Dudas</span>
            {pendingDoubtsCount > 0 && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-extrabold ${
                  activeTab === 'doubts'
                    ? 'bg-[#F5BF23] text-black'
                    : 'bg-red-500 text-white'
                }`}
              >
                {pendingDoubtsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenido Principal del Panel */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 flex-1">
        {/* ================= PESTAÑA 1: GESTIÓN DE PROMPTS ================= */}
        {activeTab === 'prompts' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
              <div>
                <h2 className="text-lg font-extrabold font-brand text-gray-900">
                  Prompts Publicados
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Agrega nuevos prompts para talleres o edita los actuales con un clic.
                </p>
              </div>
              <button
                type="button"
                onClick={openNewPromptModal}
                className="inline-flex items-center justify-center gap-2 bg-[#0085FF] hover:bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Agregar Nuevo Prompt</span>
              </button>
            </div>

            <div className="space-y-4">
              {prompts.map((prompt, index) => (
                <div
                  key={prompt.id || index}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    prompt.is_active === false
                      ? 'border-gray-200 opacity-65 bg-gray-50'
                      : 'border-blue-100'
                  }`}
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Orden #{prompt.display_order || index + 1}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {prompt.badge_text}
                      </span>
                      {prompt.is_active === false && (
                        <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full">
                          Oculto al público
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <span>{prompt.emoji || '✨'}</span>
                      <span>{prompt.title}</span>
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 max-w-2xl">
                      {prompt.prompt_content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePromptActive(prompt)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
                      title={
                        prompt.is_active === false
                          ? 'Mostrar en la página pública'
                          : 'Ocultar temporalmente sin borrar'
                      }
                    >
                      {prompt.is_active === false ? (
                        <>
                          <Eye className="w-4 h-4 text-emerald-600" />
                          <span>Mostrar</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 text-gray-500" />
                          <span>Ocultar</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingPrompt({ ...prompt })}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#007CF0] transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDelete({
                          type: 'prompt',
                          id: prompt.id,
                          title: prompt.title,
                        })
                      }
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar prompt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= PESTAÑA 2: GESTIÓN DE EMBAJADORES ================= */}
        {activeTab === 'ambassadors' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
              <div>
                <h2 className="text-lg font-extrabold font-brand text-gray-900">
                  Perfiles del Equipo (About Us)
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Solo puedes modificar <strong>tu propio perfil, banner, correo y contraseña</strong>. Si
                  agregas un nuevo embajador(a), se creará con su correo y la contraseña por defecto{' '}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-gray-800">
                    Embajadores2026!
                  </code>
                  .
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
                {session?.user?.email && (
                  <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#007CF0] text-xs font-semibold px-3.5 py-2 rounded-xl">
                    <span>Sesión: {session.user.email}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={openNewAmbassadorModal}
                  className="inline-flex items-center justify-center gap-2 bg-[#0085FF] hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Agregar Embajador(a)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ambassadors.map((member, idx) => {
                const isOwnProfile = !isSupabaseConfigured
                  ? true
                  : Boolean(
                      session?.user &&
                        ((member.user_id && member.user_id === session.user.id) ||
                          (member.email &&
                            member.email.toLowerCase() === session.user.email?.toLowerCase()))
                    );

                return (
                  <div
                    key={member.id || idx}
                    className={`bg-white rounded-2xl border shadow-sm flex flex-col justify-between overflow-hidden transition-all ${
                      isOwnProfile
                        ? 'border-[#0085FF] ring-2 ring-[#0085FF]/15'
                        : 'border-gray-200 opacity-90'
                    }`}
                  >
                    <div>
                      {/* Banner superior (imagen personalizada o degradado Gemini) */}
                      <div className="h-24 w-full bg-gradient-to-r from-[#F5BF23]/90 via-amber-300 to-[#0085FF]/85 relative overflow-hidden">
                        {member.banner_url && (
                          <img
                            src={member.banner_url}
                            alt={`Banner de ${member.full_name}`}
                            className="w-full h-full object-cover object-center"
                          />
                        )}
                        <div className="absolute top-2.5 right-2.5">
                          {isOwnProfile ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide bg-white/95 text-[#007CF0] px-2.5 py-0.5 rounded-full shadow-xs">
                              ✨ Tu Perfil
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-white/90 px-2.5 py-0.5 rounded-full shadow-xs">
                              <Lock className="w-3 h-3" />
                              <span>Compañero(a)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="px-5 pt-0 pb-4">
                        <div className="-mt-8 mb-3 flex items-end justify-between relative z-10">
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member.full_name}
                              className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0085FF] to-indigo-700 text-white font-brand font-black text-lg flex items-center justify-center border-4 border-white shadow-md">
                              {member.full_name?.[0]?.toUpperCase() || 'E'}
                            </div>
                          )}
                        </div>

                        <div className="mb-2">
                          <h3 className="font-bold text-gray-900 text-base leading-snug">
                            {member.full_name}
                          </h3>
                          <p className="text-xs text-[#007CF0] font-semibold">{member.career}</p>
                          <p className="text-[11px] text-gray-500">{member.role_title}</p>
                          {member.email && (
                            <p className="text-[11px] text-gray-400 mt-0.5">{member.email}</p>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-3">{member.bio}</p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-gray-100">
                      {isOwnProfile ? (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingAmbassador({
                              ...member,
                              email: member.email || session?.user?.email || '',
                              newPassword: '',
                            })
                          }
                          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#0085FF] hover:bg-blue-600 text-white shadow-xs transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar Mi Perfil, Banner y Cuenta</span>
                        </button>
                      ) : (
                        <div className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Solo lectura (Perfil de {member.full_name})</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= PESTAÑA 3: BANDEJA DE DUDAS ================= */}
        {activeTab === 'doubts' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
              <div>
                <h2 className="text-lg font-extrabold font-brand text-gray-900">
                  Preguntas Recibidas de Estudiantes
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Responde por correo con un clic y marca las dudas como resueltas para coordinarte
                  con el equipo.
                </p>
              </div>

              {/* Filtro simple de estado */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDoubtFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    doubtFilter === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Todas ({doubts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDoubtFilter('pendiente')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    doubtFilter === 'pendiente'
                      ? 'bg-white text-amber-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pendientes ({pendingDoubtsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDoubtFilter('respondida')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    doubtFilter === 'respondida'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Respondidas ({doubts.length - pendingDoubtsCount})
                </button>
              </div>
            </div>

            {filteredDoubts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-blue-100 p-10 text-center text-gray-500 text-sm">
                No hay dudas en esta categoría por ahora.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDoubts.map((d) => {
                  const isResolved = d.status === 'respondida';
                  const mailtoHref = `mailto:${encodeURIComponent(
                    d.student_email
                  )}?subject=${encodeURIComponent(
                    `Respuesta de Embajadores Google Gemini: ${d.topic}`
                  )}&body=${encodeURIComponent(
                    `¡Hola ${d.student_name}!\n\nTe escribimos del equipo de Embajadores de Google Gemini de la universidad respecto a tu duda:\n"${d.question}"\n\n`
                  )}`;

                  return (
                    <div
                      key={d.id}
                      className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col sm:flex-row items-start justify-between gap-4 ${
                        isResolved ? 'border-emerald-200 bg-emerald-50/20' : 'border-amber-200'
                      }`}
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              isResolved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isResolved ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Respondida</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pendiente de respuesta</span>
                              </>
                            )}
                          </span>
                          <span className="text-xs font-semibold text-[#007CF0] bg-blue-50 px-2.5 py-0.5 rounded-md">
                            {d.topic}
                          </span>
                          <span className="text-xs text-gray-400">
                            {d.created_at
                              ? new Date(d.created_at).toLocaleDateString('es-MX', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : ''}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {d.student_name}{' '}
                            <span className="text-xs font-normal text-gray-500">
                              · {d.career} ({d.student_email})
                            </span>
                          </h3>
                          <p className="text-sm text-gray-800 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mt-2 whitespace-pre-line">
                            {d.question}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-col items-end gap-2 self-end sm:self-center flex-shrink-0">
                        <a
                          href={mailtoHref}
                          className="inline-flex items-center gap-1.5 bg-[#0085FF] hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Responder por Correo</span>
                        </a>

                        <button
                          type="button"
                          onClick={async () => {
                            const nextStatus = isResolved ? 'pendiente' : 'respondida';
                            await updateDoubtStatus(d.id, nextStatus);
                            await onRefreshData();
                            onShowToast(
                              nextStatus === 'respondida'
                                ? 'Duda marcada como respondida'
                                : 'Duda marcada como pendiente'
                            );
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {isResolved ? 'Reabrir como pendiente' : 'Marcar como Respondida'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDelete({
                              type: 'doubt',
                              id: d.id,
                              title: `la duda de ${d.student_name}`,
                            })
                          }
                          className="text-xs text-gray-400 hover:text-red-600 px-2 py-1"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= MODAL: CREAR / EDITAR PROMPT ================= */}
      {editingPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-extrabold font-brand text-gray-900">
                  {editingPrompt.id ? 'Editar Prompt' : 'Nuevo Prompt para la Biblioteca'}
                </h3>
                <p className="text-xs text-gray-500">
                  Completa los campos y guarda para publicarlo al instante.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPrompt(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromptForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Título del Prompt *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPrompt.title}
                    onChange={(e) =>
                      setEditingPrompt({ ...editingPrompt, title: e.target.value })
                    }
                    placeholder="Ej. Simulador de Entrevista Laboral"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0085FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Orden de aparición
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingPrompt.display_order}
                    onChange={(e) =>
                      setEditingPrompt({ ...editingPrompt, display_order: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0085FF]"
                  />
                </div>
              </div>

              {/* Selector rápido de Emoji */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                  Ícono / Emoji del Prompt
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {EMOJI_PRESETS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEditingPrompt({ ...editingPrompt, emoji: em })}
                      className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition-all ${
                        editingPrompt.emoji === em
                          ? 'border-[#0085FF] bg-blue-50 scale-110 shadow-xs'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={editingPrompt.emoji}
                    onChange={(e) =>
                      setEditingPrompt({ ...editingPrompt, emoji: e.target.value })
                    }
                    maxLength={4}
                    className="w-16 rounded-xl border border-gray-300 px-2.5 py-2 text-center text-sm"
                    title="O escribe cualquier otro emoji"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Etiqueta Superior (Badge)
                  </label>
                  <input
                    type="text"
                    value={editingPrompt.badge_text}
                    onChange={(e) =>
                      setEditingPrompt({ ...editingPrompt, badge_text: e.target.value })
                    }
                    placeholder="Ej. Prompt Destacado 03 · Comercio"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0085FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Color de la Etiqueta
                  </label>
                  <select
                    value={editingPrompt.badge_color}
                    onChange={(e) =>
                      setEditingPrompt({ ...editingPrompt, badge_color: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0085FF]"
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Nota de Instrucción para el Estudiante (Opcional)
                </label>
                <input
                  type="text"
                  value={editingPrompt.instruction_note || ''}
                  onChange={(e) =>
                    setEditingPrompt({ ...editingPrompt, instruction_note: e.target.value })
                  }
                  placeholder="Ej. Copia este prompt y reemplaza los datos entre corchetes con tu proyecto."
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0085FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Texto Completo del Prompt *
                </label>
                <textarea
                  rows={8}
                  required
                  value={editingPrompt.prompt_content}
                  onChange={(e) =>
                    setEditingPrompt({ ...editingPrompt, prompt_content: e.target.value })
                  }
                  placeholder="Escribe o pega aquí el prompt completo que los estudiantes copiarán..."
                  className="w-full rounded-xl border border-gray-300 p-3.5 text-sm font-sans leading-relaxed focus:outline-none focus:border-[#0085FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingPrompt(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPrompt}
                  className="inline-flex items-center gap-2 bg-[#0085FF] hover:bg-blue-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSavingPrompt ? 'Guardando...' : 'Guardar y Publicar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREAR / EDITAR EMBAJADOR ================= */}
      {editingAmbassador && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-extrabold font-brand text-gray-900">
                  {editingAmbassador.id
                    ? 'Editar Mi Perfil, Banner y Cuenta'
                    : 'Registrar Nuevo Embajador(a)'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingAmbassador.id
                    ? 'Personaliza tu tarjeta pública y tus datos de inicio de sesión.'
                    : 'Se creará su cuenta con la contraseña inicial Embajadores2026! para que luego él/ella edite su perfil.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAmbassador(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAmbassadorForm} className="space-y-4">
              {/* Vista Previa interactiva de Banner (900x300) + Foto de Perfil (400x400) */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                {/* Área del Banner (Proporción fija 3:1 -> 900x300 px) */}
                <div className="h-28 w-full bg-gradient-to-r from-[#F5BF23]/90 via-amber-300 to-[#0085FF]/85 relative overflow-hidden">
                  {editingAmbassador.banner_url && (
                    <img
                      src={editingAmbassador.banner_url}
                      alt="Vista previa del banner"
                      className="w-full h-full object-cover object-center"
                    />
                  )}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
                    <label className="inline-flex items-center gap-1.5 bg-gray-900/80 hover:bg-gray-900 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer shadow backdrop-blur-xs transition-colors">
                      <ImageIcon className="w-3.5 h-3.5 text-[#F5BF23]" />
                      <span>
                        {isUploadingBanner ? 'Ajustando...' : 'Cambiar Banner (900×300)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                      />
                    </label>
                    {editingAmbassador.banner_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingAmbassador({ ...editingAmbassador, banner_url: '' })
                        }
                        className="bg-white/90 hover:bg-white text-gray-800 font-semibold text-[11px] px-2.5 py-1.5 rounded-lg shadow transition-colors"
                        title="Volver al degradado amarillo-azul original"
                      >
                        Usar degradado
                      </button>
                    )}
                  </div>
                </div>

                {/* Área de Foto de Perfil (400x400 px, con z-10 para no quedar debajo del banner) */}
                <div className="px-4 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="-mt-10 flex items-end gap-3.5 relative z-10">
                    {editingAmbassador.avatar_url ? (
                      <img
                        src={editingAmbassador.avatar_url}
                        alt="Vista previa"
                        className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-[#0085FF] text-white font-brand font-black text-2xl flex items-center justify-center border-4 border-white shadow-md">
                        {editingAmbassador.full_name?.[0]?.toUpperCase() || '✨'}
                      </div>
                    )}

                    <div className="pb-0.5">
                      <label className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-semibold text-xs px-3.5 py-2 rounded-xl cursor-pointer shadow-2xs transition-colors">
                        <Upload className="w-3.5 h-3.5 text-[#0085FF]" />
                        <span>
                          {isUploadingPhoto ? 'Ajustando...' : 'Subir Foto (400×400)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {editingAmbassador.avatar_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingAmbassador({ ...editingAmbassador, avatar_url: '' })
                          }
                          className="ml-2.5 text-xs text-red-600 hover:underline"
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <p className="px-4 pb-3 text-[11px] text-gray-500">
                  Cualquier imagen que elijas se recorta y ajusta sola a las medidas exactas
                  (Banner: <strong>900×300 px</strong> · Foto: <strong>400×400 px</strong>). Si no
                  eliges banner se conserva el degradado amarillo-azul.
                </p>
              </div>

              {/* Bloque de Credenciales (Correo y Contraseña) */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[#007CF0]">
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {editingAmbassador.id
                      ? 'Mis Datos de Acceso al Panel (Correo y Contraseña)'
                      : 'Cuenta de Acceso del Nuevo Embajador(a)'}
                  </span>
                </div>

                {editingAmbassador.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Mi Correo de Acceso *
                      </label>
                      <input
                        type="email"
                        required
                        value={editingAmbassador.email || ''}
                        onChange={(e) =>
                          setEditingAmbassador({ ...editingAmbassador, email: e.target.value })
                        }
                        placeholder="tu.correo@gmail.com"
                        className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:outline-none focus:border-[#0085FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nueva Contraseña (Opcional)
                      </label>
                      <input
                        type="password"
                        value={editingAmbassador.newPassword || ''}
                        onChange={(e) =>
                          setEditingAmbassador({
                            ...editingAmbassador,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Dejar vacío para no cambiarla"
                        className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:outline-none focus:border-[#0085FF]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Correo Electrónico del Nuevo Embajador(a) *
                      </label>
                      <input
                        type="email"
                        required
                        value={editingAmbassador.email || ''}
                        onChange={(e) =>
                          setEditingAmbassador({ ...editingAmbassador, email: e.target.value })
                        }
                        placeholder="nuevo.embajador@gmail.com"
                        className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:outline-none focus:border-[#0085FF]"
                      />
                    </div>
                    <p className="text-[11px] text-gray-600">
                      🔑 Contraseña inicial por defecto:{' '}
                      <code className="bg-white border border-blue-200 px-1.5 py-0.5 rounded font-bold text-gray-900">
                        Embajadores2026!
                      </code>
                      . Cuando inicie sesión con su correo, será dueño(a) exclusivo de su tarjeta y
                      podrá cambiar su contraseña.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAmbassador.full_name}
                    onChange={(e) =>
                      setEditingAmbassador({ ...editingAmbassador, full_name: e.target.value })
                    }
                    placeholder="Ej. Sofía Ramírez"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0085FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Carrera *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAmbassador.career}
                    onChange={(e) =>
                      setEditingAmbassador({ ...editingAmbassador, career: e.target.value })
                    }
                    placeholder="Ej. Lic. en Comercio Internacional"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0085FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Rol como Embajador(a)
                </label>
                <input
                  type="text"
                  value={editingAmbassador.role_title}
                  onChange={(e) =>
                    setEditingAmbassador({ ...editingAmbassador, role_title: e.target.value })
                  }
                  placeholder="Ej. Embajadora Google Gemini · Estrategia y Difusión"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0085FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Sobre mí (About Me) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingAmbassador.bio}
                  onChange={(e) =>
                    setEditingAmbassador({ ...editingAmbassador, bio: e.target.value })
                  }
                  placeholder="Cuéntale a la universidad quién eres y en qué les puedes ayudar..."
                  className="w-full rounded-xl border border-gray-300 p-3.5 text-sm focus:outline-none focus:border-[#0085FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Tip favorito: ¿Cómo usas Gemini en tu carrera?
                </label>
                <input
                  type="text"
                  value={editingAmbassador.favorite_prompt || ''}
                  onChange={(e) =>
                    setEditingAmbassador({
                      ...editingAmbassador,
                      favorite_prompt: e.target.value,
                    })
                  }
                  placeholder="Ej. Lo uso para simular casos prácticos de administración y resumir lecturas."
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0085FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Enlace a LinkedIn (Opcional)
                  </label>
                  <input
                    type="url"
                    value={editingAmbassador.linkedin_url || ''}
                    onChange={(e) =>
                      setEditingAmbassador({ ...editingAmbassador, linkedin_url: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/tu-perfil"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#0085FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Enlace a Instagram (Opcional)
                  </label>
                  <input
                    type="url"
                    value={editingAmbassador.instagram_url || ''}
                    onChange={(e) =>
                      setEditingAmbassador({ ...editingAmbassador, instagram_url: e.target.value })
                    }
                    placeholder="https://instagram.com/tu-usuario"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#0085FF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingAmbassador(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingAmbassador}
                  className="inline-flex items-center gap-2 bg-[#0085FF] hover:bg-blue-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                  <span>{isSavingAmbassador ? 'Guardando...' : 'Guardar Perfil'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DE CONFIRMACIÓN ANTES DE BORRAR ================= */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold font-brand text-gray-900 mb-1">
              ¿Confirmas que deseas eliminar esto?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Se eliminará <strong>"{confirmDelete.title}"</strong>. Si solo quieres ocultarlo
              temporalmente, puedes usar el botón "Ocultar" en lugar de borrarlo.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                No, conservar
              </button>
              <button
                type="button"
                onClick={executeConfirmedDelete}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';
import { INITIAL_PROMPTS, INITIAL_AMBASSADORS, INITIAL_DOUBTS } from '../data/initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('tu-proyecto.supabase.co')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Claves para almacenamiento local de respaldo mientras se configuran las credenciales
const STORAGE_KEYS = {
  PROMPTS: 'gemini_ambassadors_prompts_v1',
  AMBASSADORS: 'gemini_ambassadors_team_v1',
  DOUBTS: 'gemini_ambassadors_doubts_v1',
};

function getLocalData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Error guardando datos locales:', err);
  }
}

// ============================================================================
// SERVICIO DE DATOS UNIFICADO (Supabase en producción / LocalStorage en demo)
// ============================================================================

export async function fetchPrompts() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }
  const list = getLocalData(STORAGE_KEYS.PROMPTS, INITIAL_PROMPTS);
  return [...list].sort((a, b) => (a.display_order || 1) - (b.display_order || 1));
}

export async function savePrompt(promptItem) {
  if (isSupabaseConfigured) {
    const payload = {
      title: promptItem.title,
      emoji: promptItem.emoji || '✨',
      badge_text: promptItem.badge_text || 'Prompt Destacado',
      badge_color: promptItem.badge_color || 'blue',
      instruction_note: promptItem.instruction_note || '',
      visual_pills: promptItem.visual_pills || [],
      prompt_content: promptItem.prompt_content,
      display_order: Number(promptItem.display_order) || 1,
      is_active: promptItem.is_active !== undefined ? promptItem.is_active : true,
    };

    if (promptItem.id && !String(promptItem.id).startsWith('prompt-')) {
      const { data, error } = await supabase
        .from('prompts')
        .update(payload)
        .eq('id', promptItem.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('prompts')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  const list = getLocalData(STORAGE_KEYS.PROMPTS, INITIAL_PROMPTS);
  if (promptItem.id) {
    const updated = list.map((p) => (p.id === promptItem.id ? { ...p, ...promptItem } : p));
    setLocalData(STORAGE_KEYS.PROMPTS, updated);
    return promptItem;
  } else {
    const created = {
      ...promptItem,
      id: `prompt-${Date.now()}`,
      is_active: promptItem.is_active !== undefined ? promptItem.is_active : true,
      created_at: new Date().toISOString(),
    };
    setLocalData(STORAGE_KEYS.PROMPTS, [...list, created]);
    return created;
  }
}

export async function deletePromptById(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  const list = getLocalData(STORAGE_KEYS.PROMPTS, INITIAL_PROMPTS);
  setLocalData(
    STORAGE_KEYS.PROMPTS,
    list.filter((p) => p.id !== id)
  );
  return true;
}

export async function fetchAmbassadors() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('ambassadors')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }
  const list = getLocalData(STORAGE_KEYS.AMBASSADORS, INITIAL_AMBASSADORS);
  return [...list].sort((a, b) => (a.display_order || 1) - (b.display_order || 1));
}

// Utilidad para recortar/redimensionar imágenes automáticamente a medidas fijas (evita trabajo extra al usuario)
function resizeImageToFixedDimensions(file, targetWidth, targetHeight) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // Recorte centrado tipo "object-cover" para respetar exactamente la proporción sin deformar
        const srcRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;
        let sx = 0;
        let sy = 0;
        let sWidth = img.width;
        let sHeight = img.height;

        if (srcRatio > targetRatio) {
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width / targetRatio;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo procesar la imagen'));
              return;
            }
            const dataUrl = canvas.toDataURL('image/webp', 0.9);
            resolve({ blob, dataUrl });
          },
          'image/webp',
          0.9
        );
      };
      img.onerror = () => reject(new Error('Archivo de imagen inválido'));
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function saveAmbassador(member, credentials = {}) {
  if (isSupabaseConfigured) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para realizar esta acción.');
    }

    // Caso 1: Crear un NUEVO embajador (con su correo y contraseña por defecto Embajadores2026!)
    if (!member.id || String(member.id).startsWith('amb-')) {
      const newEmail = (credentials.email || member.email || '').trim().toLowerCase();
      if (!newEmail) {
        throw new Error('Debes ingresar el correo electrónico para el nuevo embajador(a).');
      }

      const { data, error } = await supabase.rpc('create_new_ambassador', {
        p_email: newEmail,
        p_full_name: member.full_name,
        p_career: member.career,
        p_role_title: member.role_title || 'Embajador(a) Google Gemini',
        p_bio: member.bio,
        p_favorite_prompt: member.favorite_prompt || '',
        p_avatar_url: member.avatar_url || '',
        p_banner_url: member.banner_url || '',
        p_linkedin_url: member.linkedin_url || '',
        p_instagram_url: member.instagram_url || '',
        p_display_order: Number(member.display_order) || 1,
      });
      if (error) throw error;
      return data;
    }

    // Caso 2: Editar MI PROPIO perfil existente
    if (
      (member.user_id && member.user_id !== user.id) ||
      (member.email && member.email.toLowerCase() !== user.email?.toLowerCase())
    ) {
      throw new Error('Solo puedes modificar tu propio perfil de embajador(a).');
    }

    const nextEmail = (credentials.email || member.email || user.email || '').trim().toLowerCase();
    const nextPassword = (credentials.newPassword || '').trim();

    if (
      (nextEmail && nextEmail !== user.email?.toLowerCase()) ||
      nextPassword.length > 0
    ) {
      const { error: credError } = await supabase.rpc('update_own_credentials', {
        p_email: nextEmail,
        p_password: nextPassword || null,
      });
      if (credError) throw credError;
    }

    const payload = {
      full_name: member.full_name,
      career: member.career,
      role_title: member.role_title,
      bio: member.bio,
      favorite_prompt: member.favorite_prompt || '',
      avatar_url: member.avatar_url || '',
      banner_url: member.banner_url || '',
      linkedin_url: member.linkedin_url || '',
      instagram_url: member.instagram_url || '',
      display_order: Number(member.display_order) || 1,
      is_active: member.is_active !== undefined ? member.is_active : true,
    };

    const { data, error } = await supabase
      .from('ambassadors')
      .update(payload)
      .eq('id', member.id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const list = getLocalData(STORAGE_KEYS.AMBASSADORS, INITIAL_AMBASSADORS);
  if (member.id) {
    const updated = list.map((m) =>
      m.id === member.id
        ? { ...m, ...member, email: credentials.email || member.email }
        : m
    );
    setLocalData(STORAGE_KEYS.AMBASSADORS, updated);
    return member;
  } else {
    const created = {
      ...member,
      email: credentials.email || member.email || '',
      id: `amb-${Date.now()}`,
      is_active: member.is_active !== undefined ? member.is_active : true,
      created_at: new Date().toISOString(),
    };
    setLocalData(STORAGE_KEYS.AMBASSADORS, [...list, created]);
    return created;
  }
}

export async function deleteAmbassadorById(id) {
  if (isSupabaseConfigured) {
    throw new Error('Los perfiles oficiales del equipo no pueden eliminarse.');
  }
  const list = getLocalData(STORAGE_KEYS.AMBASSADORS, INITIAL_AMBASSADORS);
  setLocalData(
    STORAGE_KEYS.AMBASSADORS,
    list.filter((m) => m.id !== id)
  );
  return true;
}

export async function uploadAmbassadorAvatar(file) {
  // Redimensiona y recorta automáticamente a 400x400 px (1:1 cuadrado)
  const { blob, dataUrl } = await resizeImageToFixedDimensions(file, 400, 400);

  if (isSupabaseConfigured) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para subir tu foto de perfil.');
    }

    const filePath = `${user.id}/avatar-${Date.now()}.webp`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  }

  return dataUrl;
}

export async function uploadAmbassadorBanner(file) {
  // Redimensiona y recorta automáticamente a 900x300 px (proporción 3:1 estándar de banner)
  const { blob, dataUrl } = await resizeImageToFixedDimensions(file, 900, 300);

  if (isSupabaseConfigured) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para subir tu imagen de banner.');
    }

    const filePath = `${user.id}/banner-${Date.now()}.webp`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  }

  return dataUrl;
}

export async function createDoubt(doubtPayload) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('doubts').insert([
      {
        student_name: doubtPayload.student_name,
        student_email: doubtPayload.student_email,
        career: doubtPayload.career,
        topic: doubtPayload.topic,
        question: doubtPayload.question,
        status: 'pendiente',
      },
    ]);
    if (error) throw error;
    return true;
  }

  const list = getLocalData(STORAGE_KEYS.DOUBTS, INITIAL_DOUBTS);
  const created = {
    ...doubtPayload,
    id: `doubt-${Date.now()}`,
    status: 'pendiente',
    created_at: new Date().toISOString(),
  };
  setLocalData(STORAGE_KEYS.DOUBTS, [created, ...list]);
  return true;
}

export async function fetchDoubts() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('doubts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return getLocalData(STORAGE_KEYS.DOUBTS, INITIAL_DOUBTS);
}

export async function updateDoubtStatus(id, status) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('doubts')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    return true;
  }
  const list = getLocalData(STORAGE_KEYS.DOUBTS, INITIAL_DOUBTS);
  const updated = list.map((d) => (d.id === id ? { ...d, status } : d));
  setLocalData(STORAGE_KEYS.DOUBTS, updated);
  return true;
}

export async function deleteDoubtById(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('doubts').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  const list = getLocalData(STORAGE_KEYS.DOUBTS, INITIAL_DOUBTS);
  setLocalData(
    STORAGE_KEYS.DOUBTS,
    list.filter((d) => d.id !== id)
  );
  return true;
}

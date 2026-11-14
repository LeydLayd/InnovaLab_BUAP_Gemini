-- ============================================================================
-- SCRIPT DE CONFIGURACIÓN SUPABASE: EMBAJADORES GOOGLE GEMINI
-- Instrucciones: Copia todo este contenido en el "SQL Editor" de tu proyecto
-- en Supabase y haz clic en "Run".
-- ============================================================================

-- 1. TABLA DE PROMPTS
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  emoji text not null default '✨',
  badge_text text not null default 'Prompt Destacado',
  badge_color text not null default 'blue', -- blue | purple | emerald | amber | rose
  instruction_note text,
  visual_pills jsonb default '[]'::jsonb, -- Ej: [{"label": "🤍 Blanco: Hechos", "color": "gray"}]
  prompt_content text not null,
  display_order int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. TABLA DE EMBAJADORES (QUIÉNES SOMOS)
create table if not exists public.ambassadors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  email text unique,
  full_name text not null,
  career text not null,
  role_title text not null,
  bio text not null,
  favorite_prompt text,
  avatar_url text,
  linkedin_url text,
  instagram_url text,
  display_order int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists ambassadors_user_id_idx on public.ambassadors (user_id);

-- 3. TABLA DE DUDAS DE ESTUDIANTES
create table if not exists public.doubts (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  student_email text not null,
  career text not null,
  topic text not null default 'Uso de Prompts',
  question text not null,
  status text not null default 'pendiente', -- 'pendiente' | 'respondida'
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 4. SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ============================================================================
alter table public.prompts enable row level security;
alter table public.ambassadors enable row level security;
alter table public.doubts enable row level security;

-- Políticas para PROMPTS: Todos pueden leer, solo administradores autenticados editan
create policy "Lectura pública de prompts"
  on public.prompts for select
  to anon, authenticated
  using (true);

create policy "Administradores insertan prompts"
  on public.prompts for insert
  to authenticated
  with check ((select auth.uid()) is not null);

create policy "Administradores actualizan prompts"
  on public.prompts for update
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

create policy "Administradores eliminan prompts"
  on public.prompts for delete
  to authenticated
  using ((select auth.uid()) is not null);

-- Políticas para EMBAJADORES: Todos pueden leer, pero cada embajador SOLO puede modificar su propio perfil
create policy "Lectura pública de embajadores"
  on public.ambassadors for select
  to anon, authenticated
  using (true);

create policy "Administradores insertan embajadores"
  on public.ambassadors for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Administradores actualizan embajadores"
  on public.ambassadors for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Administradores eliminan embajadores"
  on public.ambassadors for delete
  to authenticated
  using (false);

-- Políticas para DUDAS: Cualquier estudiante puede enviar (insert), solo admins leen y actualizan
create policy "Estudiantes pueden enviar dudas"
  on public.doubts for insert
  to anon, authenticated
  with check (
    length(trim(student_name)) > 0
    and length(trim(student_email)) > 0
    and length(trim(question)) > 0
  );

create policy "Administradores leen dudas"
  on public.doubts for select
  to authenticated
  using ((select auth.uid()) is not null);

create policy "Administradores actualizan dudas"
  on public.doubts for update
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

create policy "Administradores eliminan dudas"
  on public.doubts for delete
  to authenticated
  using ((select auth.uid()) is not null);

-- ============================================================================
-- 5. BUCKET DE STORAGE PARA FOTOS DE EMBAJADORES
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Fotos de perfil públicas"
  on storage.objects for select
  to anon, authenticated
  using ( bucket_id = 'avatars' );

create policy "Administradores suben fotos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Administradores actualizan fotos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Administradores borran fotos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ============================================================================
-- 6. DATOS INICIALES (TUS 2 PROMPTS ACTUALES + 3 PERFILES DE EMBAJADORES BASE)
-- ============================================================================
insert into public.prompts (title, emoji, badge_text, badge_color, instruction_note, visual_pills, prompt_content, display_order)
values
(
  'Tu Planner Operativo Semanal',
  '🧠',
  'Prompt Destacado 01',
  'blue',
  'Copia y pega este prompt en tu chat con Gemini (o compártelo con quien desees). Las secciones están diseñadas para que las rellenes con tus propios datos, metas y disponibilidad.',
  '[]'::jsonb,
  'Hola Gemini, actúa como mi asistente operativo y de consulta. Quiero diseñar un sistema de planner sencillo y sostenible adaptado a mis actividades actuales. Aquí están mis datos:

Mis principales retos para completar mis actividades son: (Ej: Me cuesta comenzar a trabajar en mis pendientes y tengo poco tiempo porque trabajo)

Mi disponibilidad diaria de tiempo: Cuento con 4 horas

Mis roles principales / ocupaciones actuales: Soy estudiante de finanzas, realizo una investigación

Mis 3 proyectos o pendientes más pesados de esta semana son:
- Entregar una investigación de una materia - 5 de noviembre
- Avanzar en el plan de negocios - 10 de noviembre
- Avanzar en una investigación personal - Ultima semana de noviembre

Por favor, ayúdame a:
1. Distribuir estos pendientes en bloques de ejecución sin saturar mi agenda.
2. Estructurar un resumen limpio de mi semana para que pueda consultar mis prioridades rápidamente.
3. Estructurar mi semana y mi plan de trabajo en forma de un dashboard operativo con una interfaz intuitiva y fácil de usar, que me permita realizar el registro de mis actividades y trackeo de mi progreso de forma gamificada y sencilla que me permita seguir motivado a cumplir mis objetivos, incluso muestra una animación de felicitación cada vez que complete una tarea.
4. Añade un apartado de Copiloto de IA (Gemini) que me permita generar prompts para desglosar bloques complejos.',
  1
),
(
  '6 Sombreros Para Pensar',
  '🎩',
  'Prompt Destacado 02',
  'purple',
  'Analiza cualquier propuesta o proyecto universitario desde 6 perspectivas distintas sin que la IA decida por ti.',
  '[
    {"label": "🤍 Blanco: Hechos", "color": "gray"},
    {"label": "❤️ Rojo: Sentimientos", "color": "red"},
    {"label": "💚 Verde: Creatividad", "color": "green"},
    {"label": "💛 Amarillo: Beneficios", "color": "yellow"},
    {"label": "🖤 Negro: Cautela", "color": "dark"},
    {"label": "💙 Azul: Proceso", "color": "blue"}
  ]'::jsonb,
  'Rol: actúa como un apoyo para el razonamiento crítico familiarizado con los 6 Sombreros para Pensar.

Acción: quiero poner a prueba la propuesta que elegí para el siguiente escenario: [PEGA AQUÍ EL ESCENARIO QUE ELEGISTE EN EL PASO 1 DE AYER].

Mi camino elegido es: [PEGA AQUÍ TU TEXTO DE "MI CAMINO" DEL PASO 5 DE AYER].

Analiza mi propuesta desde las seis perspectivas de los 6 Sombreros para Pensar.

Referencias/Público: considera que esta propuesta debe funcionar en un contexto universitario real y que ya investigué el escenario en Deep Research antes de elegirla.

Tono: sé analítico, constructivo, claro y directo. Cuestiona mi razonamiento sin tomar decisiones por mí.

Formato/Especificaciones: presenta únicamente 1 punto clave por cada sombrero:
🤍 Blanco | Hechos: el dato, información o evidencia más relevante que respalda mi camino o que todavía necesito conocer;
❤️ Rojo | Sentimientos: una emoción, intuición o percepción que vale la pena considerar;
💚 Verde | Creatividad: una posibilidad de adaptación o mejora que podría fortalecer la propuesta;
💛 Amarillo | Beneficios: su principal fortaleza, ventaja u oportunidad;
🖤 Negro | Cautela: el principal riesgo, limitación o aspecto que podría salir mal;
💙 Azul | Proceso: la pregunta más importante que debería responder antes de decidir si mantengo o modifico mi propuesta.

No decidas por mí, no propongas una solución alternativa ni reescribas mi propuesta.',
  2
);

insert into public.ambassadors (full_name, career, role_title, bio, favorite_prompt, avatar_url, linkedin_url, instagram_url, display_order)
values
(
  'Diego',
  'Ingeniería y Desarrollo de Software',
  'Embajador Técnico Google Gemini',
  'Apasionado por construir herramientas tecnológicas e integrar Inteligencia Artificial para resolver problemas reales en nuestra comunidad universitaria.',
  'Uso Gemini como copiloto de arquitectura de software, depuración de código y diseño de prototipos interactivos en segundos.',
  '',
  'https://linkedin.com',
  'https://instagram.com',
  1
),
(
  'Frida',
  'Licenciatura en Comercio Internacional',
  'Embajadora Google Gemini - Estrategia y Difusión',
  'Enfocada en conectar a los estudiantes con herramientas de IA para potenciar análisis de mercados, presentaciones ejecutivas y proyectos globales.',
  'Pido a Gemini que simule negociaciones internacionales y estructure estudios de mercado comparativos.',
  '',
  'https://linkedin.com',
  'https://instagram.com',
  2
),
(
  'Alo',
  'Licenciatura en Administración de Empresas',
  'Embajadora Google Gemini - Gestión y Comunidad',
  'Impulsando la productividad estudiantil y la organización de proyectos universitarios mediante flujos de trabajo inteligentes con Google Gemini.',
  'Mi favorito es el Planner Operativo Semanal para organizar entregas pesadas sin saturar la agenda.',
  '',
  'https://linkedin.com',
  'https://instagram.com',
  3
);

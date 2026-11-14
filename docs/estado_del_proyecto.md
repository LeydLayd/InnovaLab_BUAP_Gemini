# Estado del Proyecto: Plataforma Web Embajadores Google Gemini

**Fecha de corte:** 14 de noviembre de 2026  
**Stack implementado:** React 18 + Vite 6 + Tailwind CSS 3 + Supabase (PostgreSQL, Auth y Storage)

---

## 1. Lo que YA se hizo (Completado en Código y Arquitectura)

Toda la programación del frontend, la estructura de la base de datos y el panel de administración sin código para el equipo ya están construidos y probados localmente:

### ✅ Fase 1: Migración a Framework Dinámico y Diseño Responsive
- [x] Inicialización del proyecto moderno con **React + Vite + Tailwind CSS** ([package.json](../package.json), [vite.config.js](../vite.config.js), [tailwind.config.js](../tailwind.config.js)).
- [x] Conservación de los recursos gráficos originales en alta calidad ([public/bblioteca.png](../public/bblioteca.png) y [public/accede.png](../public/accede.png)) y de las tipografías `Montserrat` e `Inter` ([index.html](../index.html)).
- [x] **Carrusel 3D Interactivo de Secciones** en el encabezado ([src/components/HeaderCarousel.jsx](../src/components/HeaderCarousel.jsx)):
  - Posiciona la sección activa al frente y muestra las otras dos secciones a los lados.
  - Cambio dinámico del color de fondo respetando la paleta oficial de Google Gemini:
    - **Biblioteca de Prompts:** Amarillo Gemini (`#F5BF23`)
    - **Embajadores Gemini:** Azul Gemini (`#0085FF`)
    - **Buzón de Dudas:** Rojo Google (`#EA4335`)
  - Soporte para clic en tarjetas laterales, flechas de navegación, teclado (`←` / `→`), puntos indicadores y gestos táctiles (*swipe*) en teléfonos móviles.
- [x] **Buscador en Tiempo Real** en la esquina superior derecha con filtrado instantáneo de prompts, atajo de teclado (`/`) y botón rápido de limpieza.
- [x] **Franja Negra Limpia** exclusivamente con el botón oficial de acceso a Google Gemini (`https://goo.gle/prueba-Gemini`).
- [x] **Diseño 100% Responsive** adaptado a pantallas móviles (desde `320px`), tablets y escritorio.

### ✅ Fase 2: Construcción de las 3 Secciones Públicas
- [x] **Sección 1 — Biblioteca de Prompts ([src/components/PromptsSection.jsx](../src/components/PromptsSection.jsx)):**
  - Acordeones dinámicos alimentados desde base de datos.
  - Botón para expandir o contraer todos los prompts en un clic.
  - Soporte para etiquetas de colores personalizables, notas de instrucción y píldoras visuales (como los *6 Sombreros para Pensar*).
  - Copiado al portapapeles con confirmación visual en el botón (`¡Copiado!`) y notificación emergente (*Toast*).
- [x] **Sección 2 — Equipo de Embajadores / About Us ([src/components/AmbassadorsSection.jsx](../src/components/AmbassadorsSection.jsx)):**
  - Tarjetas de presentación para los 3 embajadores (Ingeniería/Código, Comercio y Administración).
  - Muestra foto de perfil (o avatar con iniciales si aún no tiene foto), carrera, rol, biografía, tip favorito de uso de Gemini y enlaces a LinkedIn / Instagram.
- [x] **Sección 3 — Buzón de Dudas ([src/components/DoubtsSection.jsx](../src/components/DoubtsSection.jsx)):**
  - Formulario público con validación de campos obligatorios y formato de correo, contador de caracteres, selector de categoría y pantalla de confirmación de envío.

### ✅ Fase 3: Panel de Administración Intuitivo (`/admin`) y Script de Supabase
- [x] **Panel `/admin` sin código ([src/components/AdminPanel.jsx](../src/components/AdminPanel.jsx)):**
  - Pensado para que las embajadoras de Comercio y Administración operen todo mediante formularios visuales:
    1. **Gestor de Prompts:** Crear, editar, ordenar, ocultar/mostrar temporalmente o eliminar prompts (con selector visual de emojis y colores).
    2. **Gestor de Embajadores:** Editar nombres, carreras, biografías, links y subir foto de perfil directamente desde su computadora o celular.
    3. **Bandeja de Dudas:** Filtrar preguntas por *Pendientes* o *Respondidas*, abrir respuesta directa por correo en 1 clic (`mailto:` prellenado) y cambiar el estado de la duda.
  - Modal de confirmación antes de borrar cualquier elemento para evitar accidentes.
- [x] **Capa de Datos Híbrida ([src/lib/supabase.js](../src/lib/supabase.js) y [src/data/initialData.js](../src/data/initialData.js)):**
  - Funciona inmediatamente en modo local de prueba y cambia automáticamente a **Supabase en vivo** en cuanto se configuran las variables de entorno.
- [x] **Script SQL Completo ([supabase_setup.sql](../supabase_setup.sql)) y Base de Datos en Vivo (`rkconnoeniaojtsitehy`):**
  - Migración aplicada vía MCP de Supabase en el proyecto **`Embajadores`** (`https://rkconnoeniaojtsitehy.supabase.co`).
  - Tablas `prompts`, `ambassadors` y `doubts` activas con políticas Row Level Security (RLS) optimizadas (0 advertencias en *Performance Advisors* y *Security Advisors* de tablas).
  - Bucket público `avatars` creado en Supabase Storage con políticas RLS de lectura pública y escritura autenticada.
  - Datos iniciales cargados en producción (2 prompts iniciales + 3 perfiles base: **Diego**, **Frida** y **Alo**).
  - Cuentas de acceso al panel `/admin` registradas en Supabase Auth para:
    - **Diego:** `diegoroblesg404@gmail.com`
    - **Frida:** `fridaguarneros26@gmail.com`
    - **Alo:** `aloterra1704@gmail.com`
  - Archivo `.env` local configurado y protegido en [`.gitignore`](../.gitignore).

---

## 2. Lo que FALTA por hacer (Pendientes para el Lanzamiento)

Toda la infraestructura técnica local y de Supabase ya está lista. Solo restan el despliegue público y la personalización de contenido:

### ⏳ A. Tareas Técnicas (Responsable: Diego)
1. ~~**Crear el proyecto en Supabase**~~ ✅ *(Completado: proyecto `Embajadores` — `rkconnoeniaojtsitehy`)*
2. ~~**Ejecutar el script de base de datos**~~ ✅ *(Completado vía MCP de Supabase)*
3. ~~**Crear las 3 cuentas de acceso al Panel `/admin`**~~ ✅ *(Completado para Diego, Frida y Alo)*
4. ~~**Conectar las llaves en el archivo `.env`**~~ ✅ *(Completado)*
5. **Desplegar la web en producción (10 min):**
   - Subir el repositorio a GitHub y conectarlo a **Vercel** o **Netlify** (plan gratuito), añadiendo las dos variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en la configuración del despliegue.
   - *(Opcional recomendado)* Activar un ping periódico (ej. con GitHub Actions o cron-job.org cada 5 días hacia la URL de Supabase) para evitar que el plan gratuito de Supabase entre en pausa durante vacaciones escolares.

### ⏳ B. Tareas de Contenido y Operación (Responsables: Frida, Alo y Diego)
1. **Personalizar sus perfiles reales en el Panel `/admin`:**
   - Entrar a `#admin` (o botón **Panel Embajadores**), iniciar sesión con su correo (`diegoroblesg404@gmail.com`, `fridaguarneros26@gmail.com` o `aloterra1704@gmail.com`), ir a la pestaña **2. Equipo Embajadores** y actualizar:
     - Apellidos / Nombre completo como prefieran mostrarlo.
     - Fotografía de perfil oficial.
     - Biografía (*About Me*) definitiva y enlaces reales a su LinkedIn / Instagram.
2. **Cargar el lote inicial de nuevos Prompts:**
   - Usar la pestaña **1. Biblioteca de Prompts** para agregar los nuevos prompts que tengan preparados para el lanzamiento universitario.
3. **Definir el rol de guardia del Buzón de Dudas:**
   - Acordar quién revisará la pestaña **3. Buzón de Dudas** cada semana para responder a los estudiantes y marcar las preguntas como *Respondidas*.

---

## 3. Resumen de Avance

| Módulo / Etapa | Estado | Progreso |
| :--- | :---: | :---: |
| Migración de HTML estático a React + Vite + Tailwind | ✅ Completado | **100%** |
| Carrusel 3D con paleta de colores dinámica Gemini y diseño Responsive | ✅ Completado | **100%** |
| Secciones nuevas (Equipo de Embajadores y Buzón de Dudas) | ✅ Completado | **100%** |
| Panel `/admin` intuitivo (CRUD de Prompts, Fotos y Bandeja de Dudas) | ✅ Completado | **100%** |
| Script SQL de tablas, Storage y seguridad RLS (`supabase_setup.sql`) | ✅ Completado | **100%** |
| Configuración de Supabase en la nube, cuentas Auth y llaves `.env` | ✅ Completado | **100%** |
| Carga de fotos/biografías finales del equipo y despliegue en Vercel | ⏳ Pendiente | **0%** |

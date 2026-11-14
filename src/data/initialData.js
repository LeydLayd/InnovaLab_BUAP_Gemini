export const INITIAL_PROMPTS = [
  {
    id: 'prompt-1',
    title: 'Tu Planner Operativo Semanal',
    emoji: '🧠',
    badge_text: 'Prompt Destacado 01',
    badge_color: 'blue',
    instruction_note:
      'Copia y pega este prompt en tu chat con Gemini (o compártelo con quien desees). Las secciones están diseñadas para que las rellenes con tus propios datos, metas y disponibilidad.',
    visual_pills: [],
    prompt_content: `Hola Gemini, actúa como mi asistente operativo y de consulta. Quiero diseñar un sistema de planner sencillo y sostenible adaptado a mis actividades actuales. Aquí están mis datos:

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
4. Añade un apartado de Copiloto de IA (Gemini) que me permita generar prompts para desglosar bloques complejos.`,
    display_order: 1,
    is_active: true,
  },
  {
    id: 'prompt-2',
    title: '6 Sombreros Para Pensar',
    emoji: '🎩',
    badge_text: 'Prompt Destacado 02',
    badge_color: 'purple',
    instruction_note:
      'Pon a prueba cualquier idea o proyecto universitario desde las 6 perspectivas de Edward de Bono sin que Gemini tome la decisión por ti.',
    visual_pills: [
      { label: '🤍 Blanco: Hechos', color: 'gray' },
      { label: '❤️ Rojo: Sentimientos', color: 'red' },
      { label: '💚 Verde: Creatividad', color: 'green' },
      { label: '💛 Amarillo: Beneficios', color: 'yellow' },
      { label: '🖤 Negro: Cautela', color: 'dark' },
      { label: '💙 Azul: Proceso', color: 'blue' },
    ],
    prompt_content: `Rol: actúa como un apoyo para el razonamiento crítico familiarizado con los 6 Sombreros para Pensar.

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

No decidas por mí, no propongas una solución alternativa ni reescribas mi propuesta.`,
    display_order: 2,
    is_active: true,
  },
];

export const INITIAL_AMBASSADORS = [
  {
    id: 'amb-1',
    full_name: 'Diego',
    email: 'diegoroblesg404@gmail.com',
    career: 'Ingeniería y Desarrollo de Software',
    role_title: 'Embajador Técnico Google Gemini',
    bio: 'Apasionado por construir herramientas tecnológicas e integrar Inteligencia Artificial para resolver problemas reales en nuestra comunidad universitaria.',
    favorite_prompt:
      'Uso Gemini como copiloto de arquitectura de software, depuración de código y diseño de prototipos interactivos en segundos.',
    avatar_url: '',
    banner_url: '',
    linkedin_url: 'https://linkedin.com',
    instagram_url: 'https://instagram.com',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'amb-2',
    full_name: 'Frida',
    email: 'fridaguarneros26@gmail.com',
    career: 'Licenciatura en Comercio Internacional',
    role_title: 'Embajadora Google Gemini · Estrategia y Difusión',
    bio: 'Enfocada en conectar a los estudiantes con herramientas de IA para potenciar análisis de mercados, presentaciones ejecutivas y proyectos globales.',
    favorite_prompt:
      'Pido a Gemini que simule negociaciones internacionales y estructure estudios de mercado comparativos.',
    avatar_url: '',
    banner_url: '',
    linkedin_url: 'https://linkedin.com',
    instagram_url: 'https://instagram.com',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'amb-3',
    full_name: 'Alo',
    email: 'aloterra1704@gmail.com',
    career: 'Licenciatura en Administración de Empresas',
    role_title: 'Embajadora Google Gemini · Gestión y Comunidad',
    bio: 'Impulsando la productividad estudiantil y la organización de proyectos universitarios mediante flujos de trabajo inteligentes con Google Gemini.',
    favorite_prompt:
      'Mi favorito es el Planner Operativo Semanal para organizar entregas pesadas sin saturar la agenda.',
    avatar_url: '',
    banner_url: '',
    linkedin_url: 'https://linkedin.com',
    instagram_url: 'https://instagram.com',
    display_order: 3,
    is_active: true,
  },
];

export const INITIAL_DOUBTS = [
  {
    id: 'doubt-demo-1',
    student_name: 'Carlos Mendoza',
    student_email: 'carlos.mendoza@universidad.edu',
    career: 'Contaduría Pública',
    topic: 'Uso de Prompts',
    question: '¿Cómo puedo adaptar el prompt de los 6 sombreros para evaluar una tesis de finanzas corporativas?',
    status: 'pendiente',
    created_at: new Date().toISOString(),
  },
];

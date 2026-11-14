import React, { useState } from 'react';
import { Send, CheckCircle2, HelpCircle, AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { createDoubt } from '../lib/supabase';

const TOPICS = [
  'Uso y creación de Prompts',
  'Cuenta y acceso a Google Gemini',
  'Talleres y eventos en la universidad',
  'Aplicar IA en mi carrera / tesis',
  'Otro tema',
];

export default function DoubtsSection({ onShowToast, onBackToPrompts }) {
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    career: '',
    topic: TOPICS[0],
    question: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.student_name.trim()) {
      newErrors.student_name = 'Por favor escribe tu nombre.';
    }
    if (!formData.student_email.trim()) {
      newErrors.student_email = 'Ingresa un correo para poder responderte.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.student_email.trim())) {
      newErrors.student_email = 'Ingresa un formato de correo válido (ejemplo@correo.com).';
    }
    if (!formData.career.trim()) {
      newErrors.career = 'Indícanos tu carrera o facultad.';
    }
    if (!formData.question.trim() || formData.question.trim().length < 10) {
      newErrors.question = 'Cuéntanos tu duda con un poco más de detalle (mínimo 10 caracteres).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await createDoubt({
        student_name: formData.student_name.trim(),
        student_email: formData.student_email.trim(),
        career: formData.career.trim(),
        topic: formData.topic,
        question: formData.question.trim(),
      });
      setSubmitSuccess(true);
      onShowToast('¡Tu duda fue enviada al equipo de Embajadores!');
    } catch (err) {
      console.error(err);
      setSubmitError(
        'Ocurrió un problema al enviar tu mensaje. Por favor verifica tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      student_name: '',
      student_email: '',
      career: '',
      topic: TOPICS[0],
      question: '',
    });
    setErrors({});
    setSubmitSuccess(false);
  };

  if (submitSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 sm:p-12 text-center max-w-2xl mx-auto my-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-extrabold font-brand text-gray-900 mb-2">
          ¡Recibimos tu pregunta, {formData.student_name.split(' ')[0]}!
        </h2>
        <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">
          Nuestro equipo de Embajadores revisará tu duda sobre{' '}
          <strong className="text-gray-800">"{formData.topic}"</strong> y te responderá al correo{' '}
          <span className="underline text-blue-700">{formData.student_email}</span>.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Enviar otra duda</span>
          </button>
          <button
            type="button"
            onClick={onBackToPrompts}
            className="inline-flex items-center gap-2 bg-[#0085FF] hover:bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Biblioteca de Prompts</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 sm:p-10">
        {/* Encabezado del Formulario */}
        <div className="border-b border-gray-100 pb-6 mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Atención a Estudiantes
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-brand text-gray-900">
            ¿Tienes alguna duda sobre Google Gemini?
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Déjanos tu pregunta sobre cómo estructurar un prompt para tu carrera, cómo activar tu
            cuenta o sobre nuestros próximos talleres en la universidad.
          </p>
        </div>

        {submitError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3 text-sm text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nombre */}
            <div>
              <label
                htmlFor="student_name"
                className="block text-sm font-semibold text-gray-800 mb-1.5"
              >
                Tu nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="student_name"
                type="text"
                value={formData.student_name}
                onChange={(e) => {
                  setFormData({ ...formData, student_name: e.target.value });
                  if (errors.student_name) setErrors({ ...errors, student_name: '' });
                }}
                placeholder="Ej. Ana García"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.student_name
                    ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                    : 'border-gray-300 focus:border-[#0085FF] focus:ring-blue-100 bg-slate-50/50'
                }`}
              />
              {errors.student_name && (
                <p className="text-xs text-red-600 mt-1">{errors.student_name}</p>
              )}
            </div>

            {/* Correo */}
            <div>
              <label
                htmlFor="student_email"
                className="block text-sm font-semibold text-gray-800 mb-1.5"
              >
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                id="student_email"
                type="email"
                value={formData.student_email}
                onChange={(e) => {
                  setFormData({ ...formData, student_email: e.target.value });
                  if (errors.student_email) setErrors({ ...errors, student_email: '' });
                }}
                placeholder="tu.correo@universidad.edu"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.student_email
                    ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                    : 'border-gray-300 focus:border-[#0085FF] focus:ring-blue-100 bg-slate-50/50'
                }`}
              />
              {errors.student_email && (
                <p className="text-xs text-red-600 mt-1">{errors.student_email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Carrera */}
            <div>
              <label htmlFor="career" className="block text-sm font-semibold text-gray-800 mb-1.5">
                Carrera o Facultad <span className="text-red-500">*</span>
              </label>
              <input
                id="career"
                type="text"
                value={formData.career}
                onChange={(e) => {
                  setFormData({ ...formData, career: e.target.value });
                  if (errors.career) setErrors({ ...errors, career: '' });
                }}
                placeholder="Ej. Comercio, Administración, Ingeniería..."
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.career
                    ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                    : 'border-gray-300 focus:border-[#0085FF] focus:ring-blue-100 bg-slate-50/50'
                }`}
              />
              {errors.career && <p className="text-xs text-red-600 mt-1">{errors.career}</p>}
            </div>

            {/* Tema */}
            <div>
              <label htmlFor="topic" className="block text-sm font-semibold text-gray-800 mb-1.5">
                ¿Sobre qué es tu duda?
              </label>
              <select
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:outline-none focus:border-[#0085FF] focus:ring-2 focus:ring-blue-100 transition-all"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mensaje de la duda */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="question" className="block text-sm font-semibold text-gray-800">
                Tu pregunta o comentario <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400">{formData.question.length} caracteres</span>
            </div>
            <textarea
              id="question"
              rows={4}
              value={formData.question}
              onChange={(e) => {
                setFormData({ ...formData, question: e.target.value });
                if (errors.question) setErrors({ ...errors, question: '' });
              }}
              placeholder="Escribe aquí tu duda. Por ejemplo: ¿Cómo puedo pedirle a Gemini que me ayude a organizar bibliografía o analizar datos de una encuesta?"
              className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.question
                  ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                  : 'border-gray-300 focus:border-[#0085FF] focus:ring-blue-100 bg-slate-50/50'
              }`}
            />
            {errors.question && <p className="text-xs text-red-600 mt-1">{errors.question}</p>}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              Tus datos solo se usan para que el equipo de Embajadores responda tu consulta.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0085FF] hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold text-sm px-7 py-3 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Enviando duda...' : 'Enviar mi duda'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

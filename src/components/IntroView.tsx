import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Clock, FileText, ShieldAlert, ShieldCheck } from 'lucide-react';
import { QUIZ_META, QUIZ_QUESTIONS } from '../data/quizData';

interface IntroViewProps {
  participantName: string;
  externalError?: string;
  isStarting?: boolean;
  onChangeName: (name: string) => void;
  onClearExternalError?: () => void;
  onStartQuiz: () => void;
}

export const IntroView: React.FC<IntroViewProps> = ({
  participantName,
  externalError = '',
  isStarting = false,
  onChangeName,
  onClearExternalError,
  onStartQuiz,
}) => {
  const [nameError, setNameError] = useState('');

  const handleStart = () => {
    if (participantName.trim().length < 2) {
      setNameError('Veuillez saisir votre nom complet (au moins 2 caractères) pour démarrer l’épreuve.');
      return;
    }
    setNameError('');
    onStartQuiz();
  };

  const displayedError = nameError || externalError;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-14">
      {/* Hero 2-column split */}
      <section id="presentation" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-6 sm:p-10">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span>Organisateur : {QUIZ_META.organizer}</span>
              <span aria-hidden="true">·</span>
              <span>Auteur du sujet : {QUIZ_META.author}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">7 Questions · 1h 15min</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12]">
              Défi Mathématique Gen MOME
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Évaluez votre maîtrise de l’algèbre et de la géométrie euclidienne à travers sept problèmes sélectionnés en <strong className="text-slate-900">1 heure 15 minutes</strong>. À l’issue de votre soumission définitive, accédez au corrigé officiel complet avec démonstrations rigoureuses étape par étape.
            </p>

            <p className="text-sm italic text-[#0F4C81] font-medium">
              « {QUIZ_META.motto} »
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="max-w-md">
              <label htmlFor="participant-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nom complet du candidat <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="participant-name"
                type="text"
                value={participantName}
                onChange={(e) => {
                  onChangeName(e.target.value);
                  if (nameError) setNameError('');
                  if (externalError && onClearExternalError) onClearExternalError();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStart();
                }}
                placeholder="Ex. : Aminata Ouédraogo"
                maxLength={80}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/25 focus:border-[#0F4C81]"
              />
              {displayedError && (
                <p className="mt-2 text-xs font-medium text-[#DC2626] flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{displayedError}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                disabled={isStarting}
                onClick={handleStart}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#0F4C81] hover:bg-[#0B3A63] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C81]"
              >
                {isStarting ? 'Vérification...' : 'Commencer l’épreuve'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500">
                Disqualification immédiate à la 3ᵉ sortie du site.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Geometric blueprint & syllabus */}
        <div id="programme" className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 mb-1">
              Programme de l’épreuve
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Algèbre fondamentale, équations irrationnelles et géométrie plane
            </p>

            <ol className="divide-y divide-slate-100">
              {QUIZ_QUESTIONS.map((q) => (
                <li key={q.id} className="py-2.5 flex items-baseline justify-between gap-4 text-sm">
                  <div className="flex items-baseline gap-2.5 min-w-0">
                    <span className="font-mono-tabular text-xs font-semibold text-[#0F4C81] shrink-0">
                      0{q.id}.
                    </span>
                    <span className="font-medium text-slate-800 truncate">
                      {q.topic}
                    </span>
                  </div>
                  <span className="font-mono-tabular text-xs text-slate-400 shrink-0">
                    1 pt
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>Durée officielle</span>
              <span className="font-mono-tabular font-semibold text-slate-900">01:15:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total du barème</span>
              <span className="font-mono-tabular font-semibold text-slate-900">7 / 7 points</span>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width 4-column summary strip below hero */}
      <section id="reglement" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <Clock className="w-5 h-5 text-[#0F4C81]" />
          <h3 className="font-display text-sm font-semibold text-slate-900">Durée : 1 heure 15</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Un chronomètre de 75 minutes démarre au lancement. À expiration, vos réponses sont soumises automatiquement.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <ShieldAlert className="w-5 h-5 text-[#D97706]" />
          <h3 className="font-display text-sm font-semibold text-slate-900">Surveillance des sorties</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Quitter l’onglet ou la fenêtre du site est comptabilisé. À la 3ᵉ sortie, le candidat est bloqué et ne peut plus poursuivre le quiz.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <ShieldCheck className="w-5 h-5 text-[#0F4C81]" />
          <h3 className="font-display text-sm font-semibold text-slate-900">Preuves vérifiées</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chaque démonstration inclut les hypothèses de validité, le calcul complet et une conclusion claire.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <FileText className="w-5 h-5 text-[#0F4C81]" />
          <h3 className="font-display text-sm font-semibold text-slate-900">Export PDF officiel</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Téléchargez le corrigé complet au format PDF avec figures géométriques et toutes les démonstrations validées.
          </p>
        </div>
      </section>
    </main>
  );
};

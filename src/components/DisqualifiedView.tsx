import React from 'react';
import { ArrowLeft, Ban, ShieldAlert } from 'lucide-react';
import { QUIZ_META } from '../data/quizData';

interface DisqualifiedViewProps {
  candidateName: string;
  exitCount: number;
  elapsedSeconds: number;
  onReturnHome: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')} min ${String(s).padStart(2, '0')} s`;
}

export const DisqualifiedView: React.FC<DisqualifiedViewProps> = ({
  candidateName,
  exitCount,
  elapsedSeconds,
  onReturnHome,
}) => {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <section className="bg-white border border-red-200 rounded-xl p-6 sm:p-10 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
            <Ban className="w-6 h-6 text-[#DC2626]" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#DC2626]">
              Épreuve bloquée · Disqualification définitive
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Impossible de poursuivre le quiz
            </h1>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          Conformément au règlement du <strong className="text-slate-900">{QUIZ_META.challengeTitle}</strong>, toute personne qui sort du site 3 fois pendant l’épreuve est immédiatement disqualifiée et ne peut plus poursuivre ni reprendre le quiz.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200">
            <div className="text-xs font-medium text-slate-500">Candidat</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 truncate">
              {candidateName.trim() || 'Candidat anonyme'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-red-50/60 border border-red-200">
            <div className="text-xs font-medium text-red-800">Sorties détectées</div>
            <div className="mt-1 font-mono-tabular text-lg font-bold text-[#DC2626]">
              {exitCount} / 3 (limite atteinte)
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200">
            <div className="text-xs font-medium text-slate-500">Temps écoulé</div>
            <div className="mt-1 font-mono-tabular text-sm font-semibold text-slate-900">
              {formatDuration(elapsedSeconds)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-slate-200 bg-[#F8FAFC] flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>
            Cette disqualification est enregistrée dans l’espace du concepteur. L’accès à la suite de l’épreuve et au corrigé détaillé est définitivement verrouillé pour votre session.
          </span>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onReturnHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l’accueil
          </button>
          <span className="text-xs text-slate-500">
            Organisateur : {QUIZ_META.organizer} · Auteur : {QUIZ_META.author}
          </span>
        </div>
      </section>
    </main>
  );
};

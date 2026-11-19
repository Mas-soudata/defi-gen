import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { ChoiceKey, QUIZ_QUESTIONS } from '../data/quizData';
import { MathText } from './MathText';
import { CircleDiagramQ6, RightTriangleDiagramQ7 } from './GeometryDiagrams';
import { QuizAnswersMap } from '../utils/pdfExport';

interface QuizStageProps {
  currentIndex: number;
  answers: QuizAnswersMap;
  remainingSeconds: number;
  exitCount: number;
  maxExitsAllowed: number;
  showConfirmModal: boolean;
  onSelectIndex: (idx: number) => void;
  onSelectAnswer: (questionId: number, choice: ChoiceKey) => void;
  onRequestSubmit: () => void;
  onCancelSubmit: () => void;
  onConfirmSubmit: () => void;
}

function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const QuizStage: React.FC<QuizStageProps> = ({
  currentIndex,
  answers,
  remainingSeconds,
  exitCount,
  maxExitsAllowed,
  showConfirmModal,
  onSelectIndex,
  onSelectAnswer,
  onRequestSubmit,
  onCancelSubmit,
  onConfirmSubmit,
}) => {
  const question = QUIZ_QUESTIONS[currentIndex];
  const selectedChoice = answers[question.id];
  const answeredCount = QUIZ_QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const unansweredList = QUIZ_QUESTIONS.filter((q) => answers[q.id] === undefined).map((q) => q.id);

  const isCriticalTime = remainingSeconds <= 120;
  const isWarningTime = remainingSeconds > 120 && remainingSeconds <= 600;

  return (
    <main id="quiz-stage" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Exam Telemetry Strip: Timer (1h15) & Exit Counter */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <Clock
              className={`w-4 h-4 ${
                isCriticalTime
                  ? 'text-[#DC2626]'
                  : isWarningTime
                  ? 'text-[#D97706]'
                  : 'text-[#0F4C81]'
              }`}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-slate-500">Temps restant :</span>
            <span
              className={`font-mono-tabular text-sm font-bold ${
                isCriticalTime
                  ? 'text-[#DC2626]'
                  : isWarningTime
                  ? 'text-[#D97706]'
                  : 'text-slate-900'
              }`}
            >
              {formatCountdown(remainingSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldAlert
              className={`w-4 h-4 ${exitCount > 0 ? 'text-[#D97706]' : 'text-slate-500'}`}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-slate-500">Sorties du site :</span>
            <span
              className={`font-mono-tabular text-sm font-bold ${
                exitCount >= maxExitsAllowed - 1
                  ? 'text-[#DC2626]'
                  : exitCount > 0
                  ? 'text-[#D97706]'
                  : 'text-slate-900'
              }`}
            >
              {exitCount} / {maxExitsAllowed}
            </span>
          </div>
        </div>

        <span className="text-xs text-slate-500">
          À la {maxExitsAllowed}ᵉ sortie, l’épreuve est arrêtée et vous êtes disqualifié(e)
        </span>
      </div>

      {/* Warning Banner when exits have been recorded */}
      {exitCount > 0 && (
        <div
          role="alert"
          className={`rounded-xl border p-4 flex items-start gap-3 text-sm ${
            exitCount >= maxExitsAllowed - 1
              ? 'border-red-200 bg-red-50 text-red-900'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              Sortie du site détectée ({exitCount} sur {maxExitsAllowed} avant disqualification)
            </p>
            <p className="text-xs leading-relaxed">
              {exitCount >= maxExitsAllowed - 1
                ? 'Dernier avertissement : une 3ᵉ sortie de l’onglet ou du site vous empêchera immédiatement de poursuivre le quiz.'
                : 'Veuillez rester sur cette page pendant toute la durée de l’épreuve. Toute personne qui sort 3 fois du site est disqualifiée.'}
            </p>
          </div>
        </div>
      )}

      {/* Unboxed progress metadata + navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <span className="font-mono-tabular font-semibold text-slate-900">
            Question {currentIndex + 1} sur {QUIZ_QUESTIONS.length}
          </span>
          <span aria-hidden="true">·</span>
          <span>{question.topic}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">{answeredCount} / {QUIZ_QUESTIONS.length} répondues</span>
        </div>

        {/* Question stepper buttons */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Navigation par question">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = answers[q.id] !== undefined;
            return (
              <button
                key={q.id}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Aller à la question ${q.id}`}
                onClick={() => onSelectIndex(idx)}
                className={`w-9 h-9 rounded-lg text-xs font-mono-tabular font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C81] ${
                  isCurrent
                    ? 'bg-[#0F4C81] text-white'
                    : isAnswered
                    ? 'bg-sky-50 text-[#0F4C81] border border-sky-200 hover:bg-sky-100'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {q.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slim progress track */}
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-[#0F4C81] transition-transform duration-200 origin-left"
          style={{ transform: `scaleX(${(currentIndex + 1) / QUIZ_QUESTIONS.length})` }}
        />
      </div>

      {/* Main Question Card */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            {question.title}
          </h1>
          <div className="text-base sm:text-lg text-slate-800 leading-relaxed">
            <MathText text={question.statementLatex} />
          </div>
        </div>

        {/* Optional Reference Geometric Diagram */}
        {question.diagramType === 'circle-q6' && <CircleDiagramQ6 mode="quiz" />}
        {question.diagramType === 'triangle-q7' && <RightTriangleDiagramQ7 mode="quiz" />}

        {/* 4 Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2" role="radiogroup" aria-label={`Choix pour la question ${question.id}`}>
          {question.choices.map((choice) => {
            const isSelected = selectedChoice === choice.key;
            return (
              <button
                key={choice.key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectAnswer(question.id, choice.key)}
                className={`min-h-[56px] p-4 rounded-xl border text-left flex items-center justify-between gap-4 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C81] ${
                  isSelected
                    ? 'border-[#0F4C81] bg-sky-50/70 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`w-8 h-8 rounded-lg font-mono-tabular text-sm font-bold flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#0F4C81] text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {choice.key}
                  </span>
                  <div className="text-base font-medium overflow-x-auto">
                    <MathText text={choice.labelLatex} />
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-[#0F4C81] shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => onSelectIndex(currentIndex - 1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédente
          </button>

          <div className="flex items-center gap-3">
            {currentIndex < QUIZ_QUESTIONS.length - 1 ? (
              <button
                type="button"
                onClick={() => onSelectIndex(currentIndex + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F4C81] hover:bg-[#0B3A63] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Question suivante
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequestSubmit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Soumettre définitivement
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Final Submission Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-submit-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-5 shadow-lg">
            <div className="space-y-2">
              <h2 id="confirm-submit-title" className="font-display text-xl font-bold text-slate-900">
                Confirmer la soumission définitive
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Une fois votre quiz soumis, vos réponses seront enregistrées et vous accéderez immédiatement au{' '}
                <strong className="text-slate-900">CORRIGÉ DÉTAILLÉ — GEN MOME</strong>.
              </p>
            </div>

            {unansweredList.length > 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-semibold">
                    {unansweredList.length} question{unansweredList.length > 1 ? 's' : ''} sans réponse
                  </p>
                  <p>
                    Questions non complétées :{' '}
                    <span className="font-mono-tabular font-semibold">
                      {unansweredList.map((n) => `Q${n}`).join(', ')}
                    </span>
                    . Vous pouvez revenir les compléter ou soumettre maintenant.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 flex items-center gap-3 text-xs font-medium text-emerald-900">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                Toutes les 7 questions ont reçu une réponse.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancelSubmit}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Revenir au quiz
              </button>
              <button
                type="button"
                onClick={onConfirmSubmit}
                className="px-4 py-2 rounded-lg bg-[#0F4C81] hover:bg-[#0B3A63] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Valider et voir le corrigé
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

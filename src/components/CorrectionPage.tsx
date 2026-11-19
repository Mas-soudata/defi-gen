import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileDown,
  Info,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { QUIZ_META, QUIZ_QUESTIONS } from '../data/quizData';
import { MathText } from './MathText';
import { CircleDiagramQ6, RightTriangleDiagramQ7 } from './GeometryDiagrams';
import {
  downloadCorrectionPdf,
  QuizAnswersMap,
} from '../utils/pdfExport';

interface CorrectionPageProps {
  answers: QuizAnswersMap;
  participantName: string;
  wasTimeout?: boolean;
  elapsedSeconds?: number;
  onRestartQuiz: () => void;
}

type FilterMode = 'all' | 'correct' | 'review';

export const CorrectionPage: React.FC<CorrectionPageProps> = ({
  answers,
  participantName,
  wasTimeout = false,
  elapsedSeconds,
  onRestartQuiz,
}) => {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const correctCount = QUIZ_QUESTIONS.filter(
    (q) => answers[q.id] === q.correctAnswer
  ).length;
  const unansweredCount = QUIZ_QUESTIONS.filter(
    (q) => answers[q.id] === undefined
  ).length;
  const incorrectCount = totalQuestions - correctCount - unansweredCount;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    // Defer slightly so loading state paints cleanly
    setTimeout(() => {
      try {
        downloadCorrectionPdf(answers, participantName);
      } finally {
        setIsExportingPdf(false);
      }
    }, 50);
  };

  const filteredQuestions = QUIZ_QUESTIONS.filter((q) => {
    if (filter === 'correct') return answers[q.id] === q.correctAnswer;
    if (filter === 'review') return answers[q.id] !== q.correctAnswer;
    return true;
  });

  const formatElapsed = (sec?: number) => {
    if (typeof sec !== 'number') return null;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')} min ${String(s).padStart(2, '0')} s`;
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {wasTimeout && (
        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 text-sm text-amber-900"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#D97706]" />
          <div>
            <p className="font-semibold">Temps imparti écoulé (01:15:00)</p>
            <p className="text-xs mt-0.5">
              Votre épreuve a été soumise automatiquement à l’expiration du délai d’une heure et quinze minutes.
            </p>
          </div>
        </div>
      )}

      {/* Official Correction Header */}
      <section
        id="correction-header"
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 space-y-6"
      >
        <div className="space-y-3">
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {QUIZ_META.pageTitle}
          </h1>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-4 gap-y-1 text-sm text-slate-700">
            <span>
              <strong className="font-semibold text-slate-900">Organisateur :</strong>{' '}
              {QUIZ_META.organizer}
            </span>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
            <span>
              <strong className="font-semibold text-slate-900">Auteur du sujet :</strong>{' '}
              {QUIZ_META.author}
            </span>
            {participantName.trim() && (
              <>
                <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
                <span>
                  <strong className="font-semibold text-slate-900">Participant :</strong>{' '}
                  {participantName.trim()}
                </span>
              </>
            )}
            {formatElapsed(elapsedSeconds) && (
              <>
                <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
                <span className="font-mono-tabular">
                  <strong className="font-sans font-semibold text-slate-900">Durée :</strong>{' '}
                  {formatElapsed(elapsedSeconds)}
                </span>
              </>
            )}
          </div>

          <p className="text-sm sm:text-base italic text-[#0F4C81] font-medium">
            Mention : « {QUIZ_META.motto} »
          </p>
        </div>

        {/* Computed Score Strip */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200">
            <div className="text-xs font-medium text-slate-500">Score obtenu</div>
            <div className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
              {correctCount} / {totalQuestions}
            </div>
            <div className="text-xs font-mono-tabular text-[#0F4C81] mt-0.5">
              {percentage} % de réussite
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200">
            <div className="text-xs font-medium text-slate-500">Réponses correctes</div>
            <div className="mt-1 font-mono-tabular text-2xl font-bold text-[#059669] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              {correctCount}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200">
            <div className="text-xs font-medium text-slate-500">Réponses incorrectes</div>
            <div className="mt-1 font-mono-tabular text-2xl font-bold text-[#DC2626] flex items-center gap-2">
              <XCircle className="w-5 h-5" aria-hidden="true" />
              {incorrectCount}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200">
            <div className="text-xs font-medium text-slate-500">Non répondues</div>
            <div className="mt-1 font-mono-tabular text-2xl font-bold text-[#D97706] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              {unansweredCount}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="tablist" aria-label="Filtrer les questions du corrigé">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toutes ({totalQuestions})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'correct'}
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'correct'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Réussies ({correctCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'review'}
              onClick={() => setFilter('review')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'review'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              À revoir ({totalQuestions - correctCount})
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            <FileDown className="w-4 h-4 text-[#0F4C81]" />
            {isExportingPdf ? 'Génération du PDF...' : 'Télécharger le corrigé en PDF'}
          </button>
        </div>
      </section>

      {/* Individual Correction Cards */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
          Aucune question ne correspond à ce filtre.
        </div>
      ) : (
        <div className="space-y-8">
          {filteredQuestions.map((q) => {
            const selectedKey = answers[q.id];
            const selectedChoice = q.choices.find((c) => c.key === selectedKey);
            const correctChoice = q.choices.find((c) => c.key === q.correctAnswer)!;
            const isCorrect = selectedKey === q.correctAnswer;
            const isUnanswered = selectedKey === undefined;

            return (
              <article
                key={q.id}
                id={`question-card-${q.id}`}
                className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6"
              >
                {/* Card Header & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">
                      Question {q.id} sur {totalQuestions} · {q.topic}
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                      {q.title}
                    </h2>
                  </div>

                  {/* Dual-coded status text + icon (never hue-only, never pill) */}
                  <div
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold shrink-0 ${
                      isCorrect
                        ? 'text-[#059669]'
                        : isUnanswered
                        ? 'text-[#D97706]'
                        : 'text-[#DC2626]'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Réponse correcte (1 pt)</span>
                      </>
                    ) : isUnanswered ? (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>Non répondue (0 pt)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Réponse incorrecte (0 pt)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Statement */}
                <div className="text-base text-slate-800 leading-relaxed">
                  <MathText text={q.statementLatex} />
                </div>

                {/* 1. Selected Answer vs 2. Correct Answer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : isUnanswered
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-red-50/60 border-red-200'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600 mb-1">
                      1. Réponse sélectionnée par le participant
                    </div>
                    {selectedChoice ? (
                      <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                        <span className="font-mono-tabular">{selectedChoice.key}.</span>
                        <MathText text={selectedChoice.labelLatex} />
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-amber-900">
                        Aucune réponse sélectionnée
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/60">
                    <div className="text-xs font-semibold text-emerald-800 mb-1">
                      2. Bonne réponse officielle
                    </div>
                    <div className="flex items-center gap-2 text-base font-semibold text-emerald-950">
                      <span className="font-mono-tabular">{correctChoice.key}.</span>
                      <MathText text={correctChoice.labelLatex} />
                    </div>
                  </div>
                </div>

                {/* Statement Clarity / Non-Degeneracy Note if present */}
                {q.statementNote && (
                  <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/70 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>{q.statementNote.title}</span>
                    </div>
                    <div className="text-sm text-amber-950 leading-relaxed">
                      <MathText text={q.statementNote.contentLatex} />
                    </div>
                  </div>
                )}

                {/* Interactive Geometric Explorers for Q6 and Q7 */}
                {q.diagramType === 'circle-q6' && <CircleDiagramQ6 mode="solution" />}
                {q.diagramType === 'triangle-q7' && <RightTriangleDiagramQ7 mode="solution" />}

                {/* 3. Step-by-Step Mathematical Demonstration */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    3. Démonstration mathématique étape par étape
                  </h3>

                  <div className="divide-y divide-slate-100">
                    {q.steps.map((step, idx) => (
                      <div key={idx} className="py-4 first:pt-1 last:pb-1 space-y-2">
                        <h4 className="text-sm font-bold text-[#0F4C81]">
                          {step.heading}
                        </h4>
                        <div className="text-sm sm:text-[15px] text-slate-800 leading-relaxed">
                          <MathText text={step.contentLatex} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Highlighted Conclusion */}
                <div className="p-4 rounded-lg border border-sky-200 bg-sky-50/70 space-y-1">
                  <div className="text-xs font-bold text-[#0F4C81]">
                    4. Conclusion
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-slate-900">
                    <MathText text={q.conclusionLatex} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Closing Section & Required Action Buttons */}
      <section
        id="correction-actions"
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 text-center space-y-6"
      >
        <p className="font-display text-lg sm:text-xl font-semibold text-slate-900 max-w-2xl mx-auto">
          « {QUIZ_META.closingMessage} »
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0F4C81] hover:bg-[#0B3A63] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            <FileDown className="w-4 h-4" />
            {isExportingPdf ? 'Génération du PDF...' : 'Télécharger le corrigé en PDF'}
          </button>

          <button
            type="button"
            onClick={onRestartQuiz}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            Recommencer le quiz
          </button>
        </div>
      </section>
    </main>
  );
};

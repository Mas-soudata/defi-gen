import React from 'react';

export type AppPhase = 'intro' | 'quiz' | 'correction' | 'disqualified' | 'designer';

interface TopBarProps {
  phase: AppPhase;
  answeredCount: number;
  totalQuestions: number;
  onNavigateIntro: () => void;
  onStartQuiz: () => void;
  onRequestSubmit: () => void;
  onRestartQuiz: () => void;
  onOpenDesigner: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  phase,
  answeredCount,
  totalQuestions,
  onNavigateIntro,
  onStartQuiz,
  onRequestSubmit,
  onRestartQuiz,
  onOpenDesigner,
  onScrollToSection,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={onNavigateIntro}
          className="font-display text-lg font-bold tracking-tight text-slate-900 hover:text-[#0F4C81] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Gen MOME
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Navigation principale">
          {phase === 'intro' && (
            <>
              <button
                type="button"
                onClick={() => onScrollToSection('presentation')}
                className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Présentation
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection('programme')}
                className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Programme
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection('reglement')}
                className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Règlement
              </button>
              <button
                type="button"
                onClick={onOpenDesigner}
                className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Espace concepteur
              </button>
            </>
          )}

          {phase === 'quiz' && (
            <>
              <button
                type="button"
                onClick={() => onScrollToSection('quiz-stage')}
                className="text-slate-900 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Épreuve en cours
              </button>
              <span className="text-slate-400 font-mono-tabular text-xs whitespace-nowrap shrink-0">
                {answeredCount}/{totalQuestions} répondues
              </span>
            </>
          )}

          {phase === 'correction' && (
            <>
              <button
                type="button"
                onClick={() => onScrollToSection('correction-header')}
                className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Résultats
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection('question-card-1')}
                className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Algèbre (1–5)
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection('question-card-6')}
                className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Géométrie (6–7)
              </button>
              <button
                type="button"
                onClick={onOpenDesigner}
                className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Espace concepteur
              </button>
            </>
          )}

          {(phase === 'disqualified' || phase === 'designer') && (
            <>
              <button
                type="button"
                onClick={onNavigateIntro}
                className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Accueil
              </button>
              <button
                type="button"
                onClick={onOpenDesigner}
                className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  phase === 'designer' ? 'text-slate-900 underline' : ''
                }`}
              >
                Espace concepteur
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          {phase === 'intro' && (
            <button
              type="button"
              onClick={onStartQuiz}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3A63] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C81]"
            >
              Commencer le quiz
            </button>
          )}
          {phase === 'quiz' && (
            <button
              type="button"
              onClick={onRequestSubmit}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3A63] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C81]"
            >
              Soumettre le quiz
            </button>
          )}
          {phase === 'correction' && (
            <button
              type="button"
              onClick={onRestartQuiz}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3A63] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C81]"
            >
              Recommencer le quiz
            </button>
          )}
          {(phase === 'designer' || phase === 'disqualified') && (
            <button
              type="button"
              onClick={onNavigateIntro}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3A63] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C81]"
            >
              Retour à l’accueil
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChoiceKey, QUIZ_META, QUIZ_QUESTIONS } from './data/quizData';
import { AppPhase, TopBar } from './components/TopBar';
import { IntroView } from './components/IntroView';
import { QuizStage } from './components/QuizStage';
import { CorrectionPage } from './components/CorrectionPage';
import { DisqualifiedView } from './components/DisqualifiedView';
import { DesignerResultsPage } from './components/DesignerResultsPage';
import { QuizAnswersMap } from './utils/pdfExport';
import { checkCandidateEligibility, submitAttempt } from './utils/storageClient';

const EXAM_DURATION_SECONDS = 75 * 60; // 1 heure 15 minutes (4500 s)
const DISQUALIFICATION_EXITS = 3; // Disqualification immédiate à la 3e sortie
const DISQUALIFIED_STORAGE_KEY = 'genmome_disqualified_id';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>(() =>
    window.location.pathname === '/concepteur' ? 'designer' : 'intro'
  );
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [wasTimeout, setWasTimeout] = useState<boolean>(false);
  const [participantName, setParticipantName] = useState<string>('');
  const [startError, setStartError] = useState<string>('');
  const [isCheckingStart, setIsCheckingStart] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<QuizAnswersMap>({});
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(EXAM_DURATION_SECONDS);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [exitCount, setExitCount] = useState<number>(0);

  const startedAtRef = useRef<number | null>(null);
  const answersRef = useRef<QuizAnswersMap>(answers);
  const participantNameRef = useRef<string>(participantName);
  const exitCountRef = useRef<number>(exitCount);
  const isAwayRef = useRef<boolean>(false);
  const lastExitTimestampRef = useRef<number>(0);
  const hasRecordedAttemptRef = useRef<boolean>(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    participantNameRef.current = participantName;
  }, [participantName]);

  useEffect(() => {
    exitCountRef.current = exitCount;
  }, [exitCount]);

  // Verify on initial load if this browser was already disqualified
  useEffect(() => {
    if (window.location.pathname === '/concepteur') return;
    let storedId = '';
    try {
      storedId = localStorage.getItem(DISQUALIFIED_STORAGE_KEY) || '';
    } catch {
      storedId = '';
    }
    if (!storedId) return;

    checkCandidateEligibility('', storedId)
      .then((data) => {
        if (data && data.allowed === false && data.record) {
          setParticipantName(data.record.candidateName || '');
          setExitCount(data.record.exitCount || DISQUALIFICATION_EXITS);
          setElapsedSeconds(data.record.elapsedSeconds || 0);
          setPhase('disqualified');
        } else {
          try {
            localStorage.removeItem(DISQUALIFIED_STORAGE_KEY);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // ignore errors on mount
      });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const recordSubmissionToServer = useCallback(
    async (
      status: 'completed' | 'disqualified' | 'timeout',
      finalExitCount: number,
      finalElapsedSeconds: number
    ) => {
      if (hasRecordedAttemptRef.current) return;
      hasRecordedAttemptRef.current = true;

      try {
        const { submission } = await submitAttempt({
          candidateName: participantNameRef.current.trim() || 'Candidat anonyme',
          answers: answersRef.current,
          status,
          exitCount: finalExitCount,
          elapsedSeconds: finalElapsedSeconds,
        });

        if (status === 'disqualified' && submission?.id) {
          try {
            localStorage.setItem(DISQUALIFIED_STORAGE_KEY, submission.id);
          } catch {
            // ignore
          }
        }
      } catch {
        // Non-blocking fallback
      }
    },
    []
  );

  const finalizeQuiz = useCallback(
    (reason: 'completed' | 'timeout') => {
      const elapsed =
        startedAtRef.current !== null
          ? Math.min(EXAM_DURATION_SECONDS, Math.round((Date.now() - startedAtRef.current) / 1000))
          : 0;
      setElapsedSeconds(elapsed);
      setShowConfirmModal(false);
      setWasTimeout(reason === 'timeout');
      setSubmitted(true);
      setPhase('correction');
      scrollToTop();
      recordSubmissionToServer(reason, exitCountRef.current, elapsed);
    },
    [recordSubmissionToServer]
  );

  const triggerDisqualification = useCallback(
    (newExitCount: number) => {
      const elapsed =
        startedAtRef.current !== null
          ? Math.min(EXAM_DURATION_SECONDS, Math.round((Date.now() - startedAtRef.current) / 1000))
          : 0;
      setElapsedSeconds(elapsed);
      setShowConfirmModal(false);
      setSubmitted(false);
      setPhase('disqualified');
      scrollToTop();
      recordSubmissionToServer('disqualified', newExitCount, elapsed);
    },
    [recordSubmissionToServer]
  );

  // 1h15 countdown timer active strictly during quiz phase
  useEffect(() => {
    if (phase !== 'quiz') return;

    const interval = window.setInterval(() => {
      if (startedAtRef.current === null) return;
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const remaining = Math.max(0, EXAM_DURATION_SECONDS - elapsed);
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        window.clearInterval(interval);
        finalizeQuiz('timeout');
      }
    }, 500);

    return () => window.clearInterval(interval);
  }, [phase, finalizeQuiz]);

  // Anti-cheat site exit surveillance (3 exits => immediate disqualification & lock)
  useEffect(() => {
    if (phase !== 'quiz') {
      isAwayRef.current = false;
      return;
    }

    const handleReturn = () => {
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        isAwayRef.current = false;
      }
    };

    const registerExit = () => {
      const now = Date.now();
      if (isAwayRef.current || now - lastExitTimestampRef.current < 1000) {
        return;
      }
      isAwayRef.current = true;
      lastExitTimestampRef.current = now;

      const nextCount = exitCountRef.current + 1;
      exitCountRef.current = nextCount;
      setExitCount(nextCount);

      if (nextCount >= DISQUALIFICATION_EXITS) {
        triggerDisqualification(nextCount);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        registerExit();
      } else {
        handleReturn();
      }
    };

    const handleWindowBlur = () => {
      registerExit();
    };

    const handleWindowFocus = () => {
      isAwayRef.current = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [phase, triggerDisqualification]);

  const beginFreshAttempt = () => {
    setAnswers({});
    setSubmitted(false);
    setWasTimeout(false);
    setCurrentIndex(0);
    setShowConfirmModal(false);
    setExitCount(0);
    exitCountRef.current = 0;
    isAwayRef.current = false;
    lastExitTimestampRef.current = 0;
    hasRecordedAttemptRef.current = false;
    startedAtRef.current = Date.now();
    setRemainingSeconds(EXAM_DURATION_SECONDS);
    setElapsedSeconds(0);
    if (window.location.pathname === '/concepteur') {
      window.history.pushState({}, '', '/');
    }
    setPhase('quiz');
    scrollToTop();
  };

  const verifyEligibilityAndStart = async () => {
    const trimmed = participantName.trim();
    if (trimmed.length < 2) {
      if (phase !== 'intro') {
        setPhase('intro');
      }
      const input = document.getElementById('participant-name') as HTMLInputElement | null;
      if (input) input.focus();
      return;
    }

    setStartError('');
    setIsCheckingStart(true);
    let storedId = '';
    try {
      storedId = localStorage.getItem(DISQUALIFIED_STORAGE_KEY) || '';
    } catch {
      storedId = '';
    }

    try {
      const data = await checkCandidateEligibility(trimmed, storedId);
      if (data && data.allowed === false) {
        setStartError(
          'Accès refusé : vous avez été disqualifié(e) après 3 sorties du site et ne pouvez plus poursuivre cette épreuve.'
        );
        if (data.record) {
          setExitCount(data.record.exitCount || DISQUALIFICATION_EXITS);
          setElapsedSeconds(data.record.elapsedSeconds || 0);
        }
        setPhase('disqualified');
        scrollToTop();
        return;
      }
    } catch {
      // Allow offline fallback if check fails unexpectedly
    } finally {
      setIsCheckingStart(false);
    }

    beginFreshAttempt();
  };

  const handleSelectAnswer = (questionId: number, choice: ChoiceKey) => {
    if (submitted || phase !== 'quiz') return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choice,
    }));
  };

  const handleRequestSubmit = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    finalizeQuiz('completed');
  };

  const handleRestartQuiz = () => {
    if (participantName.trim().length < 2) {
      setPhase('intro');
      scrollToTop();
      return;
    }
    verifyEligibilityAndStart();
  };

  const handleNavigateIntro = () => {
    setShowConfirmModal(false);
    if (window.location.pathname === '/concepteur') {
      window.history.pushState({}, '', '/');
    }
    setPhase('intro');
    scrollToTop();
  };

  const handleOpenDesigner = () => {
    setShowConfirmModal(false);
    if (window.location.pathname !== '/concepteur') {
      window.history.pushState({}, '', '/concepteur');
    }
    setPhase('designer');
    scrollToTop();
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const answeredCount = QUIZ_QUESTIONS.filter((q) => answers[q.id] !== undefined).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <TopBar
        phase={phase}
        answeredCount={answeredCount}
        totalQuestions={QUIZ_QUESTIONS.length}
        onNavigateIntro={handleNavigateIntro}
        onStartQuiz={verifyEligibilityAndStart}
        onRequestSubmit={handleRequestSubmit}
        onRestartQuiz={handleRestartQuiz}
        onOpenDesigner={handleOpenDesigner}
        onScrollToSection={handleScrollToSection}
      />

      <div className="flex-1">
        {phase === 'intro' && (
          <IntroView
            participantName={participantName}
            externalError={startError}
            isStarting={isCheckingStart}
            onChangeName={setParticipantName}
            onClearExternalError={() => setStartError('')}
            onStartQuiz={verifyEligibilityAndStart}
          />
        )}

        {phase === 'quiz' && (
          <QuizStage
            currentIndex={currentIndex}
            answers={answers}
            remainingSeconds={remainingSeconds}
            exitCount={exitCount}
            maxExitsAllowed={DISQUALIFICATION_EXITS}
            showConfirmModal={showConfirmModal}
            onSelectIndex={(idx) => {
              setCurrentIndex(idx);
              scrollToTop();
            }}
            onSelectAnswer={handleSelectAnswer}
            onRequestSubmit={handleRequestSubmit}
            onCancelSubmit={() => setShowConfirmModal(false)}
            onConfirmSubmit={handleConfirmSubmit}
          />
        )}

        {phase === 'correction' && submitted && (
          <CorrectionPage
            answers={answers}
            participantName={participantName}
            wasTimeout={wasTimeout}
            elapsedSeconds={elapsedSeconds}
            onRestartQuiz={handleRestartQuiz}
          />
        )}

        {phase === 'disqualified' && (
          <DisqualifiedView
            candidateName={participantName}
            exitCount={exitCount}
            elapsedSeconds={elapsedSeconds}
            onReturnHome={handleNavigateIntro}
          />
        )}

        {phase === 'designer' && (
          <DesignerResultsPage onBackHome={handleNavigateIntro} />
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {QUIZ_META.challengeTitle} · Organisateur : {QUIZ_META.organizer}
          </span>
          <div className="flex items-center gap-4">
            <span>Auteur du sujet : {QUIZ_META.author}</span>
            {phase !== 'quiz' && (
              <button
                type="button"
                onClick={handleOpenDesigner}
                className="text-slate-600 hover:text-[#0F4C81] underline underline-offset-4 cursor-pointer"
              >
                Espace concepteur
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { QUIZ_META, QUIZ_QUESTIONS } from '../data/quizData';
import {
  CandidateSubmissionRecord,
  deleteDesignerResult,
  designerLogin,
  designerLogout,
  fetchDesignerResults,
} from '../utils/storageClient';

export type { CandidateSubmissionRecord };

type StatusFilter = 'all' | 'completed' | 'disqualified' | 'timeout';

const SESSION_TOKEN_KEY = 'genmome_designer_token';

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  }
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

function formatDateFr(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export const DesignerResultsPage: React.FC<{ onBackHome: () => void }> = ({
  onBackHome,
}) => {
  const [token, setToken] = useState<string>(() => {
    try {
      return sessionStorage.getItem(SESSION_TOKEN_KEY) || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [submissions, setSubmissions] = useState<CandidateSubmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchResults = useCallback(async (authToken: string) => {
    if (!authToken) return;
    setIsLoading(true);
    setFetchError('');
    try {
      const result = await fetchDesignerResults(authToken);

      if (result.unauthorized) {
        try {
          sessionStorage.removeItem(SESSION_TOKEN_KEY);
        } catch {
          // ignore
        }
        setToken('');
        setAuthError('Session expirée. Veuillez saisir à nouveau le mot de passe concepteur.');
        return;
      }

      if (!result.ok) {
        throw new Error(result.error || 'Impossible de charger les résultats des candidats.');
      }

      setSubmissions(result.submissions);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchResults(token);
    }
  }, [token, fetchResults]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!password.trim()) {
      setAuthError('Veuillez saisir le mot de passe concepteur.');
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await designerLogin(password);
      if (!res.ok || !res.token) {
        setAuthError(res.error || 'Mot de passe concepteur incorrect.');
        return;
      }

      try {
        sessionStorage.setItem(SESSION_TOKEN_KEY, res.token);
      } catch {
        // ignore
      }
      setPassword('');
      setToken(res.token);
    } catch {
      setAuthError('Erreur de connexion.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      designerLogout(token);
    }
    try {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    } catch {
      // ignore
    }
    setToken('');
    setSubmissions([]);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      const deleted = await deleteDesignerResult(token, id);
      if (deleted) {
        setSubmissions((prev) => prev.filter((item) => item.id !== id));
      }
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleExportCsv = () => {
    const header = [
      'Candidat',
      'Statut',
      'Score',
      'Sur',
      'Sorties du site',
      'Temps utilise (s)',
      'Q1',
      'Q2',
      'Q3',
      'Q4',
      'Q5',
      'Q6',
      'Q7',
      'Date soumission',
    ];
    const rows = submissions.map((s) => {
      const statusLabel =
        s.status === 'disqualified'
          ? 'Disqualifie'
          : s.status === 'timeout'
          ? 'Temps ecoule'
          : 'Valide';
      const qCols = [1, 2, 3, 4, 5, 6, 7].map((n) => s.answers[String(n)] || '-');
      return [
        `"${s.candidateName.replace(/"/g, '""')}"`,
        statusLabel,
        String(s.score),
        String(s.totalQuestions),
        String(s.exitCount),
        String(s.elapsedSeconds),
        ...qCols,
        `"${formatDateFr(s.submittedAt)}"`,
      ].join(';');
    });

    const csv = '\uFEFF' + [header.join(';'), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Resultats_Candidats_Gen_MOME.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredSubmissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return submissions.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (q && !s.candidateName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [submissions, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const completed = submissions.filter((s) => s.status === 'completed').length;
    const disqualified = submissions.filter((s) => s.status === 'disqualified').length;
    const timeout = submissions.filter((s) => s.status === 'timeout').length;
    const eligible = submissions.filter((s) => s.status !== 'disqualified');
    const avgScore =
      eligible.length > 0
        ? (eligible.reduce((acc, s) => acc + s.score, 0) / eligible.length).toFixed(2)
        : '—';
    return { total, completed, disqualified, timeout, avgScore };
  }, [submissions]);

  if (!token) {
    return (
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#0F4C81]" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 pt-1">
              Espace Concepteur — Gen MOME
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cette page regroupe les résultats, scores, temps utilisés et contrôles de sorties de tous les candidats. Accès réservé au concepteur du sujet ({QUIZ_META.author}).
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="designer-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mot de passe concepteur
              </label>
              <div className="relative">
                <input
                  id="designer-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisir le mot de passe"
                  autoComplete="current-password"
                  className="w-full h-11 pl-3.5 pr-11 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/25 focus:border-[#0F4C81]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-[#DC2626] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={onBackHome}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="px-5 py-2.5 rounded-lg bg-[#0F4C81] hover:bg-[#0B3A63] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
              >
                {isLoggingIn ? 'Vérification...' : 'Accéder aux résultats'}
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-500">
            Espace Concepteur · Organisateur : {QUIZ_META.organizer} · Auteur : {QUIZ_META.author}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Résultats de tous les candidats
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchResults(token)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={submissions.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#0F4C81]" />
            Exporter CSV
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-[#DC2626] text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Verrouiller
          </button>
        </div>
      </section>

      {/* KPI Summary Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Total des candidats</div>
          <div className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
            {stats.total}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Épreuves validées</div>
          <div className="mt-1 font-mono-tabular text-2xl font-bold text-[#059669]">
            {stats.completed}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Disqualifiés (3 sorties)</div>
          <div className="mt-1 font-mono-tabular text-2xl font-bold text-[#DC2626]">
            {stats.disqualified}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Moyenne (hors disqualifiés)</div>
          <div className="mt-1 font-mono-tabular text-2xl font-bold text-[#0F4C81]">
            {stats.avgScore} <span className="text-sm font-medium text-slate-500">/ 7</span>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un candidat..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-[#F8FAFC] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
            />
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto" role="tablist" aria-label="Filtrer par statut">
            {(
              [
                { id: 'all', label: `Tous (${stats.total})` },
                { id: 'completed', label: `Validés (${stats.completed})` },
                { id: 'disqualified', label: `Disqualifiés (${stats.disqualified})` },
                { id: 'timeout', label: `Temps écoulé (${stats.timeout})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={statusFilter === tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error / Loading / Empty / Table States */}
        {fetchError ? (
          <div className="p-8 text-center text-sm text-[#DC2626] space-y-2">
            <p>{fetchError}</p>
            <button
              type="button"
              onClick={() => fetchResults(token)}
              className="text-xs font-semibold text-[#0F4C81] underline cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        ) : isLoading && submissions.length === 0 ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-10 bg-slate-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-medium text-slate-700">
              {submissions.length === 0
                ? 'Aucune copie soumise pour le moment.'
                : 'Aucun candidat ne correspond à votre recherche.'}
            </p>
            <p className="text-xs text-slate-500">
              Les résultats apparaîtront ici automatiquement dès qu’un candidat terminera l’épreuve ou sera disqualifié.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Candidat</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-right">Sorties</th>
                  <th className="py-3 px-4 text-right">Temps</th>
                  <th className="py-3 px-4">Détail Q1–Q7</th>
                  <th className="py-3 px-4">Soumis le</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSubmissions.map((item) => {
                  const pct = Math.round((item.score / item.totalQuestions) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {item.candidateName}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.status === 'completed' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#059669]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Validé
                          </span>
                        )}
                        {item.status === 'disqualified' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
                            <Ban className="w-3.5 h-3.5" />
                            Disqualifié
                          </span>
                        )}
                        {item.status === 'timeout' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97706]">
                            <Clock className="w-3.5 h-3.5" />
                            Temps écoulé
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-tabular whitespace-nowrap">
                        {item.status === 'disqualified' ? (
                          <span className="text-[#DC2626] font-semibold">0 / 7</span>
                        ) : (
                          <span>
                            <strong className="text-slate-900">{item.score} / {item.totalQuestions}</strong>{' '}
                            <span className="text-xs text-slate-500">({pct} %)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-tabular whitespace-nowrap">
                        <span
                          className={
                            item.exitCount > 3
                              ? 'text-[#DC2626] font-semibold'
                              : item.exitCount > 0
                              ? 'text-[#D97706] font-medium'
                              : 'text-slate-600'
                          }
                        >
                          {item.exitCount} / 3
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono-tabular text-xs text-slate-700 whitespace-nowrap">
                        {formatElapsed(item.elapsedSeconds)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono-tabular text-xs">
                          {QUIZ_QUESTIONS.map((q) => {
                            const ans = item.answers[String(q.id)];
                            const ok = ans === q.correctAnswer;
                            return (
                              <span
                                key={q.id}
                                title={`Q${q.id}: ${ans || 'Vide'} (attendu: ${q.correctAnswer})`}
                                className={`w-6 h-6 rounded flex items-center justify-center font-semibold border ${
                                  !ans
                                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                                    : ok
                                    ? 'bg-emerald-50 border-emerald-200 text-[#059669]'
                                    : 'bg-red-50 border-red-200 text-[#DC2626]'
                                }`}
                              >
                                {ans || '–'}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono-tabular text-slate-500 whitespace-nowrap">
                        {formatDateFr(item.submittedAt)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {confirmDeleteId === item.id ? (
                          <div className="inline-flex items-center gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="font-semibold text-[#DC2626] hover:underline cursor-pointer"
                            >
                              Confirmer
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-slate-500 hover:underline cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            aria-label={`Supprimer le résultat de ${item.candidateName}`}
                            className="p-1.5 text-slate-400 hover:text-[#DC2626] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

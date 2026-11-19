export interface CandidateSubmissionRecord {
  id: string;
  candidateName: string;
  answers: Record<string, string | undefined>;
  score: number;
  totalQuestions: number;
  status: 'completed' | 'disqualified' | 'timeout';
  exitCount: number;
  elapsedSeconds: number;
  submittedAt: string;
}

export type StorageMode = 'server' | 'local';

const LOCAL_SUBMISSIONS_KEY = 'genmome_local_submissions';
const LOCAL_TOKEN = 'local-static-session';
const DESIGNER_PASS_HASH = 'e00ca30bad115d70071e78692ef8c826c418afccdc5c3562a6183cf8e83f9cef';

const ANSWER_KEY: Record<number, string> = {
  1: 'B',
  2: 'C',
  3: 'B',
  4: 'C',
  5: 'C',
  6: 'B',
  7: 'A',
};

function isJsonResponse(res: Response): boolean {
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json');
}

function readLocalSubmissions(): CandidateSubmissionRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalSubmissions(items: CandidateSubmissionRecord[]) {
  try {
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

async function sha256Hex(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return '';
}

export async function submitAttempt(payload: {
  candidateName: string;
  answers: Record<number, string | undefined>;
  status: 'completed' | 'disqualified' | 'timeout';
  exitCount: number;
  elapsedSeconds: number;
}): Promise<{ submission: CandidateSubmissionRecord; mode: StorageMode }> {
  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok && isJsonResponse(res)) {
      const data = await res.json();
      if (data?.submission) {
        return { submission: data.submission, mode: 'server' };
      }
    }
  } catch {
    // Static hosting fallback below
  }

  let computedScore = 0;
  const cleanAnswers: Record<string, string | undefined> = {};
  for (let qId = 1; qId <= 7; qId++) {
    const val = payload.answers[qId];
    if (val === 'A' || val === 'B' || val === 'C' || val === 'D') {
      cleanAnswers[String(qId)] = val;
      if (val === ANSWER_KEY[qId]) {
        computedScore += 1;
      }
    }
  }

  const record: CandidateSubmissionRecord = {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    candidateName: payload.candidateName.trim() || 'Candidat anonyme',
    answers: cleanAnswers,
    score: payload.status === 'disqualified' ? 0 : computedScore,
    totalQuestions: 7,
    status: payload.status,
    exitCount: payload.exitCount,
    elapsedSeconds: payload.elapsedSeconds,
    submittedAt: new Date().toISOString(),
  };

  const existing = readLocalSubmissions();
  existing.unshift(record);
  writeLocalSubmissions(existing);

  return { submission: record, mode: 'local' };
}

export async function checkCandidateEligibility(
  name: string,
  disqualifiedId: string
): Promise<{
  allowed: boolean;
  record?: { candidateName: string; exitCount: number; elapsedSeconds: number };
}> {
  try {
    const res = await fetch(
      `/api/quiz/check?name=${encodeURIComponent(name)}&disqualifiedId=${encodeURIComponent(disqualifiedId)}`
    );
    if (res.ok && isJsonResponse(res)) {
      return await res.json();
    }
  } catch {
    // Static hosting fallback below
  }

  const normalized = name.trim().toLowerCase();
  const existing = readLocalSubmissions();
  const locked = existing.find(
    (item) =>
      item.status === 'disqualified' &&
      ((disqualifiedId && item.id === disqualifiedId) ||
        (normalized.length >= 2 && item.candidateName.trim().toLowerCase() === normalized))
  );

  if (locked) {
    return {
      allowed: false,
      record: {
        candidateName: locked.candidateName,
        exitCount: locked.exitCount,
        elapsedSeconds: locked.elapsedSeconds,
      },
    };
  }

  return { allowed: true };
}

export async function designerLogin(password: string): Promise<{
  ok: boolean;
  token?: string;
  mode?: StorageMode;
  error?: string;
}> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (isJsonResponse(res)) {
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        return { ok: true, token: data.token, mode: 'server' };
      }
      return { ok: false, error: data.error || 'Mot de passe concepteur incorrect.' };
    }
  } catch {
    // Static hosting fallback below
  }

  const digest = await sha256Hex(password);
  if (digest === DESIGNER_PASS_HASH || (!digest && password === 'genmome 2026')) {
    return { ok: true, token: LOCAL_TOKEN, mode: 'local' };
  }

  return { ok: false, error: 'Mot de passe concepteur incorrect.' };
}

export async function fetchDesignerResults(token: string): Promise<{
  ok: boolean;
  unauthorized?: boolean;
  submissions: CandidateSubmissionRecord[];
  mode: StorageMode;
  error?: string;
}> {
  if (token === LOCAL_TOKEN) {
    return {
      ok: true,
      submissions: readLocalSubmissions(),
      mode: 'local',
    };
  }

  try {
    const res = await fetch('/api/admin/results', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      return { ok: false, unauthorized: true, submissions: [], mode: 'server' };
    }

    if (res.ok && isJsonResponse(res)) {
      const data = await res.json();
      return {
        ok: true,
        submissions: Array.isArray(data.submissions) ? data.submissions : [],
        mode: 'server',
      };
    }
  } catch {
    // fallback if server went away
  }

  return {
    ok: false,
    submissions: [],
    mode: 'server',
    error: 'Impossible de charger les résultats des candidats.',
  };
}

export async function deleteDesignerResult(token: string, id: string): Promise<boolean> {
  if (token === LOCAL_TOKEN) {
    const existing = readLocalSubmissions();
    const filtered = existing.filter((item) => item.id !== id);
    writeLocalSubmissions(filtered);
    return filtered.length !== existing.length;
  }

  try {
    const res = await fetch(`/api/admin/results/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function designerLogout(token: string) {
  if (token && token !== LOCAL_TOKEN) {
    fetch('/api/admin/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
}

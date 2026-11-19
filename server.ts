import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const ADMIN_PASSWORD = process.env.DESIGNER_PASSWORD || 'genmome 2026';

// Authoritative answer key (barème officiel)
const ANSWER_KEY: Record<number, string> = {
  1: 'B',
  2: 'C',
  3: 'B',
  4: 'C',
  5: 'C',
  6: 'B',
  7: 'A',
};

export interface CandidateSubmission {
  id: string;
  candidateName: string;
  answers: Record<number, string | undefined>;
  score: number;
  totalQuestions: number;
  status: 'completed' | 'disqualified' | 'timeout';
  exitCount: number;
  elapsedSeconds: number;
  submittedAt: string;
}

const activeTokens = new Map<string, number>();
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, '[]', 'utf-8');
  }
}

function readSubmissions(): CandidateSubmission[] {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSubmissions(items: CandidateSubmission[]) {
  ensureDataStore();
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

function verifyPassword(input: string): boolean {
  const hashA = crypto.createHash('sha256').update(input).digest();
  const hashB = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function requireAdminAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const expiresAt = activeTokens.get(token);

  if (!token || !expiresAt || Date.now() > expiresAt) {
    if (token) activeTokens.delete(token);
    res.status(401).json({ error: 'Accès refusé : authentification concepteur requise.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  // Submit candidate attempt (completed, timeout, or disqualified)
  app.post('/api/submissions', (req, res) => {
    const body = req.body || {};
    const rawName = typeof body.candidateName === 'string' ? body.candidateName.trim() : '';
    const candidateName = rawName.slice(0, 80) || 'Candidat anonyme';

    const rawAnswers =
      body.answers && typeof body.answers === 'object' ? (body.answers as Record<string, unknown>) : {};
    const sanitizedAnswers: Record<number, string | undefined> = {};
    let computedScore = 0;

    for (let qId = 1; qId <= 7; qId++) {
      const val = rawAnswers[String(qId)];
      if (val === 'A' || val === 'B' || val === 'C' || val === 'D') {
        sanitizedAnswers[qId] = val;
        if (val === ANSWER_KEY[qId]) {
          computedScore += 1;
        }
      }
    }

    const status =
      body.status === 'disqualified' || body.status === 'timeout' || body.status === 'completed'
        ? body.status
        : 'completed';

    const exitCount =
      typeof body.exitCount === 'number' && Number.isFinite(body.exitCount)
        ? Math.max(0, Math.min(99, Math.floor(body.exitCount)))
        : 0;

    const elapsedSeconds =
      typeof body.elapsedSeconds === 'number' && Number.isFinite(body.elapsedSeconds)
        ? Math.max(0, Math.min(4500, Math.floor(body.elapsedSeconds)))
        : 0;

    const record: CandidateSubmission = {
      id: crypto.randomUUID(),
      candidateName,
      answers: sanitizedAnswers,
      score: status === 'disqualified' ? 0 : computedScore,
      totalQuestions: 7,
      status,
      exitCount,
      elapsedSeconds,
      submittedAt: new Date().toISOString(),
    };

    const existing = readSubmissions();
    existing.unshift(record);
    writeSubmissions(existing);

    res.status(201).json({ submission: record });
  });

  // Designer login with password ("genmome 2026")
  app.post('/api/admin/login', (req, res) => {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!verifyPassword(password)) {
      res.status(401).json({ error: 'Mot de passe concepteur incorrect.' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    activeTokens.set(token, Date.now() + TOKEN_TTL_MS);
    res.json({ token });
  });

  app.post('/api/admin/logout', (req, res) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (token) activeTokens.delete(token);
    res.json({ ok: true });
  });

  // Check whether candidate or browser session is locked due to disqualification (3 exits)
  app.get('/api/quiz/check', (req, res) => {
    const nameParam = typeof req.query.name === 'string' ? req.query.name.trim().toLowerCase() : '';
    const disqualifiedId = typeof req.query.disqualifiedId === 'string' ? req.query.disqualifiedId.trim() : '';

    const submissions = readSubmissions();
    const lockedRecord = submissions.find(
      (item) =>
        item.status === 'disqualified' &&
        ((disqualifiedId && item.id === disqualifiedId) ||
          (nameParam.length >= 2 && item.candidateName.trim().toLowerCase() === nameParam))
    );

    if (lockedRecord) {
      res.json({
        allowed: false,
        record: {
          candidateName: lockedRecord.candidateName,
          exitCount: lockedRecord.exitCount,
          elapsedSeconds: lockedRecord.elapsedSeconds,
        },
      });
      return;
    }

    res.json({ allowed: true });
  });

  // Fetch all candidate results (Designer only)
  app.get('/api/admin/results', requireAdminAuth, (_req, res) => {
    const submissions = readSubmissions();
    res.json({ submissions });
  });

  // Delete a specific submission (Designer only)
  app.delete('/api/admin/results/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const existing = readSubmissions();
    const filtered = existing.filter((item) => item.id !== id);
    if (filtered.length === existing.length) {
      res.status(404).json({ error: 'Candidature introuvable.' });
      return;
    }
    writeSubmissions(filtered);
    res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gen MOME server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

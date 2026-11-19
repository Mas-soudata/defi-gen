import { jsPDF } from 'jspdf';
import { ChoiceKey, QUIZ_META, QUIZ_QUESTIONS } from '../data/quizData';

export interface QuizAnswersMap {
  [questionId: number]: ChoiceKey | undefined;
}

const A4_WIDTH_PX = 1240; // ~150 DPI for crisp A4 portrait
const A4_HEIGHT_PX = 1754;
const MARGIN_X = 76;
const MARGIN_TOP = 76;
const MARGIN_BOTTOM = 76;
const CONTENT_WIDTH = A4_WIDTH_PX - MARGIN_X * 2;

class CanvasPageBuilder {
  private pages: HTMLCanvasElement[] = [];
  private ctx!: CanvasRenderingContext2D;
  private y = MARGIN_TOP;

  constructor() {
    this.addPage();
  }

  private addPage() {
    const canvas = document.createElement('canvas');
    canvas.width = A4_WIDTH_PX;
    canvas.height = A4_HEIGHT_PX;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);
    this.pages.push(canvas);
    this.ctx = ctx;
    this.y = MARGIN_TOP;
  }

  private ensureSpace(neededHeight: number) {
    if (this.y + neededHeight > A4_HEIGHT_PX - MARGIN_BOTTOM) {
      this.drawPageFooter();
      this.addPage();
    }
  }

  private drawPageFooter() {
    const pageNum = this.pages.length;
    this.ctx.save();
    this.ctx.strokeStyle = '#E2E8F0';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(MARGIN_X, A4_HEIGHT_PX - 48);
    this.ctx.lineTo(A4_WIDTH_PX - MARGIN_X, A4_HEIGHT_PX - 48);
    this.ctx.stroke();

    this.ctx.font = '500 18px "Plus Jakarta Sans", system-ui, sans-serif';
    this.ctx.fillStyle = '#64748B';
    this.ctx.fillText('Gen MOME · Corrigé officiel · Auteur : MILLOGO Ariès', MARGIN_X, A4_HEIGHT_PX - 22);
    const numText = `Page ${pageNum}`;
    const numWidth = this.ctx.measureText(numText).width;
    this.ctx.fillText(numText, A4_WIDTH_PX - MARGIN_X - numWidth, A4_HEIGHT_PX - 22);
    this.ctx.restore();
  }

  private wrapLines(text: string, font: string, maxWidth: number): string[] {
    this.ctx.save();
    this.ctx.font = font;
    const paragraphs = text.split('\n');
    const result: string[] = [];

    for (const para of paragraphs) {
      if (para.trim() === '') {
        result.push('');
        continue;
      }
      const words = para.split(/\s+/);
      let current = '';
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (this.ctx.measureText(candidate).width <= maxWidth) {
          current = candidate;
        } else {
          if (current) result.push(current);
          current = word;
        }
      }
      if (current) result.push(current);
    }
    this.ctx.restore();
    return result;
  }

  drawDocumentHeader(participantName: string, score: number, total: number) {
    const headerHeight = 200;
    this.ensureSpace(headerHeight);

    this.ctx.save();
    // Subtle header card
    this.ctx.fillStyle = '#F8FAFC';
    this.ctx.strokeStyle = '#CBD5E1';
    this.ctx.lineWidth = 1.5;
    this.roundRect(MARGIN_X, this.y, CONTENT_WIDTH, 184, 10);
    this.ctx.fill();
    this.ctx.stroke();

    // Title
    this.ctx.font = '700 32px "Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif';
    this.ctx.fillStyle = '#0F172A';
    this.ctx.fillText(QUIZ_META.pageTitle, MARGIN_X + 28, this.y + 48);

    // Metadata lines
    this.ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
    this.ctx.fillStyle = '#334155';
    this.ctx.fillText(
      `Organisateur : ${QUIZ_META.organizer}   ·   Auteur du sujet : ${QUIZ_META.author}`,
      MARGIN_X + 28,
      this.y + 84
    );

    this.ctx.font = 'italic 19px "Plus Jakarta Sans", system-ui, sans-serif';
    this.ctx.fillStyle = '#0F4C81';
    this.ctx.fillText(`« ${QUIZ_META.motto} »`, MARGIN_X + 28, this.y + 116);

    const participantLabel = participantName.trim() ? `Participant : ${participantName.trim()}   ·   ` : '';
    this.ctx.font = '600 20px "IBM Plex Mono", monospace';
    this.ctx.fillStyle = '#0F172A';
    this.ctx.fillText(
      `${participantLabel}Score obtenu : ${score} / ${total} (${Math.round((score / total) * 100)} %)`,
      MARGIN_X + 28,
      this.y + 154
    );
    this.ctx.restore();

    this.y += 210;
  }

  drawQuestionSection(
    q: (typeof QUIZ_QUESTIONS)[number],
    selected: ChoiceKey | undefined
  ) {
    const titleFont = '700 25px "Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif';
    const bodyFont = '400 20px "Plus Jakarta Sans", system-ui, sans-serif';
    const boldFont = '700 20px "Plus Jakarta Sans", system-ui, sans-serif';
    const monoFont = '600 19px "IBM Plex Mono", monospace';

    // Ensure enough room for title + statement + status
    this.ensureSpace(170);

    // Divider line
    this.ctx.save();
    this.ctx.strokeStyle = '#CBD5E1';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(MARGIN_X, this.y);
    this.ctx.lineTo(A4_WIDTH_PX - MARGIN_X, this.y);
    this.ctx.stroke();
    this.ctx.restore();
    this.y += 28;

    // Question title
    this.ctx.save();
    this.ctx.font = titleFont;
    this.ctx.fillStyle = '#0F4C81';
    this.ctx.fillText(q.title, MARGIN_X, this.y);
    this.ctx.restore();
    this.y += 32;

    // Statement
    const stmtLines = this.wrapLines(q.statementPlain, bodyFont, CONTENT_WIDTH);
    this.ensureSpace(stmtLines.length * 28 + 20);
    this.ctx.save();
    this.ctx.font = bodyFont;
    this.ctx.fillStyle = '#1E293B';
    for (const line of stmtLines) {
      this.ctx.fillText(line, MARGIN_X, this.y);
      this.y += 28;
    }
    this.ctx.restore();
    this.y += 8;

    // Choices (2x2 grid)
    this.ensureSpace(74);
    this.ctx.save();
    this.ctx.font = monoFont;
    q.choices.forEach((choice, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = MARGIN_X + col * (CONTENT_WIDTH / 2 + 12);
      const cy = this.y + row * 32;
      const isCorrect = choice.key === q.correctAnswer;
      this.ctx.fillStyle = isCorrect ? '#047857' : '#475569';
      this.ctx.fillText(`${choice.key}. ${choice.labelPlain}`, x, cy);
    });
    this.ctx.restore();
    this.y += 72;

    // Participant selection vs Correct answer bar
    this.ensureSpace(56);
    const isRight = selected === q.correctAnswer;
    const selectedChoice = q.choices.find((c) => c.key === selected);
    const correctChoice = q.choices.find((c) => c.key === q.correctAnswer)!;

    this.ctx.save();
    this.ctx.fillStyle = isRight ? '#ECFDF5' : selected ? '#FEF2F2' : '#FFFBEB';
    this.ctx.strokeStyle = isRight ? '#A7F3D0' : selected ? '#FECACA' : '#FDE68A';
    this.ctx.lineWidth = 1.2;
    this.roundRect(MARGIN_X, this.y, CONTENT_WIDTH, 48, 8);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = boldFont;
    this.ctx.fillStyle = isRight ? '#065F46' : selected ? '#991B1B' : '#92400E';
    const userStr = selectedChoice
      ? `Votre réponse : ${selectedChoice.key} (${selectedChoice.labelPlain})`
      : 'Votre réponse : Aucune réponse';
    this.ctx.fillText(userStr, MARGIN_X + 16, this.y + 31);

    const goodStr = `Bonne réponse : ${correctChoice.key} (${correctChoice.labelPlain})`;
    const goodW = this.ctx.measureText(goodStr).width;
    this.ctx.fillStyle = '#065F46';
    this.ctx.fillText(goodStr, MARGIN_X + CONTENT_WIDTH - goodW - 16, this.y + 31);
    this.ctx.restore();
    this.y += 66;

    // Statement note if present
    if (q.statementNote) {
      const noteText = q.statementNote.contentPlain.join(' ');
      const noteLines = this.wrapLines(noteText, bodyFont, CONTENT_WIDTH - 32);
      const boxH = noteLines.length * 26 + 46;
      this.ensureSpace(boxH + 14);

      this.ctx.save();
      this.ctx.fillStyle = '#FFFBEB';
      this.ctx.strokeStyle = '#FCD34D';
      this.ctx.lineWidth = 1.2;
      this.roundRect(MARGIN_X, this.y, CONTENT_WIDTH, boxH, 8);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.font = boldFont;
      this.ctx.fillStyle = '#92400E';
      this.ctx.fillText(q.statementNote.title, MARGIN_X + 16, this.y + 28);

      this.ctx.font = bodyFont;
      this.ctx.fillStyle = '#78350F';
      noteLines.forEach((line, i) => {
        this.ctx.fillText(line, MARGIN_X + 16, this.y + 56 + i * 26);
      });
      this.ctx.restore();
      this.y += boxH + 16;
    }

    // Optional Geometric diagram for Q6 / Q7
    if (q.diagramType === 'circle-q6') {
      this.ensureSpace(240);
      this.drawCircleDiagramQ6();
    } else if (q.diagramType === 'triangle-q7') {
      this.ensureSpace(220);
      this.drawTriangleDiagramQ7();
    }

    // Steps
    for (const step of q.steps) {
      const headingLines = this.wrapLines(step.heading, boldFont, CONTENT_WIDTH);
      const bodyLines = step.contentPlain.flatMap((p) => this.wrapLines(p, bodyFont, CONTENT_WIDTH - 16));
      const needed = headingLines.length * 28 + bodyLines.length * 26 + 18;
      this.ensureSpace(Math.min(needed, 220));

      this.ctx.save();
      this.ctx.font = boldFont;
      this.ctx.fillStyle = '#0F172A';
      for (const hLine of headingLines) {
        this.ctx.fillText(hLine, MARGIN_X, this.y);
        this.y += 28;
      }

      this.ctx.font = bodyFont;
      this.ctx.fillStyle = '#334155';
      for (const bLine of bodyLines) {
        this.ensureSpace(28);
        this.ctx.fillText(bLine, MARGIN_X + 14, this.y);
        this.y += 26;
      }
      this.ctx.restore();
      this.y += 10;
    }

    // Conclusion Box
    const concLines = this.wrapLines(`Conclusion : ${q.conclusionPlain}`, boldFont, CONTENT_WIDTH - 32);
    const concH = concLines.length * 28 + 26;
    this.ensureSpace(concH + 24);

    this.ctx.save();
    this.ctx.fillStyle = '#F0F9FF';
    this.ctx.strokeStyle = '#7DD3FC';
    this.ctx.lineWidth = 1.5;
    this.roundRect(MARGIN_X, this.y, CONTENT_WIDTH, concH, 8);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = boldFont;
    this.ctx.fillStyle = '#0C4A6E';
    concLines.forEach((line, idx) => {
      this.ctx.fillText(line, MARGIN_X + 16, this.y + 30 + idx * 28);
    });
    this.ctx.restore();
    this.y += concH + 26;
  }

  private drawCircleDiagramQ6() {
    const boxH = 225;
    this.ctx.save();
    this.ctx.fillStyle = '#F8FAFC';
    this.ctx.strokeStyle = '#E2E8F0';
    this.ctx.lineWidth = 1.2;
    this.roundRect(MARGIN_X, this.y, CONTENT_WIDTH, boxH, 8);
    this.ctx.fill();
    this.ctx.stroke();

    const cx = MARGIN_X + CONTENT_WIDTH / 2;
    const cy = this.y + 128;
    const R = 62;
    const radE = (62 * Math.PI) / 180;
    const radF = (138 * Math.PI) / 180;

    const x1 = Math.cos(radE), y1 = Math.sin(radE);
    const x2 = Math.cos(radF), y2 = Math.sin(radF);
    const denomM = y1 * (x2 + 1) - y2 * (x1 - 1);
    const denomN = y1 * (x2 - 1) - y2 * (x1 + 1);
    const xM = (y1 * (x2 + 1) + y2 * (x1 - 1)) / denomM;
    const yM = (y1 / (x1 - 1)) * (xM - 1);
    const xN = -(y1 * (x2 - 1) + y2 * (x1 + 1)) / denomN;
    const yN = (y1 / (x1 + 1)) * (xN + 1);

    const toPx = (mx: number, my: number) => ({ x: cx + mx * R, y: cy - my * R });
    const pI = toPx(-1, 0), pJ = toPx(1, 0), pE = toPx(x1, y1), pF = toPx(x2, y2), pM = toPx(xM, yM), pN = toPx(xN, yN), pH = toPx(xM, 0);

    // Circle
    this.ctx.strokeStyle = '#0F4C81';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, R, 0, Math.PI * 2);
    this.ctx.stroke();

    // Diameter IJ
    this.ctx.strokeStyle = '#0F172A';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(pI.x, pI.y);
    this.ctx.lineTo(pJ.x, pJ.y);
    this.ctx.stroke();

    // Lines to M and N
    this.ctx.strokeStyle = '#64748B';
    this.ctx.lineWidth = 1.3;
    this.ctx.beginPath();
    this.ctx.moveTo(pJ.x, pJ.y); this.ctx.lineTo(pM.x, pM.y);
    this.ctx.moveTo(pI.x, pI.y); this.ctx.lineTo(pM.x, pM.y);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#0284C7';
    this.ctx.beginPath();
    this.ctx.moveTo(pI.x, pI.y); this.ctx.lineTo(pN.x, pN.y);
    this.ctx.moveTo(pJ.x, pJ.y); this.ctx.lineTo(pN.x, pN.y);
    this.ctx.stroke();

    // Line MN
    this.ctx.strokeStyle = '#059669';
    this.ctx.lineWidth = 2.2;
    this.ctx.beginPath();
    this.ctx.moveTo(pM.x, Math.min(pM.y, pN.y, cy) - 10);
    this.ctx.lineTo(pN.x, Math.max(pM.y, pN.y, cy) + 14);
    this.ctx.stroke();

    // Right angle
    this.ctx.beginPath();
    this.ctx.moveTo(pH.x, pH.y - 10);
    this.ctx.lineTo(pH.x + 10, pH.y - 10);
    this.ctx.lineTo(pH.x + 10, pH.y);
    this.ctx.stroke();

    // Points & labels
    this.ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    const pts = [
      { p: pI, label: 'I', dx: -16, dy: 16, col: '#0F172A' },
      { p: pJ, label: 'J', dx: 6, dy: 16, col: '#0F172A' },
      { p: pE, label: 'E', dx: 6, dy: -6, col: '#0F4C81' },
      { p: pF, label: 'F', dx: -16, dy: -6, col: '#0F4C81' },
      { p: pM, label: 'M', dx: 8, dy: 4, col: '#059669' },
      { p: pN, label: 'N', dx: 8, dy: 4, col: '#0284C7' },
    ];
    for (const item of pts) {
      this.ctx.fillStyle = item.col;
      this.ctx.beginPath();
      this.ctx.arc(item.p.x, item.p.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillText(item.label, item.p.x + item.dx, item.p.y + item.dy);
    }

    this.ctx.restore();
    this.y += boxH + 16;
  }

  private drawTriangleDiagramQ7() {
    const boxH = 205;
    this.ctx.save();
    this.ctx.fillStyle = '#F8FAFC';
    this.ctx.strokeStyle = '#E2E8F0';
    this.ctx.lineWidth = 1.2;
    this.roundRect(MARGIN_X, this.y, CONTENT_WIDTH, boxH, 8);
    this.ctx.fill();
    this.ctx.stroke();

    const ax = MARGIN_X + CONTENT_WIDTH / 2 - 110;
    const ay = this.y + 175;
    const bx = ax;
    const by = this.y + 35;
    const cx = ax + 210;
    const cy = ay;
    const dx = ax;
    const dy = (ay + by) / 2;

    const ab = ay - by;
    const ac = cx - ax;
    const bc = Math.hypot(ab, ac);
    const be = (ab * ab) / (2 * bc);
    const ux = (cx - bx) / bc;
    const uy = (cy - by) / bc;
    const ex = bx + be * ux;
    const ey = by + be * uy;

    // Right angle at A
    this.ctx.strokeStyle = '#0F4C81';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(ax, ay - 12, 12, 12);

    // Triangle ABC
    this.ctx.strokeStyle = '#0F172A';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(ax, ay);
    this.ctx.lineTo(bx, by);
    this.ctx.lineTo(cx, cy);
    this.ctx.closePath();
    this.ctx.stroke();

    // DE
    this.ctx.strokeStyle = '#0284C7';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(dx, dy);
    this.ctx.lineTo(ex, ey);
    this.ctx.stroke();

    // Labels
    this.ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillStyle = '#0F172A';
    this.ctx.fillText('A', ax - 18, ay + 12);
    this.ctx.fillText('B', bx - 18, by + 4);
    this.ctx.fillText('C', cx + 8, cy + 12);
    this.ctx.fillStyle = '#0F4C81';
    this.ctx.fillText('D', dx - 18, dy + 5);
    this.ctx.fillStyle = '#0284C7';
    this.ctx.fillText('E', ex + 8, ey - 6);

    this.ctx.restore();
    this.y += boxH + 16;
  }

  drawClosingMessage() {
    const lines = this.wrapLines(
      `« ${QUIZ_META.closingMessage} »`,
      '600 20px "Plus Jakarta Sans", system-ui, sans-serif',
      CONTENT_WIDTH - 40
    );
    const boxH = lines.length * 28 + 36;
    this.ensureSpace(boxH + 16);

    this.ctx.save();
    this.ctx.fillStyle = '#0F4C81';
    this.roundRect(MARGIN_X, this.y, CONTENT_WIDTH, boxH, 10);
    this.ctx.fill();

    this.ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
    this.ctx.fillStyle = '#FFFFFF';
    lines.forEach((line, idx) => {
      const w = this.ctx.measureText(line).width;
      this.ctx.fillText(line, MARGIN_X + (CONTENT_WIDTH - w) / 2, this.y + 38 + idx * 28);
    });
    this.ctx.restore();
    this.y += boxH + 12;
  }

  finalizeToPdf(filename: string) {
    this.drawPageFooter();
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    this.pages.forEach((canvas, idx) => {
      if (idx > 0) doc.addPage();
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    });

    doc.save(filename);
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, r);
    this.ctx.arcTo(x + w, y + h, x, y + h, r);
    this.ctx.arcTo(x, y + h, x, y, r);
    this.ctx.arcTo(x, y, x + w, y, r);
    this.ctx.closePath();
  }
}

export function downloadCorrectionPdf(answers: QuizAnswersMap, participantName: string) {
  const score = QUIZ_QUESTIONS.reduce(
    (acc, q) => (answers[q.id] === q.correctAnswer ? acc + 1 : acc),
    0
  );

  const builder = new CanvasPageBuilder();
  builder.drawDocumentHeader(participantName, score, QUIZ_QUESTIONS.length);

  for (const q of QUIZ_QUESTIONS) {
    builder.drawQuestionSection(q, answers[q.id]);
  }

  builder.drawClosingMessage();
  builder.finalizeToPdf('Corrige_Detaille_Gen_MOME.pdf');
}


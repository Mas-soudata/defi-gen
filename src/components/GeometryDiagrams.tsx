import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface DiagramProps {
  mode: 'quiz' | 'solution';
}

export const CircleDiagramQ6: React.FC<DiagramProps> = ({ mode }) => {
  // Angles in degrees on circle (C), avoiding 0, 180 (I, J)
  const [angleE, setAngleE] = useState<number>(62);
  const [angleF, setAngleF] = useState<number>(138);

  const R = 82;
  const cx = 210;
  const cy = 175;

  const radE = (angleE * Math.PI) / 180;
  const radF = (angleF * Math.PI) / 180;

  // Math coordinates in frame centered at O with I(-1, 0), J(1, 0)
  const x1 = Math.cos(radE);
  const y1 = Math.sin(radE);
  const x2 = Math.cos(radF);
  const y2 = Math.sin(radF);

  // Intersections M = (EJ) ∩ (FI), N = (IE) ∩ (JF)
  const denomM = y1 * (x2 + 1) - y2 * (x1 - 1);
  const denomN = y1 * (x2 - 1) - y2 * (x1 + 1);
  const isDegenerate = Math.abs(denomM) < 0.08 || Math.abs(denomN) < 0.08 || Math.abs(angleE - angleF) < 6;

  let xM = 0;
  let yM = 0;
  let xN = 0;
  let yN = 0;

  if (!isDegenerate) {
    xM = (y1 * (x2 + 1) + y2 * (x1 - 1)) / denomM;
    yM = (y1 / (x1 - 1)) * (xM - 1);

    xN = -(y1 * (x2 - 1) + y2 * (x1 + 1)) / denomN;
    yN = (y1 / (x1 + 1)) * (xN + 1);
  }

  // Convert math coords (x, y) to SVG coords (px, py) (note SVG y goes down)
  const toSvg = (mx: number, my: number) => ({
    x: cx + mx * R,
    y: cy - my * R,
  });

  const pI = toSvg(-1, 0);
  const pJ = toSvg(1, 0);
  const pE = toSvg(x1, y1);
  const pF = toSvg(x2, y2);
  const pM = toSvg(xM, yM);
  const pN = toSvg(xN, yN);
  const pH = toSvg(xM, 0); // Foot of perpendicular from M, N onto (IJ)

  const clipPoint = (p: { x: number; y: number }) =>
    Number.isFinite(p.x) && Number.isFinite(p.y) && p.x > -200 && p.x < 620 && p.y > -200 && p.y < 520;

  const validPoints = !isDegenerate && clipPoint(pM) && clipPoint(pN);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Figure géométrique · Cercle (C) de diamètre [IJ]
          </p>
        </div>
        {mode === 'solution' && (
          <button
            type="button"
            onClick={() => {
              setAngleE(62);
              setAngleF(138);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F4C81] hover:text-[#0284C7] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="bg-[#F8FAFC] border border-slate-200 rounded-md overflow-hidden">
        <svg viewBox="0 0 420 310" className="w-full h-auto max-h-[290px]" role="img" aria-label="Figure géométrique du cercle (C) avec diamètre IJ, points E et F, et intersections M et N">
          {/* Subtle coordinate grid in solution mode */}
          {mode === 'solution' && (
            <g stroke="#E2E8F0" strokeWidth="0.75">
              <line x1="20" y1={cy} x2="400" y2={cy} strokeDasharray="3 3" />
              <line x1={cx} y1="15" x2={cx} y2="295" strokeDasharray="3 3" />
            </g>
          )}

          {/* Circle (C) */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#0F4C81" strokeWidth="1.75" />
          <text x={cx - R + 8} y={cy + R - 10} fontSize="11" fontWeight="600" fill="#0F4C81">
            (C)
          </text>

          {/* Diameter [IJ] extended slightly */}
          <line x1="40" y1={cy} x2="380" y2={cy} stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={pI.x} y1={pI.y} x2={pJ.x} y2={pJ.y} stroke="#0F172A" strokeWidth="2" />

          {validPoints && (
            <>
              {/* Secant lines (EJ) and (FI) meeting at M */}
              <line x1={pJ.x} y1={pJ.y} x2={pM.x} y2={pM.y} stroke="#64748B" strokeWidth="1.25" />
              <line x1={pI.x} y1={pI.y} x2={pM.x} y2={pM.y} stroke="#64748B" strokeWidth="1.25" />

              {/* Secant lines (IE) and (JF) meeting at N */}
              <line x1={pI.x} y1={pI.y} x2={pN.x} y2={pN.y} stroke="#0284C7" strokeWidth="1.25" />
              <line x1={pJ.x} y1={pJ.y} x2={pN.x} y2={pN.y} stroke="#0284C7" strokeWidth="1.25" />

              {/* Line (MN) */}
              <line
                x1={pM.x}
                y1={Math.min(pM.y, pN.y, cy) - 18}
                x2={pN.x}
                y2={Math.max(pM.y, pN.y, cy) + 18}
                stroke={mode === 'solution' ? '#059669' : '#475569'}
                strokeWidth={mode === 'solution' ? '2' : '1.4'}
                strokeDasharray={mode === 'quiz' ? '5 4' : undefined}
              />

              {/* Right angle symbol at H = (MN) ∩ (IJ) only in solution mode */}
              {mode === 'solution' && (
                <path
                  d={`M ${pH.x} ${pH.y - 10} L ${pH.x + 10} ${pH.y - 10} L ${pH.x + 10} ${pH.y}`}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="1.5"
                />
              )}

              {/* Points M and N */}
              <circle cx={pM.x} cy={pM.y} r="4" fill={mode === 'solution' ? '#059669' : '#0F172A'} />
              <text x={pM.x + 7} y={pM.y - 6} fontSize="12" fontWeight="700" fill={mode === 'solution' ? '#059669' : '#0F172A'}>
                M
              </text>

              <circle cx={pN.x} cy={pN.y} r="4" fill="#0284C7" />
              <text x={pN.x + 7} y={pN.y - 6} fontSize="12" fontWeight="700" fill="#0284C7">
                N
              </text>
            </>
          )}

          {/* Points O, I, J, E, F */}
          <circle cx={cx} cy={cy} r="2.5" fill="#64748B" />
          <text x={cx - 4} y={cy + 15} fontSize="11" fill="#64748B">
            O
          </text>

          <circle cx={pI.x} cy={pI.y} r="4" fill="#0F172A" />
          <text x={pI.x - 14} y={pI.y + 15} fontSize="12" fontWeight="700" fill="#0F172A">
            I
          </text>

          <circle cx={pJ.x} cy={pJ.y} r="4" fill="#0F172A" />
          <text x={pJ.x + 6} y={pJ.y + 15} fontSize="12" fontWeight="700" fill="#0F172A">
            J
          </text>

          <circle cx={pE.x} cy={pE.y} r="4" fill="#0F4C81" />
          <text x={pE.x + 7} y={pE.y - 6} fontSize="12" fontWeight="700" fill="#0F4C81">
            E
          </text>

          <circle cx={pF.x} cy={pF.y} r="4" fill="#0F4C81" />
          <text x={pF.x - 15} y={pF.y - 6} fontSize="12" fontWeight="700" fill="#0F4C81">
            F
          </text>
        </svg>
      </div>

      {mode === 'solution' && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Position de E (angle θ_E)</span>
                <span className="font-mono-tabular text-[#0F4C81]">{angleE}°</span>
              </div>
              <input
                type="range"
                min={20}
                max={160}
                value={angleE}
                onChange={(e) => setAngleE(Number(e.target.value))}
                className="w-full accent-[#0F4C81] cursor-pointer"
              />
            </label>
            <label className="block">
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Position de F (angle θ_F)</span>
                <span className="font-mono-tabular text-[#0F4C81]">{angleF}°</span>
              </div>
              <input
                type="range"
                min={20}
                max={160}
                value={angleF}
                onChange={(e) => setAngleF(Number(e.target.value))}
                className="w-full accent-[#0F4C81] cursor-pointer"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-mono-tabular">
            {validPoints ? (
              <>
                <span>
                  x_M = <strong className="text-slate-900">{xM.toFixed(4)}</strong>
                </span>
                <span>
                  x_N = <strong className="text-slate-900">{xN.toFixed(4)}</strong>
                </span>
                <span className="text-[#059669] font-semibold">
                  |x_M − x_N| = {Math.abs(xM - xN).toExponential(1)} ⇒ (MN) ⊥ (IJ)
                </span>
              </>
            ) : (
              <span className="text-[#D97706] font-sans font-medium">
                Configuration proche d’un cas dégénéré (E ≈ F ou intersection hors cadre). Déplacez un curseur.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const RightTriangleDiagramQ7: React.FC<DiagramProps> = ({ mode }) => {
  const [ab, setAb] = useState<number>(6);
  const [ac, setAc] = useState<number>(8);

  const bc = Math.sqrt(ab * ab + ac * ac);
  const bd = ab / 2;
  const be = (ab * ab) / (2 * bc);
  const ec = bc - be;
  const de = Math.sqrt(Math.max(0, bd * bd - be * be));

  // Scale triangle cleanly inside 400x240 SVG
  const maxDim = Math.max(ab, ac);
  const scale = 155 / maxDim;
  const ax = 75;
  const ay = 195;
  const bx = ax;
  const by = ay - ab * scale;
  const cx = ax + ac * scale;
  const cy = ay;
  const dx = ax;
  const dy = (ay + by) / 2;

  // Foot E on BC: vector B -> C is (cx - bx, cy - by)
  const ux = (cx - bx) / (bc * scale);
  const uy = (cy - by) / (bc * scale);
  const ex = bx + be * scale * ux;
  const ey = by + be * scale * uy;

  // Right angle marker at E along EB and ED
  const mLen = 9;
  const edLen = Math.hypot(dx - ex, dy - ey) || 1;
  const vx = (dx - ex) / edLen;
  const vy = (dy - ey) / edLen;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <p className="text-xs font-medium text-slate-500">
          Figure géométrique · Triangle ABC rectangle en A, D milieu de [AB], DE ⊥ BC
        </p>
        {mode === 'solution' && (
          <button
            type="button"
            onClick={() => {
              setAb(6);
              setAc(8);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F4C81] hover:text-[#0284C7] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="bg-[#F8FAFC] border border-slate-200 rounded-md overflow-hidden">
        <svg viewBox="0 0 400 230" className="w-full h-auto max-h-[240px]" role="img" aria-label="Triangle rectangle ABC en A, avec D milieu de AB et E projeté orthogonal de D sur BC">
          {/* Right angle marker at A */}
          <path
            d={`M ${ax} ${ay - 12} L ${ax + 12} ${ay - 12} L ${ax + 12} ${ay}`}
            fill="none"
            stroke="#0F4C81"
            strokeWidth="1.5"
          />

          {/* Triangle ABC */}
          <polygon
            points={`${ax},${ay} ${bx},${by} ${cx},${cy}`}
            fill="#FFFFFF"
            fillOpacity="0.6"
            stroke="#0F172A"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Segment DE */}
          <line x1={dx} y1={dy} x2={ex} y2={ey} stroke="#0284C7" strokeWidth="1.8" />

          {/* In solution mode, highlight CD auxiliary segment lightly */}
          {mode === 'solution' && (
            <line x1={dx} y1={dy} x2={cx} y2={cy} stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="4 4" />
          )}

          {/* Right angle marker at E */}
          <path
            d={`M ${ex + ux * mLen} ${ey + uy * mLen} L ${ex + ux * mLen + vx * mLen} ${ey + uy * mLen + vy * mLen} L ${ex + vx * mLen} ${ey + vy * mLen}`}
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.4"
          />

          {/* Equal tick marks on AD and BD */}
          <line x1={ax - 5} y1={(ay + dy) / 2} x2={ax + 5} y2={(ay + dy) / 2} stroke="#0F4C81" strokeWidth="1.6" />
          <line x1={ax - 5} y1={(by + dy) / 2} x2={ax + 5} y2={(by + dy) / 2} stroke="#0F4C81" strokeWidth="1.6" />

          {/* Vertices */}
          <circle cx={ax} cy={ay} r="3.5" fill="#0F172A" />
          <text x={ax - 16} y={ay + 14} fontSize="12" fontWeight="700" fill="#0F172A">A</text>

          <circle cx={bx} cy={by} r="3.5" fill="#0F172A" />
          <text x={bx - 16} y={by + 4} fontSize="12" fontWeight="700" fill="#0F172A">B</text>

          <circle cx={cx} cy={cy} r="3.5" fill="#0F172A" />
          <text x={cx + 8} y={cy + 14} fontSize="12" fontWeight="700" fill="#0F172A">C</text>

          <circle cx={dx} cy={dy} r="3.5" fill="#0F4C81" />
          <text x={dx - 18} y={dy + 4} fontSize="12" fontWeight="700" fill="#0F4C81">D</text>

          <circle cx={ex} cy={ey} r="3.5" fill="#0284C7" />
          <text x={ex + 7} y={ey - 7} fontSize="12" fontWeight="700" fill="#0284C7">E</text>
        </svg>
      </div>

      {mode === 'solution' && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Longueur AB</span>
                <span className="font-mono-tabular text-[#0F4C81]">{ab.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                step={0.5}
                value={ab}
                onChange={(e) => setAb(Number(e.target.value))}
                className="w-full accent-[#0F4C81] cursor-pointer"
              />
            </label>
            <label className="block">
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Longueur AC</span>
                <span className="font-mono-tabular text-[#0F4C81]">{ac.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                step={0.5}
                value={ac}
                onChange={(e) => setAc(Number(e.target.value))}
                className="w-full accent-[#0F4C81] cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs font-mono-tabular text-slate-700">
            <div>BC = {bc.toFixed(2)}</div>
            <div>BE = {be.toFixed(2)}</div>
            <div>EC = {ec.toFixed(2)}</div>
            <div>DE = {de.toFixed(2)}</div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular bg-emerald-50/70 border border-emerald-200 rounded-md px-3 py-2 text-emerald-900">
            <span>EC² = {(ec * ec).toFixed(2)}</span>
            <span>AC² + EB² = {(ac * ac + be * be).toFixed(2)}</span>
            <span className="font-semibold">Égalité vérifiée : EC² = AC² + EB²</span>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Renders prose mixed with inline ($...$) and block ($$...$$) LaTeX expressions using KaTeX.
 * Preserves newlines and simple bullet lines starting with "- ".
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const renderLine = (line: string, lineIdx: number) => {
    // Split by $$...$$ first, then $...$
    const segments = line.split(/(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g);

    const rendered = segments.map((seg, idx) => {
      if (seg.startsWith('$$') && seg.endsWith('$$')) {
        const tex = seg.slice(2, -2).trim();
        try {
          const html = katex.renderToString(tex, {
            displayMode: true,
            throwOnError: false,
            strict: false,
          });
          return (
            <span
              key={idx}
              className="block my-2 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <code key={idx}>{tex}</code>;
        }
      }

      if (seg.startsWith('$') && seg.endsWith('$')) {
        const tex = seg.slice(1, -1).trim();
        try {
          const html = katex.renderToString(tex, {
            displayMode: false,
            throwOnError: false,
            strict: false,
          });
          return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch {
          return <code key={idx}>{tex}</code>;
        }
      }

      return <React.Fragment key={idx}>{seg}</React.Fragment>;
    });

    if (line.trim().startsWith('- ')) {
      return (
        <div key={lineIdx} className="flex items-start gap-2.5 pl-2 my-1">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" aria-hidden="true" />
          <div className="flex-1">{rendered.slice(0).map((el, i) => (i === 0 && typeof el === 'object' ? el : el))}</div>
        </div>
      );
    }

    return (
      <div key={lineIdx} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'}>
        {rendered}
      </div>
    );
  };

  // Better bullet stripping so "- " doesn't appear twice
  const lines = text.split('\n');

  return (
    <div className={className}>
      {lines.map((line, i) => {
        if (line.trim().startsWith('- ')) {
          const stripped = line.replace(/^\s*-\s+/, '');
          const segments = stripped.split(/(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g);
          return (
            <div key={i} className="flex items-start gap-2.5 pl-2 my-1 leading-relaxed">
              <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-[#0F4C81] shrink-0" aria-hidden="true" />
              <div className="flex-1">
                {segments.map((seg, idx) => {
                  if (seg.startsWith('$') && seg.endsWith('$')) {
                    const tex = seg.slice(1, -1).trim();
                    const html = katex.renderToString(tex, { displayMode: false, throwOnError: false, strict: false });
                    return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} />;
                  }
                  return <React.Fragment key={idx}>{seg}</React.Fragment>;
                })}
              </div>
            </div>
          );
        }
        return renderLine(line, i);
      })}
    </div>
  );
};

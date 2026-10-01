import { HudCorner, WebIcon } from "./SpiderIcons.jsx";

export default function FindingsList({ analysis }) {
  if (!analysis) return null;
  const findings = analysis.findings || [];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#2B161B] bg-[#12121A] p-4 shadow-xl">
      <HudCorner position="top-left" className="absolute top-2 left-2 text-[#E62429]/40 w-2.5 h-2.5" />
      <HudCorner position="bottom-right" className="absolute bottom-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />

      <div className="flex items-center gap-2">
        <WebIcon className="h-4 w-4 text-[#E62429]" />
        <h3 className="font-display text-sm font-bold tracking-wide text-white">
          Suit AST Diagnostics
        </h3>
      </div>
      <p className="mt-1 text-[11px] text-[#A1A1AA] leading-relaxed">{analysis.disclaimer}</p>

      {/* Syntax Error Report */}
      {analysis.syntax && analysis.syntax.ok === false ? (
        <div className="mt-3 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-200">
          <p className="font-semibold text-[#FF4D55] flex items-center gap-1.5">
            <span>⚠</span>
            <span>Confirmed Syntax Error{analysis.syntax.lineno ? ` on line ${analysis.syntax.lineno}` : ""}</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-[#FFA4A8]">{analysis.syntax.error}</p>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#2A181C] bg-[#0E0E14] px-3 py-2 text-xs text-[#A1A1AA]">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>No confirmed parser syntax errors detected.</span>
        </div>
      )}

      {/* Heuristic Findings */}
      {findings.length === 0 ? (
        <p className="mt-3 text-xs text-[#71717A] italic">No heuristic issues flagged by local scanner.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {findings.map((item, index) => {
            const isHigh = item.severity === "high" || item.severity === "critical";
            return (
              <li
                key={`${item.message}-${index}`}
                className="rounded-xl border border-[#2A181C] bg-[#0C0C12] p-3 text-xs transition-all hover:border-[#E62429]/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isHigh
                        ? "border border-red-800 bg-red-950/60 text-[#FF5A62]"
                        : "border border-[#3D252A] bg-[#22161A] text-[#FF8E94]"
                    }`}
                  >
                    {item.severity} · {item.category}
                  </span>
                  {item.line ? (
                    <span className="font-mono text-[10px] text-[#A1A1AA]">line {item.line}</span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs font-medium text-[#F5F5F7]">{item.message}</p>
                {item.snippet ? (
                  <pre className="mt-2 overflow-x-auto rounded-lg border border-[#251518] bg-[#08080C] p-2 font-mono text-[11px] text-[#D4D4D8]">
                    {item.snippet}
                  </pre>
                ) : null}
                {item.suggestion ? (
                  <div className="mt-2 rounded-lg bg-[#E62429]/10 border border-[#E62429]/20 px-2.5 py-1.5 text-xs text-[#FFA4A8]">
                    <span className="font-semibold text-[#FF4D55]">Suggested Fix: </span>
                    {item.suggestion}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

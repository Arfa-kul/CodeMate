import { useState } from "react";
import FindingsList from "../components/FindingsList.jsx";
import LanguageSelect from "../components/LanguageSelect.jsx";
import MarkdownMessage from "../components/MarkdownMessage.jsx";
import { HudCorner, WebIcon } from "../components/SpiderIcons.jsx";
import { api } from "../services/api.js";

export default function ExplainerPage() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      setResult(await api.explain({ code, language }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
      title="Code Explainer"
      badge="WALKTHROUGH SUITE"
      subtitle="Synthesize purpose, step-by-step logic, I/O parameters, computational complexity, and edge-case limitations."
      language={language}
      setLanguage={setLanguage}
      code={code}
      setCode={setCode}
      onRun={run}
      loading={loading}
      error={error}
      action="Explain Code"
      actionIcon="🔍"
    >
      {result ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-[#2B161B] bg-[#111119] p-4 shadow-xl">
            <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />
            <div className="flex items-center gap-2 border-b border-[#241518] pb-2 mb-3">
              <WebIcon className="h-4 w-4 text-[#E62429]" />
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                Detailed Analysis
              </h2>
            </div>
            <MarkdownMessage content={result.reply} />
          </div>
          <FindingsList analysis={result.analysis} />
        </div>
      ) : null}
    </ToolLayout>
  );
}

export function ToolLayout({
  title,
  badge = "MODULE",
  subtitle,
  language,
  setLanguage,
  code,
  setCode,
  onRun,
  loading,
  error,
  action,
  actionIcon = "⚡",
  extra,
  children,
}) {
  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-[#2B161B] bg-[#111119] p-5 shadow-xl">
        <HudCorner position="top-left" className="absolute top-2 left-2 text-[#E62429]/40 w-2.5 h-2.5" />
        <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-bold tracking-tight text-white">{title}</h1>
              <span className="rounded-full border border-[#E62429]/40 bg-[#251216] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF4D55]">
                {badge}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#A1A1AA] leading-relaxed max-w-2xl">{subtitle}</p>
          </div>
          <div className="w-full sm:w-48">
            <LanguageSelect value={language} onChange={setLanguage} />
          </div>
        </div>

        {extra}

        <div className="mt-3">
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="h-56 w-full rounded-xl border border-[#2B161B] bg-[#0A0A10] p-3.5 font-mono text-xs text-[#EDEDF2] leading-relaxed placeholder-[#52525B] transition-all hover:border-[#E62429]/40 focus:border-[#E62429] focus:outline-none focus:ring-1 focus:ring-[#E62429]/40"
            placeholder="Paste code snippet to analyze or transform…"
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onRun}
            disabled={loading || !code.trim()}
            className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E62429] via-[#FF3B45] to-[#B3181C] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_0_15px_rgba(230,36,41,0.35)] transition-all duration-200 hover:shadow-[0_0_22px_rgba(230,36,41,0.65)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none"
          >
            <span>{actionIcon}</span>
            <span>{loading ? "Processing via Web AI…" : action}</span>
          </button>
          <span className="text-[11px] text-[#71717A]">Local AST & static checks supported</span>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-200">
            {error}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

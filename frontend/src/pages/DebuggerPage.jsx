import { useState } from "react";
import CodeBlock from "../components/CodeBlock.jsx";
import FindingsList from "../components/FindingsList.jsx";
import LanguageSelect from "../components/LanguageSelect.jsx";
import MarkdownMessage from "../components/MarkdownMessage.jsx";
import { HudCorner, WebIcon } from "../components/SpiderIcons.jsx";
import { api } from "../services/api.js";

export default function DebuggerPage() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      setResult(await api.debug({ code, language, error_message: errorMessage || undefined }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      {/* Input Debugger Form Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2B161B] bg-[#111119] p-5 shadow-xl">
        <HudCorner position="top-left" className="absolute top-2 left-2 text-[#E62429]/40 w-2.5 h-2.5" />
        <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />

        <div className="flex items-center gap-2">
          <WebIcon className="h-4 w-4 text-[#E62429]" />
          <h1 className="font-display text-lg font-bold tracking-tight text-white">
            Spider Bug Hunter
          </h1>
          <span className="rounded-full border border-[#E62429]/40 bg-[#251216] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF4D55]">
            DIAGNOSTICS
          </span>
        </div>
        <p className="mt-1 text-xs text-[#A1A1AA] leading-relaxed">
          Paste broken code along with optional console traceback. Parser confirms syntax breaks; heuristic engine flags suspicious logic bugs.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <LanguageSelect value={language} onChange={setLanguage} />
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
            Traceback / Error Message (Optional)
            <input
              value={errorMessage}
              onChange={(event) => setErrorMessage(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#2B161B] bg-[#0A0A10] px-3.5 py-2 text-xs font-mono text-white transition-all hover:border-[#E62429]/50 focus:border-[#E62429] focus:outline-none focus:ring-1 focus:ring-[#E62429]/40"
              placeholder="e.g. IndexError: list index out of range"
            />
          </label>
        </div>

        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="mt-3.5 h-56 w-full rounded-xl border border-[#2B161B] bg-[#0A0A10] p-3.5 font-mono text-xs text-[#EDEDF2] leading-relaxed placeholder-[#52525B] transition-all hover:border-[#E62429]/40 focus:border-[#E62429] focus:outline-none focus:ring-1 focus:ring-[#E62429]/40"
          placeholder="Paste function or script that raises an error…"
        />

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={run}
            disabled={loading || !code.trim()}
            className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E62429] via-[#FF3B45] to-[#B3181C] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_0_15px_rgba(230,36,41,0.35)] transition-all duration-200 hover:shadow-[0_0_22px_rgba(230,36,41,0.65)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none"
          >
            <span>🕷️</span>
            <span>{loading ? "Inspecting AST…" : "Find Bugs"}</span>
          </button>
          <span className="text-[11px] text-[#71717A]">Python AST parser + Heuristic rules</span>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      {/* Result Diagnostics Grid */}
      {result ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <FindingsList analysis={result.analysis} />
          
          <div className="relative overflow-hidden rounded-2xl border border-[#2B161B] bg-[#111119] p-5 shadow-xl">
            <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />
            <div className="flex items-center gap-2 border-b border-[#241518] pb-2 mb-3">
              <span className="text-xs">🕸️</span>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                Spider Assistant Diagnostics
              </h2>
            </div>

            {result.kind === "syntax" ? (
              <div className="mb-3 rounded-xl border border-red-900/60 bg-red-950/40 p-2.5 text-xs text-[#FF5A62]">
                Confirmed syntax failure parsed by Python AST engine.
              </div>
            ) : null}

            {result.kind === "possible_logic" ? (
              <div className="mb-3 rounded-xl border border-[#3D252A] bg-[#22161A] p-2.5 text-xs text-[#FFA4A8]">
                Possible logic bug detected — verified through static heuristics.
              </div>
            ) : null}

            {result.reply ? (
              <MarkdownMessage content={result.reply} />
            ) : (
              <p className="text-xs leading-relaxed text-[#D4D4D8]">{result.explanation}</p>
            )}

            {result.corrected_code ? (
              <div className="mt-4">
                <h3 className="mb-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-[#FF4D55]">
                  Suggested Correction
                </h3>
                <CodeBlock code={result.corrected_code} language={language} />
              </div>
            ) : null}

            {result.message ? (
              <p className="mt-3 text-[11px] text-[#71717A] italic">{result.message}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

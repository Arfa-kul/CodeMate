import { useState } from "react";
import CodeBlock from "../components/CodeBlock.jsx";
import LanguageSelect from "../components/LanguageSelect.jsx";
import MarkdownMessage from "../components/MarkdownMessage.jsx";
import { HudCorner, WebIcon } from "../components/SpiderIcons.jsx";
import { api } from "../services/api.js";

export default function GeneratePage() {
  const [language, setLanguage] = useState("python");
  const [requirements, setRequirements] = useState("");
  const [reply, setReply] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!requirements.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.generate({ requirements, language });
      if (!data.reply) {
        setError(data.error || data.message || "Generation requires an API key.");
        setReply("");
        setCode("");
      } else {
        setReply(data.reply);
        setCode(data.code || "");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {/* Input Requirements Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2B161B] bg-[#111119] p-5 shadow-xl">
        <HudCorner position="top-left" className="absolute top-2 left-2 text-[#E62429]/40 w-2.5 h-2.5" />
        <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />

        <div className="flex items-center gap-2">
          <WebIcon className="h-4 w-4 text-[#E62429]" />
          <h1 className="font-display text-lg font-bold tracking-tight text-white">
            Code Generator
          </h1>
          <span className="rounded-full border border-[#E62429]/40 bg-[#251216] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF4D55]">
            SYNTHESIS
          </span>
        </div>
        <p className="mt-1 text-xs text-[#A1A1AA] leading-relaxed">
          Describe the algorithms, endpoints, or data structures to spin. Review all generated code prior to deployment.
        </p>

        <div className="mt-4 space-y-4">
          <div className="max-w-xs">
            <LanguageSelect value={language} onChange={setLanguage} />
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
            Specifications & Requirements
            <textarea
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              className="mt-1.5 h-44 w-full rounded-xl border border-[#2B161B] bg-[#0A0A10] p-3.5 font-mono text-xs text-[#EDEDF2] leading-relaxed placeholder-[#52525B] transition-all hover:border-[#E62429]/40 focus:border-[#E62429] focus:outline-none focus:ring-1 focus:ring-[#E62429]/40"
              placeholder="e.g. Create a FastAPI endpoint that parses JWT tokens and validates user permissions with rate limiting."
            />
          </label>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={generate}
              disabled={loading || !requirements.trim()}
              className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E62429] via-[#FF3B45] to-[#B3181C] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_0_15px_rgba(230,36,41,0.35)] transition-all duration-200 hover:shadow-[0_0_22px_rgba(230,36,41,0.65)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none"
            >
              <span>⚡</span>
              <span>{loading ? "Synthesizing…" : "Generate Code"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRequirements("");
                setReply("");
                setCode("");
                setError("");
              }}
              className="rounded-xl border border-[#381B20] bg-[#14141E] px-4 py-2.5 text-xs font-medium text-[#D4D4D8] transition-all hover:border-[#E62429]/50 hover:bg-[#1D161C] hover:text-white"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={generate}
              disabled={loading || !requirements.trim()}
              className="rounded-xl border border-[#381B20] bg-[#14141E] px-4 py-2.5 text-xs font-medium text-[#D4D4D8] transition-all hover:border-[#E62429]/50 hover:bg-[#1D161C] hover:text-white disabled:opacity-40"
            >
              Regenerate
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-200">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      {/* Output Code Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2B161B] bg-[#111119] p-5 shadow-xl">
        <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />
        <div className="flex items-center gap-2 border-b border-[#241518] pb-2 mb-3">
          <span className="text-xs">🕸️</span>
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-white">
            Synthesized Code Output
          </h2>
        </div>

        {code ? (
          <div className="space-y-4">
            <CodeBlock code={code} language={language} />
            <div className="rounded-xl border border-[#241518] bg-[#0C0C12] p-3.5">
              <MarkdownMessage content={reply} />
            </div>
          </div>
        ) : reply ? (
          <div className="rounded-xl border border-[#241518] bg-[#0C0C12] p-3.5">
            <MarkdownMessage content={reply} />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-[#71717A] italic">
              Awaiting prompt execution. Generated snippet and explanation will render here.
            </p>
            <CodeBlock code={"# Spider AI: Awaiting requirement instructions…"} language={language} />
          </div>
        )}
      </div>
    </section>
  );
}

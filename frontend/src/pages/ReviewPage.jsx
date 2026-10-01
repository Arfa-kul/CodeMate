import { useState } from "react";
import FindingsList from "../components/FindingsList.jsx";
import MarkdownMessage from "../components/MarkdownMessage.jsx";
import { HudCorner, WebIcon } from "../components/SpiderIcons.jsx";
import { api } from "../services/api.js";
import { ToolLayout } from "./ExplainerPage.jsx";

export default function ReviewPage() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      setResult(await api.review({ code, language }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
      title="Code Review Suite"
      badge="SECURITY & AUDIT"
      subtitle="Comprehensive heuristic vulnerability scan plus optional LLM narrative. Note: Heuristics provide developer guidance, not a complete certification."
      language={language}
      setLanguage={setLanguage}
      code={code}
      setCode={setCode}
      onRun={run}
      loading={loading}
      error={error}
      action="Review Code"
      actionIcon="🛡️"
    >
      {result ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <FindingsList analysis={result.analysis} />
          <div className="relative overflow-hidden rounded-2xl border border-[#2B161B] bg-[#111119] p-5 shadow-xl">
            <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />
            <div className="flex items-center gap-2 border-b border-[#241518] pb-2 mb-3">
              <WebIcon className="h-4 w-4 text-[#E62429]" />
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                Reviewer Narrative
              </h2>
            </div>
            {result.reply ? (
              <MarkdownMessage content={result.reply} />
            ) : (
              <p className="text-xs leading-relaxed text-[#D4D4D8]">{result.narrative}</p>
            )}
          </div>
        </div>
      ) : null}
    </ToolLayout>
  );
}

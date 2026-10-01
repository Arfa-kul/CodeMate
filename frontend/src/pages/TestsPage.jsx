import { useState } from "react";
import CodeBlock from "../components/CodeBlock.jsx";
import MarkdownMessage from "../components/MarkdownMessage.jsx";
import { HudCorner } from "../components/SpiderIcons.jsx";
import { api } from "../services/api.js";
import { ToolLayout } from "./ExplainerPage.jsx";

export default function TestsPage() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const data = await api.tests({ code, language });
      setResult(data);
      if (!data.reply && !data.code) {
        setError(data.error || data.message || "Test generation needs an API key.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
      title="Unit Test Generator"
      badge="TEST HARNESS"
      subtitle="Synthesize pytest, Jest-style, or JUnit-style test harnesses. Local function stubs generated instantly; submitted code is never executed."
      language={language}
      setLanguage={setLanguage}
      code={code}
      setCode={setCode}
      onRun={run}
      loading={loading}
      error={error}
      action="Generate Tests"
      actionIcon="🧪"
    >
      {result?.code || result?.reply ? (
        <div className="relative overflow-hidden rounded-2xl border border-[#2B161B] bg-[#111119] p-5 shadow-xl space-y-4">
          <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />
          <div className="flex items-center justify-between border-b border-[#241518] pb-2">
            <h2 className="font-display text-xs font-bold uppercase tracking-wider text-[#FF4D55]">
              Synthesized Test Harness
            </h2>
            {result.ai_used ? (
              <span className="rounded-full border border-emerald-900/40 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                AI Enhanced
              </span>
            ) : (
              <span className="rounded-full border border-[#3D252A] bg-[#22161A] px-2 py-0.5 text-[10px] font-semibold text-[#FFA4A8]">
                Local AST Stubs
              </span>
            )}
          </div>

          {result.code ? <CodeBlock code={result.code} language={language} /> : null}

          {result.reply ? (
            <div className="rounded-xl border border-[#241518] bg-[#0C0C12] p-3.5">
              <MarkdownMessage content={result.reply} />
            </div>
          ) : null}

          {result.code && !result.ai_used ? (
            <p className="text-xs text-[#A1A1AA] italic">
              {result.message || "Local AST stubs generated without remote API. Fill in assertions for target boundary values."}
            </p>
          ) : null}
        </div>
      ) : null}
    </ToolLayout>
  );
}

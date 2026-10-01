import { useState } from "react";
import CodeBlock from "../components/CodeBlock.jsx";
import MarkdownMessage from "../components/MarkdownMessage.jsx";
import { HudCorner } from "../components/SpiderIcons.jsx";
import { REFACTOR_GOALS, api } from "../services/api.js";
import { ToolLayout } from "./ExplainerPage.jsx";

export default function RefactorPage() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [goals, setGoals] = useState(["readability"]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(goal) {
    setGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]
    );
  }

  async function run() {
    setLoading(true);
    setError("");
    try {
      setResult(await api.refactor({ code, language, goals }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
      title="Code Refactor Suite"
      badge="TRANSFORMATION"
      subtitle="Original and proposed code are displayed side-by-side. Existing logic behavior is preserved unless an anti-pattern is fixed."
      language={language}
      setLanguage={setLanguage}
      code={code}
      setCode={setCode}
      onRun={run}
      loading={loading}
      error={error}
      action="Refactor Code"
      actionIcon="🛠️"
      extra={
        <fieldset className="mt-4">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
            Refactoring Directives
          </legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {REFACTOR_GOALS.map((item) => {
              const checked = goals.includes(item.value);
              return (
                <label
                  key={item.value}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-xs transition-all ${
                    checked
                      ? "border-[#E62429]/60 bg-[#251216] text-white shadow-[0_0_10px_rgba(230,36,41,0.2)]"
                      : "border-[#2B161B] bg-[#0C0C12] text-[#A1A1AA] hover:border-[#3D1E24]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(item.value)}
                    className="h-3.5 w-3.5 rounded border-[#3D1E24] bg-[#14141E] text-[#E62429] accent-[#E62429] focus:ring-0"
                  />
                  <span className="font-medium">{item.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      }
    >
      {result ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-[#2B161B] bg-[#111119] p-4 shadow-xl">
            <HudCorner position="top-left" className="absolute top-2 left-2 text-[#E62429]/40 w-2.5 h-2.5" />
            <h2 className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Baseline Code
            </h2>
            <CodeBlock code={result.original_code} language={language} />
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[#2B161B] bg-[#111119] p-4 shadow-xl">
            <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />
            <h2 className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-[#FF4D55]">
              Proposed Refactoring
            </h2>
            {result.proposed_code ? <CodeBlock code={result.proposed_code} language={language} /> : null}
            <div className="mt-3 rounded-xl border border-[#241518] bg-[#0C0C12] p-3">
              <MarkdownMessage content={result.reply} />
            </div>
          </div>
        </div>
      ) : null}
    </ToolLayout>
  );
}

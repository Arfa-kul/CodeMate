import { useOutletContext } from "react-router-dom";
import { HudCorner, SpiderLogo, WebIcon } from "../components/SpiderIcons.jsx";

export default function SettingsPage() {
  const { health } = useOutletContext();
  const data = health?.data;

  return (
    <section className="relative max-w-3xl space-y-5 overflow-hidden rounded-2xl border border-[#2B161B] bg-[#111119] p-6 shadow-2xl">
      <HudCorner position="top-left" className="absolute top-2 left-2 text-[#E62429]/40 w-3 h-3" />
      <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-3 h-3" />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E62429]/40 bg-[#1A1215] shadow-[0_0_12px_rgba(230,36,41,0.25)]">
          <SpiderLogo className="h-6 w-6 text-[#E62429]" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight text-white">
            Suit OS Configuration & Settings
          </h1>
          <p className="text-xs text-[#A1A1AA]">
            Environment parameters and local/remote AI model connectivity status.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#261518] bg-[#0C0C12] p-4">
        <h2 className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-[#FF4D55]">
          Telemetry Status
        </h2>
        <dl className="divide-y divide-[#241518] text-xs">
          <Row
            label="API Gateway Status"
            value={
              health?.error ? (
                <span className="text-red-400 font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Offline
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 spider-pulse" />
                  Online (FastAPI :8001)
                </span>
              )
            }
          />
          <Row
            label="LLM Neural Core"
            value={
              data?.llm_configured ? (
                <span className="text-emerald-400 font-semibold">Active & Configured</span>
              ) : (
                <span className="text-[#FFA4A8] font-semibold">AST Local Mode Only</span>
              )
            }
          />
          <Row
            label="Target Model"
            value={
              <span className="rounded bg-[#1A1215] px-2 py-0.5 font-mono text-[11px] text-white border border-[#381B20]">
                {data?.model || "Set in backend/.env"}
              </span>
            }
          />
          <Row
            label="Local Python AST Engine"
            value={<span className="text-emerald-400 font-mono">Available (ast parser)</span>}
          />
        </dl>
      </div>

      <div className="rounded-xl border border-[#2D161B] bg-[#14121A] p-4 text-xs leading-relaxed">
        <div className="flex items-center gap-2 mb-2">
          <WebIcon className="h-4 w-4 text-[#E62429]" />
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-white">
            Connecting a Live AI Model
          </h3>
        </div>
        <p className="text-[#A1A1AA] mb-3">
          To enable live LLM generation and conversations with your choice of provider:
        </p>
        <ol className="list-decimal space-y-1.5 pl-5 text-[#D4D4D8]">
          <li>
            Edit <code className="rounded border border-[#381B20] bg-[#0A0A10] px-1.5 py-0.5 font-mono text-[#FF5A62]">.env</code> in the project root.
          </li>
          <li>
            Set <code className="rounded border border-[#381B20] bg-[#0A0A10] px-1.5 py-0.5 font-mono text-[#FF5A62]">LLM_API_KEY</code> from OpenAI, Groq, Together, Ollama, or any OpenAI-compatible provider.
          </li>
          <li>
            Set <code className="rounded border border-[#381B20] bg-[#0A0A10] px-1.5 py-0.5 font-mono text-[#FF5A62]">LLM_BASE_URL</code> (e.g. <span className="font-mono text-[#FF8E94]">https://api.openai.com/v1</span>).
          </li>
          <li>
            Set <code className="rounded border border-[#381B20] bg-[#0A0A10] px-1.5 py-0.5 font-mono text-[#FF5A62]">LLM_MODEL</code> (e.g. <span className="font-mono text-[#FF8E94]">gpt-4o-mini</span> or <span className="font-mono text-[#FF8E94]">llama-3.1-8b-instant</span>).
          </li>
          <li>
            Restart the FastAPI backend to reload environment variables.
          </li>
        </ol>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-[#A1A1AA]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

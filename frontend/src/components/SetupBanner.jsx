import { Link } from "react-router-dom";
import { WebIcon } from "./SpiderIcons.jsx";

export default function SetupBanner({ health }) {
  if (health.loading || health.data?.llm_configured) return null;
  const message =
    health.error ||
    "No LLM API key is configured. Chat, generate, and AI refactor require a provider key. Debugger, explainer, review, and Python test stubs still run locally via AST.";

  return (
    <div className="relative mb-4 flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-[#3E1E23] bg-[#161217] px-4 py-3 text-xs shadow-lg">
      <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-[#FF3B45] to-[#E62429]" />
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E62429]/20 text-[#FF4D55]">
          <WebIcon className="h-3 w-3" />
        </span>
        <p className="text-[#D4D4D8] leading-relaxed">
          <strong className="text-white font-semibold">Suit Diagnostic: </strong>
          {message}
        </p>
      </div>
      <Link
        to="/settings"
        className="shrink-0 rounded-lg border border-[#3D1A20] bg-[#22161A] px-3 py-1.5 font-medium text-[#FF636B] transition-all hover:border-[#E62429]/60 hover:bg-[#2C1920] hover:text-white hover:shadow-[0_0_10px_rgba(230,36,41,0.3)]"
      >
        Open Settings ›
      </Link>
    </div>
  );
}

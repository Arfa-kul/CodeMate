import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import CopyButton from "./CopyButton.jsx";

const HLJS_ALIASES = { cpp: "cpp", html: "xml", css: "css" };

const EXTENSIONS = {
  python: "py",
  javascript: "js",
  typescript: "ts",
  java: "java",
  cpp: "cpp",
  html: "html",
  css: "css",
  sql: "sql",
  json: "json",
  rust: "rs",
  go: "go",
};

export default function CodeBlock({ code, language = "text" }) {
  const highlighted = highlight(code || "", language);

  function downloadCode() {
    if (!code) return;
    const ext = EXTENSIONS[language.toLowerCase()] || "txt";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spidersnip_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-[#2B161B] bg-[#0A0A10] transition-all duration-200 hover:border-[#E62429]/50 hover:shadow-[0_0_16px_rgba(230,36,41,0.18)]">
      {/* Top red accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#E62429] via-[#FF3B45] to-transparent" />
      
      {/* Top Editor Bar */}
      <div className="flex items-center justify-between border-b border-[#241518] bg-[#12121A] px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E62429]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3D252A]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#2A181C]" />
          </div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#FF4D55] bg-[#E62429]/10 px-2 py-0.5 rounded border border-[#E62429]/25">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={downloadCode}
            className="flex items-center gap-1 rounded-md border border-[#381B20] bg-[#14141E] px-2.5 py-1 text-xs font-mono text-[#D4D4D8] hover:border-[#E62429]/60 hover:bg-[#1F1720] hover:text-white"
            title="Download snippet"
          >
            <span>💾</span>
            <span>Save</span>
          </button>
          <CopyButton text={code} />
        </div>
      </div>

      {/* Code Editor Body */}
      <pre className="overflow-x-auto p-4 text-[13px] font-mono leading-relaxed text-[#EDEDF2] selection:bg-[#E62429]/30">
        <code className="hljs" dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

function highlight(code, language) {
  const mapped = HLJS_ALIASES[language] || language;
  try {
    if (mapped && hljs.getLanguage(mapped)) {
      return hljs.highlight(code, { language: mapped }).value;
    }
  } catch {
    /* fall through */
  }
  return hljs.highlightAuto(code).value;
}

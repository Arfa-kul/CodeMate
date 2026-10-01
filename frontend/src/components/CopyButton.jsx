import { useState } from "react";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-all duration-150 ${
        copied
          ? "border border-[#E62429] bg-[#2E1216] text-[#FF4D55] shadow-[0_0_8px_rgba(230,36,41,0.4)]"
          : "border border-[#381B20] bg-[#14141E] text-[#D4D4D8] hover:border-[#E62429]/60 hover:bg-[#1F1720] hover:text-white"
      }`}
      title="Copy to clipboard"
    >
      <span>{copied ? "✓" : "📋"}</span>
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

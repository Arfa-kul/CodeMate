import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import CopyButton from "./CopyButton.jsx";

export default function MarkdownMessage({ content }) {
  if (!content) return null;
  return (
    <div className="markdown-body text-sm leading-relaxed text-[#EDEDF2]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children }) {
            const text = String(children).replace(/\n$/, "");
            const match = /language-(\w+)/.exec(className || "");
            if (inline) {
              return (
                <code className="rounded border border-[#3B191E] bg-[#1A1215] px-1.5 py-0.5 font-mono text-[12.5px] text-[#FF5A62]">
                  {text}
                </code>
              );
            }
            const language = match?.[1] || "text";
            let html = text;
            try {
              html = match ? hljs.highlight(text, { language: match[1] }).value : hljs.highlightAuto(text).value;
            } catch {
              html = text;
            }
            return (
              <div className="group relative my-3 overflow-hidden rounded-xl border border-[#2B161B] bg-[#0A0A10] transition-all duration-200 hover:border-[#E62429]/50 hover:shadow-[0_0_15px_rgba(230,36,41,0.16)]">
                {/* Top red accent line */}
                <div className="h-[2px] w-full bg-gradient-to-r from-[#E62429] via-[#FF3B45] to-transparent" />
                <div className="flex items-center justify-between border-b border-[#241518] bg-[#12121A] px-3.5 py-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#E62429] spider-pulse" />
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#FF4D55]">
                      {language}
                    </span>
                  </div>
                  <CopyButton text={text} />
                </div>
                <pre className="overflow-x-auto p-3.5 font-mono text-[13px] leading-relaxed text-[#EDEDF2] selection:bg-[#E62429]/30">
                  <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
                </pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import LanguageSelect from "../components/LanguageSelect.jsx";
import MarkdownMessage from "../components/MarkdownMessage.jsx";
import { refreshConversations } from "../components/Sidebar.jsx";
import { HudCorner, SpiderLogo, WebGridGraphic, WebIcon } from "../components/SpiderIcons.jsx";
import { api } from "../services/api.js";

export default function ChatPage() {
  const [params, setParams] = useSearchParams();
  const conversationId = params.get("c");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCodePanel, setShowCodePanel] = useState(true);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const outletCtx = useOutletContext();
  const health = outletCtx?.health;

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    api
      .conversation(conversationId)
      .then((data) => setMessages(data.messages || []))
      .catch((err) => setError(err.message));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(event) {
    if (event) event.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setError("");
    const optimistic = [...messages, { role: "user", content: input + (code ? `\n\n\`\`\`${language}\n${code}\n\`\`\`` : "") }];
    setMessages(optimistic);
    try {
      const result = await api.chat({
        message: input,
        code: code || undefined,
        language: code ? language : undefined,
        conversation_id: conversationId ? Number(conversationId) : undefined,
      });
      setInput("");
      setParams({ c: String(result.conversation_id) });
      const detail = await api.conversation(result.conversation_id);
      setMessages(detail.messages || []);
      refreshConversations();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_330px]">
      {/* Main Chat Stream Container */}
      <div className="relative flex min-h-[75vh] flex-col overflow-hidden rounded-2xl border border-[#2B161B] bg-[#101018] shadow-2xl">
        <HudCorner position="top-left" className="absolute top-2 left-2 text-[#E62429]/40 w-3 h-3" />
        <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-3 h-3" />

        {/* Chat Header Branding Bar */}
        <div className="flex items-center justify-between border-b border-[#251518] bg-[#14121B]/80 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <SpiderLogo className="h-5 w-5 text-[#E62429]" />
            <div>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                Web AI Chat Stream
              </h2>
              <p className="text-[10px] text-[#A1A1AA]">Your Friendly Neighborhood Coding Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCodePanel(!showCodePanel)}
              className="xl:hidden flex items-center gap-1 rounded-lg border border-[#381B20] bg-[#181318] px-2.5 py-1 text-xs text-[#D4D4D8]"
            >
              <span>{showCodePanel ? "Hide Snippet" : "Attach Snippet"}</span>
            </button>
            <div className="flex items-center gap-1.5 rounded-full border border-[#2B161B] bg-[#0E0E14] px-2.5 py-1 text-[11px] text-[#A1A1AA]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  health?.data?.llm_configured ? "bg-emerald-400 spider-pulse" : "bg-[#FF3B45] spider-pulse"
                }`}
              />
              <span>{health?.data?.llm_configured ? "LLM Ready" : "AST Engine"}</span>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.length === 0 ? (
            <EmptyChat onSelectPrompt={(prompt) => setInput(prompt)} navigate={navigate} />
          ) : (
            messages.map((item) => (
              <article
                key={item.id || `${item.role}-${item.content.slice(0, 16)}`}
                className={`rounded-2xl p-4 transition-all ${
                  item.role === "user"
                    ? "ml-auto max-w-[85%] border border-[#3D1B22] bg-[#1C1317] shadow-[0_0_15px_rgba(230,36,41,0.08)]"
                    : "mr-auto max-w-[95%] border border-[#26181C] bg-[#111119] shadow-lg"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2 border-b border-[#251518] pb-1.5">
                  <div className="flex items-center gap-2">
                    {item.role === "assistant" ? (
                      <>
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E62429]/20 text-[#E62429]">
                          <SpiderLogo className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-[#FF4D55]">
                          Spider AI
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2E181D] text-xs text-[#FFA4A8]">
                          🧑‍💻
                        </span>
                        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-[#D4D4D8]">
                          Developer
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {item.role === "assistant" ? (
                  <MarkdownMessage content={item.content} />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm text-[#F5F5F7] leading-relaxed">
                    {item.content}
                  </pre>
                )}
              </article>
            ))
          )}

          {/* AI Response Loading / Spinning Animation */}
          {loading ? (
            <div className="mr-auto flex max-w-sm items-center gap-3 rounded-2xl border border-[#3D1B22] bg-[#14121B] p-4 shadow-[0_0_20px_rgba(230,36,41,0.2)]">
              <div className="relative flex h-8 w-8 items-center justify-center">
                <SpiderLogo className="h-6 w-6 text-[#E62429] spider-pulse" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Spinning web response…</p>
                <p className="text-[11px] text-[#A1A1AA]">Analyzing syntax & synthesizing code</p>
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <div className="mx-4 mb-2 rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        ) : null}

        {/* Floating Composer / Input Box */}
        <form onSubmit={send} className="border-t border-[#251518] bg-[#0E0E14] p-3 sm:p-4">
          <div className="relative rounded-2xl border border-[#33181E] bg-[#14141E] p-2 transition-all duration-200 focus-within:border-[#E62429] focus-within:shadow-[0_0_20px_rgba(230,36,41,0.25)]">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a coding question, paste an error, or request a conversion… (Press Enter to send)"
              rows={3}
              className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:ring-0 leading-relaxed font-sans"
            />

            <div className="flex items-center justify-between border-t border-[#24171A] px-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[11px] text-[#71717A]">
                  <kbd className="rounded border border-[#381B20] bg-[#1A1215] px-1.5 py-0.5 font-mono text-[10px] text-[#A1A1AA]">
                    Enter
                  </kbd>{" "}
                  to send ·{" "}
                  <kbd className="rounded border border-[#381B20] bg-[#1A1215] px-1.5 py-0.5 font-mono text-[10px] text-[#A1A1AA]">
                    Shift+Enter
                  </kbd>{" "}
                  newline
                </span>
                {code ? (
                  <span className="flex items-center gap-1 rounded-md border border-[#E62429]/40 bg-[#251216] px-2 py-0.5 text-[11px] text-[#FF4D55]">
                    <span>📎</span>
                    <span>{language} attached</span>
                  </span>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E62429] via-[#FF3B45] to-[#B3181C] px-5 py-2 text-xs font-semibold text-white shadow-[0_0_15px_rgba(230,36,41,0.35)] transition-all duration-200 hover:shadow-[0_0_22px_rgba(230,36,41,0.7)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none"
              >
                <span>Send</span>
                <span className="transition-transform group-hover:translate-x-0.5">➔</span>
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] text-[#71717A]">
            Generated answers are not guaranteed to be correct. Verify code before executing.
          </p>
        </form>
      </div>

      {/* Code Attachment Aside Panel */}
      <aside
        className={`${
          showCodePanel ? "block" : "hidden xl:block"
        } relative flex flex-col rounded-2xl border border-[#2B161B] bg-[#111119] p-4 shadow-xl`}
      >
        <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🕸️</span>
            <h2 className="font-display text-xs font-bold uppercase tracking-wider text-white">
              Code Attachment
            </h2>
          </div>
          {code ? (
            <button
              type="button"
              onClick={() => setCode("")}
              className="text-[10px] text-[#E62429] hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-[11px] text-[#A1A1AA]">
          Attach a code snippet to provide direct context to Spider AI.
        </p>

        <div className="mt-3">
          <LanguageSelect value={language} onChange={setLanguage} />
        </div>

        <div className="relative mt-3 flex-1">
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="h-64 w-full rounded-xl border border-[#2B161B] bg-[#0A0A10] p-3 font-mono text-xs text-[#EDEDF2] leading-relaxed placeholder-[#52525B] transition-all hover:border-[#E62429]/40 focus:border-[#E62429] focus:outline-none focus:ring-1 focus:ring-[#E62429]/40"
            placeholder="def greet(name):\n    print(f'Hello {name}')"
          />
        </div>

        <div className="mt-3 rounded-xl border border-[#261518] bg-[#0C0C12] p-2.5 text-[11px] text-[#71717A]">
          <span className="font-semibold text-[#D4D4D8]">💡 Pro Tip: </span>
          Attaching code activates the AST static inspector along with your question.
        </div>
      </aside>
    </section>
  );
}

function EmptyChat({ onSelectPrompt, navigate }) {
  const suggestions = [
    {
      title: "Generate Code",
      desc: "Produce clean functions or complete endpoints",
      icon: "⚡",
      action: () => navigate("/generate"),
    },
    {
      title: "Debug My Code",
      desc: "Run AST syntax checks & locate logic bugs",
      icon: "🕷️",
      action: () => navigate("/debug"),
    },
    {
      title: "Explain This Code",
      desc: "Step-by-step walkthrough & complexity breakdown",
      icon: "🔍",
      action: () => navigate("/explain"),
    },
    {
      title: "Review My Code",
      desc: "Heuristic scan & security checks",
      icon: "🛡️",
      action: () => navigate("/review"),
    },
  ];

  const quickPrompts = [
    "Write a Python function to merge two sorted lists.",
    "Find the bug in this function and propose a fix.",
    "Convert this Java class to Python with type hints.",
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center py-6 text-center">
      {/* Central High-Tech Spider-Web Graphic */}
      <div className="relative mb-3 flex items-center justify-center">
        <WebGridGraphic className="h-40 w-40 sm:h-44 sm:w-44" />
      </div>

      <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        READY TO <span className="bg-gradient-to-r from-[#FF3B45] via-[#E62429] to-[#FF6B72] bg-clip-text text-transparent">SPIN SOME CODE?</span>
      </h1>
      <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[#FF4D55]/90">
        Ask. Build. Debug. Repeat.
      </p>

      {/* 4 Clickable Action Suggestion Cards */}
      <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2 text-left">
        {suggestions.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={card.action}
            className="group relative flex items-start gap-3 rounded-xl border border-[#2D161B] bg-[#14121A] p-3 text-left transition-all duration-200 hover:border-[#E62429]/60 hover:bg-[#1D141A] hover:shadow-[0_0_16px_rgba(230,36,41,0.22)] hover:scale-[1.01]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#3D1A20] bg-[#221318] text-base group-hover:border-[#E62429]/50">
              {card.icon}
            </span>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-[#FF4D55] transition-colors">
                {card.title}
              </p>
              <p className="text-[11px] text-[#A1A1AA] leading-snug">{card.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Sample Quick Prompts */}
      <div className="mt-6 w-full max-w-xl">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
          Or spin up a starter prompt:
        </p>
        <div className="flex flex-col gap-1.5 text-left">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="flex items-center justify-between rounded-lg border border-[#241518] bg-[#0E0E14] px-3 py-2 text-xs text-[#D4D4D8] transition-all hover:border-[#E62429]/40 hover:bg-[#1A141A] hover:text-white"
            >
              <span>“{prompt}”</span>
              <span className="text-[#E62429] text-xs">➔</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

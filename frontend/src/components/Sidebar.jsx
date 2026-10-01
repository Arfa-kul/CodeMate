import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api.js";
import { SpiderLogo, WebIcon, HudCorner } from "./SpiderIcons.jsx";

const QUICK_TOOLS = [
  { to: "/", label: "Chat Assistant", icon: "💬" },
  { to: "/generate", label: "Code Generator", icon: "⚡" },
  { to: "/debug", label: "Bug Finder", icon: "🕷️" },
  { to: "/explain", label: "Code Explainer", icon: "🔍" },
  { to: "/refactor", label: "Smart Refactor", icon: "🛠️" },
  { to: "/tests", label: "Unit Tests", icon: "🧪" },
  { to: "/review", label: "Code Review", icon: "🛡️" },
  { to: "/settings", label: "Suit Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  async function load() {
    try {
      const data = await api.conversations();
      setItems(data.conversations || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("codemate:conversations", onRefresh);
    return () => window.removeEventListener("codemate:conversations", onRefresh);
  }, []);

  async function remove(id) {
    await api.deleteConversation(id);
    await load();
    navigate("/");
  }

  return (
    <aside className="relative flex flex-col gap-3 rounded-2xl border border-[#2E151A] bg-[#12121A] p-3.5 shadow-xl sidebar-web-bg overflow-hidden">
      {/* Decorative subtle HUD corners */}
      <HudCorner position="top-left" className="absolute top-2 left-2 text-[#E62429]/40 w-2.5 h-2.5" />
      <HudCorner position="top-right" className="absolute top-2 right-2 text-[#E62429]/40 w-2.5 h-2.5" />

      {/* New Web Thread / Chat button with Spider-Man red gradient and glow */}
      <button
        type="button"
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#E62429] via-[#FF3B45] to-[#B3181C] px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(230,36,41,0.35)] transition-all duration-200 hover:shadow-[0_0_24px_rgba(230,36,41,0.65)] hover:scale-[1.01] active:scale-[0.98]"
        onClick={() => navigate({ pathname: "/", search: "" })}
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
        <WebIcon className="h-4 w-4 text-white" />
        <span className="tracking-wide">New Web Thread</span>
      </button>

      {/* Quick Navigation Links */}
      <div className="mt-1">
        <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-[#E62429]/80">
          Suit Modules
        </p>
        <nav className="mt-1.5 space-y-0.5">
          {QUICK_TOOLS.slice(0, 5).map((tool) => {
            const active = location.pathname === tool.to;
            return (
              <NavLink
                key={tool.to}
                to={tool.to}
                end={tool.to === "/"}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-[#1E1418] text-white border-l-2 border-[#E62429] shadow-sm"
                    : "text-[#A1A1AA] hover:bg-[#18151F] hover:text-[#F5F5F7]"
                }`}
              >
                <span className="text-xs">{tool.icon}</span>
                <span>{tool.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <hr className="border-[#261519] my-1" />

      {/* Conversation History */}
      <div className="flex-1">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#E62429]/80">
            Web Logs
          </p>
          <span className="text-[10px] font-mono text-[#71717A]">
            {items.length} {items.length === 1 ? "thread" : "threads"}
          </span>
        </div>

        {error ? <p className="px-2 text-xs text-red-400">{error}</p> : null}
        
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#2B161B] p-3 text-center">
            <p className="text-xs text-[#71717A]">No web threads yet.</p>
            <p className="text-[10px] text-[#52525B] mt-0.5">Start a conversation to spin code.</p>
          </div>
        ) : (
          <ul className="max-h-[38vh] space-y-1 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.id} className="group flex items-center gap-1">
                <NavLink
                  to={`/?c=${item.id}`}
                  className={({ isActive }) =>
                    `min-w-0 flex-1 truncate rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                      isActive
                        ? "bg-[#25151A] text-white font-medium border border-[#E62429]/40 shadow-[0_0_10px_rgba(230,36,41,0.2)]"
                        : "text-[#D4D4D8] hover:bg-[#1A151D] hover:text-white"
                    }`
                  }
                  title={item.title}
                >
                  <span className="text-[#E62429] mr-1.5 font-bold">›</span>
                  {item.title}
                </NavLink>
                <button
                  type="button"
                  className="rounded p-1 text-xs text-[#71717A] opacity-0 transition-opacity hover:bg-red-950/50 hover:text-red-300 group-hover:opacity-100"
                  onClick={() => remove(item.id)}
                  aria-label="Delete conversation"
                  title="Delete thread"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Spider-Man Suit Status Footer */}
      <div className="rounded-xl border border-[#2B161B] bg-[#0C0C12] p-2.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#E62429] spider-pulse" />
          <span className="text-[11px] font-medium text-[#D4D4D8]">Spider AI Online</span>
        </div>
        <p className="mt-1 text-[10px] text-[#71717A]">AST Static Analyzer Active</p>
      </div>
    </aside>
  );
}

export function refreshConversations() {
  window.dispatchEvent(new Event("codemate:conversations"));
}

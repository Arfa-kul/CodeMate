import { NavLink, Outlet, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import SetupBanner from "./components/SetupBanner.jsx";
import { SpiderLogo, WebIcon } from "./components/SpiderIcons.jsx";
import { useHealth } from "./hooks/useHealth.js";
import ChatPage from "./pages/ChatPage.jsx";
import GeneratePage from "./pages/GeneratePage.jsx";
import DebuggerPage from "./pages/DebuggerPage.jsx";
import ExplainerPage from "./pages/ExplainerPage.jsx";
import RefactorPage from "./pages/RefactorPage.jsx";
import TestsPage from "./pages/TestsPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

const NAV = [
  { to: "/", label: "Chat" },
  { to: "/generate", label: "Generate" },
  { to: "/debug", label: "Debugger" },
  { to: "/explain", label: "Explainer" },
  { to: "/refactor", label: "Refactor" },
  { to: "/tests", label: "Unit tests" },
  { to: "/review", label: "Review" },
  { to: "/settings", label: "Settings" },
];

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ChatPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/debug" element={<DebuggerPage />} />
        <Route path="/explain" element={<ExplainerPage />} />
        <Route path="/refactor" element={<RefactorPage />} />
        <Route path="/tests" element={<TestsPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function Layout() {
  const health = useHealth();

  return (
    <div className="min-h-screen bg-[#09090D] text-[#F5F5F7] spider-web-bg antialiased selection:bg-[#E62429]/30 selection:text-white">
      {/* Top Futuristic Spider AI Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#2B161B] bg-[#09090D]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E62429]/40 bg-[#16121A] shadow-[0_0_12px_rgba(230,36,41,0.25)]">
              <SpiderLogo className="h-5 w-5 text-[#E62429]" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#FF3B45] spider-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm font-bold tracking-wider text-white">
                  WEB <span className="text-[#E62429]">AI</span>
                </span>
                <span className="rounded bg-[#E62429]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#FF3B45] border border-[#E62429]/30">
                  SUIT OS
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] hidden sm:block">
                Your Friendly Neighborhood Coding Assistant
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `group relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#E62429] to-[#B3181C] text-white shadow-[0_0_12px_rgba(230,36,41,0.45)]"
                      : "text-[#A1A1AA] hover:bg-[#1A151D] hover:text-[#F5F5F7] border border-transparent hover:border-[#381B20]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <StatusPill health={health} />
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[270px_1fr]">
        <Sidebar />
        <main className="min-w-0">
          <SetupBanner health={health} />
          
          {/* Mobile Navigation Bar */}
          <div className="mb-3 flex flex-wrap gap-1.5 md:hidden">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#E62429] text-white shadow-[0_0_10px_rgba(230,36,41,0.5)]"
                      : "bg-[#15151D] text-[#A1A1AA] border border-[#2B161B]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <Outlet context={{ health }} />
        </main>
      </div>
    </div>
  );
}

function StatusPill({ health }) {
  if (health.loading) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[#2A181C] bg-[#15151D] px-3 py-1 text-xs text-[#A1A1AA]">
        <span className="h-2 w-2 rounded-full bg-slate-500 animate-pulse" />
        <span>Syncing Suit AI…</span>
      </div>
    );
  }
  if (health.error) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-red-900/60 bg-red-950/40 px-3 py-1 text-xs text-red-300">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span>Suit Offline</span>
      </div>
    );
  }
  if (health.data?.llm_configured) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-emerald-900/50 bg-[#0E1A14] px-3 py-1 text-xs text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
        <span className="h-2 w-2 rounded-full bg-emerald-400 spider-pulse" />
        <span className="font-mono text-[11px] truncate max-w-[140px] sm:max-w-none">
          Model: {health.data.model}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#3D1E22] bg-[#1C1417] px-3 py-1 text-xs text-[#FFA4A8]">
      <span className="h-2 w-2 rounded-full bg-[#FF3B45] spider-pulse" />
      <span>Local AST Web Mode</span>
    </div>
  );
}

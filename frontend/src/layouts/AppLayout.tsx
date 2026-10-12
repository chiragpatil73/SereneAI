import { Link, NavLink, Outlet } from "react-router-dom";
import { BarChart3, Home, MessageCircle, Settings, ShieldCheck, Sparkles, Wind } from "lucide-react";
import { Logo } from "../components/Logo";
import { cn } from "../utils/cn";

const NAV_ITEMS = [
  { to: "/app", label: "Home", icon: Home, end: true },
  { to: "/app/chat", label: "Chat", icon: MessageCircle },
  { to: "/app/mood", label: "Mood Tracker", icon: Sparkles },
  { to: "/app/grounding", label: "Grounding", icon: Wind },
  { to: "/app/history", label: "History", icon: BarChart3 },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  return (
    <div className="min-h-screen flex bg-[var(--color-cream)]" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-r border-[var(--color-navy)]/8 px-5 py-6">
        <Logo className="px-1" />
        <nav className="mt-8 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-ring",
                  isActive ? "bg-[var(--color-navy)] text-[var(--color-cream)]" : "text-[var(--color-navy)]/70 hover:bg-[var(--color-mint)]/60"
                )
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-6">
          <p className="text-sm font-display text-[var(--color-navy)]/50 leading-snug">
            Small steps lead to calmer days.
          </p>
          <Link
            to="/responsible-ai"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-navy)]/45 hover:text-[var(--color-teal-deep)] focus-ring rounded"
          >
            <ShieldCheck size={13} />
            Responsible AI
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 min-h-0 flex flex-col">
          <Outlet />
        </main>

        <nav
          className="md:hidden flex items-center justify-around border-t border-[var(--color-navy)]/8 bg-white/90 backdrop-blur px-1 py-1.5 sticky bottom-0"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 6px)" }}
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium focus-ring",
                  isActive ? "text-[var(--color-teal-deep)]" : "text-[var(--color-navy)]/50"
                )
              }
            >
              <Icon size={19} />
              {label.split(" ")[0]}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store/themeStore";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useThemeStore();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-amber-300 transition hover:-translate-y-0.5 hover:border-orange-400/50 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${className}`}
    >
      {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}

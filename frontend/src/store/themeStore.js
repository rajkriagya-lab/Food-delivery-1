import { create } from "zustand";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem("khaana-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

const applyTheme = (theme) => {
  if (typeof document !== "undefined") document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem("khaana-theme", theme);
  } catch {
    // The in-memory preference still applies when storage is unavailable.
  }
};

const initialTheme = getInitialTheme();
if (typeof document !== "undefined") applyTheme(initialTheme);

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  toggleTheme: () => set((state) => {
    const theme = state.theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    return { theme };
  }),
}));

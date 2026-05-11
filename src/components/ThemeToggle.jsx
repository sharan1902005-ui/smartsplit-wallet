import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed top-6 right-6 z-50 bg-white dark:bg-slate-800 shadow-xl border border-red-100 dark:border-slate-700 rounded-full p-4 transition"
    >
      {darkMode ? (
        <Sun className="text-yellow-400" />
      ) : (
        <Moon className="text-slate-700" />
      )}
    </button>
  );
}

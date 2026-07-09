import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setDarkMode(!darkMode)}
      aria-label="Toggle dark mode"
      className={`w-11 h-11 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] shadow flex items-center justify-center shrink-0 transition hover:border-[#B23A2E] ${className}`}
    >
      {darkMode ? (
        <Sun size={18} className="text-[#D9A441]" />
      ) : (
        <Moon size={18} className="text-[#24322E] dark:text-[#EFE7D6]" />
      )}
    </button>
  );
}


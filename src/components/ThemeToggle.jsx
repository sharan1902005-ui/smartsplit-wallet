import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed top-6 right-6 z-50 bg-[#F8F4EA] dark:bg-[#221F1A] shadow-xl border border-[#C7B98F] dark:border-[#3a352b] rounded-full p-4 transition"
    >
      {darkMode ? (
        <Sun className="text-[#D9A441]" />
      ) : (
        <Moon className="text-[#24322E]" />
      )}
    </button>
  );
}


/**
 * @file use-theme.tsx
 * @description 테마 관리 커스텀 훅
 *
 * 테마 상태를 관리하고 변경하는 React 훅입니다.
 * ThemeProvider와 함께 사용됩니다.
 *
 * @dependencies
 * - lib/utils/theme: 테마 관리 유틸리티 함수
 * - react: useState, useEffect, createContext, useContext
 */

"use client";

import { useState, useEffect, createContext, useContext } from "react";
import {
  getTheme,
  setTheme as setThemeUtil,
  type Theme,
} from "@/lib/utils/theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // 초기 테마 로드
  useEffect(() => {
    setMounted(true);
    const storedTheme = getTheme();
    setThemeState(storedTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setThemeUtil(newTheme);
  };

  const resolvedTheme =
    theme === "system"
      ? typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}



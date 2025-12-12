/**
 * @file theme-provider.tsx
 * @description 테마 Provider 컴포넌트
 *
 * 테마 상태를 관리하고, 초기 테마를 로드하며,
 * 시스템 테마 변경을 감지하는 Provider 컴포넌트입니다.
 *
 * @dependencies
 * - lib/hooks/use-theme: 테마 관리 훅 및 Provider
 */

"use client";

import { ThemeProvider as BaseThemeProvider } from "@/lib/hooks/use-theme";
import { useEffect } from "react";
import { applyTheme, watchSystemTheme, getTheme } from "@/lib/utils/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // 초기 테마 적용
  useEffect(() => {
    const storedTheme = getTheme();
    applyTheme(storedTheme);
  }, []);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const cleanup = watchSystemTheme(() => {
      const currentTheme = getTheme();
      if (currentTheme === "system") {
        applyTheme("system");
      }
    });

    return cleanup;
  }, []);

  return <BaseThemeProvider>{children}</BaseThemeProvider>;
}


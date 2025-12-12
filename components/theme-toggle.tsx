/**
 * @file theme-toggle.tsx
 * @description 테마 전환 버튼 컴포넌트
 *
 * 사용자가 라이트/다크/시스템 모드를 전환할 수 있는 드롭다운 버튼입니다.
 *
 * @dependencies
 * - @radix-ui/react-dropdown-menu: 드롭다운 메뉴
 * - lucide-react: 아이콘 (Moon, Sun, Monitor)
 * - lib/utils/theme: 테마 관리 유틸리티
 * - components/ui/dropdown-menu: shadcn/ui 드롭다운 메뉴 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/lib/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  
  // useTheme는 항상 호출해야 함 (React Hooks 규칙)
  let theme: "light" | "dark" | "system" = "system";
  let setTheme: ((theme: "light" | "dark" | "system") => void) | null = null;

  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    setTheme = themeContext.setTheme;
  } catch (error) {
    // ThemeProvider가 없는 경우 (서버 사이드 렌더링 등)
    // 기본값 사용
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // 서버 사이드에서는 렌더링하지 않음
  if (!mounted || !setTheme) {
    return <div className="h-9 w-9" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="테마 전환"
        >
          {theme === "light" ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : theme === "dark" ? (
            <Moon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Monitor className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="sr-only">테마 전환</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>라이트</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>다크</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>시스템</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


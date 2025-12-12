/**
 * @file theme.ts
 * @description 테마 관리 유틸리티 함수
 *
 * 다크 모드/라이트 모드 전환을 위한 유틸리티 함수들입니다.
 * localStorage를 사용하여 사용자의 테마 설정을 저장하고,
 * 시스템 테마를 감지하여 자동으로 적용할 수 있습니다.
 */

export type Theme = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "theme";
const THEME_ATTRIBUTE = "data-theme";

/**
 * localStorage에서 테마 설정 읽기
 * @returns 저장된 테마 설정 또는 "system"
 */
export function getTheme(): Theme {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  return stored || "system";
}

/**
 * 테마 설정 및 저장
 * @param theme 설정할 테마 ("light" | "dark" | "system")
 */
export function setTheme(theme: Theme): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

/**
 * HTML 요소에 테마 클래스 적용
 * @param theme 적용할 테마 ("light" | "dark" | "system")
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === "undefined") {
    return;
  }

  const root = document.documentElement;
  const resolvedTheme = resolveTheme(theme);

  // data-theme 속성 설정 (선택 사항, 접근성 향상)
  root.setAttribute(THEME_ATTRIBUTE, resolvedTheme);

  // dark 클래스 추가/제거
  if (resolvedTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/**
 * 테마를 실제 적용 가능한 테마로 변환 (system → light/dark)
 * @param theme 변환할 테마
 * @returns 실제 적용할 테마 ("light" | "dark")
 */
export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

/**
 * 시스템 테마 감지
 * @returns 시스템 테마 ("light" | "dark")
 */
export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * 시스템 테마 변경 감지 리스너 등록
 * @param callback 테마 변경 시 호출할 콜백 함수
 * @returns 리스너 제거 함수
 */
export function watchSystemTheme(
  callback: (theme: "light" | "dark") => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? "dark" : "light");
  };

  // 최신 브라우저는 addEventListener 사용
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  } else {
    // 구형 브라우저는 addListener 사용 (deprecated)
    mediaQuery.addListener(handleChange);
    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }
}


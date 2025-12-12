/**
 * @file error-logger.ts
 * @description 에러 로깅 API
 *
 * 프로덕션 환경에서 발생하는 에러를 Supabase에 저장하는 API 함수입니다.
 * 클라이언트 사이드에서 API Route를 통해 호출합니다.
 */

export interface ErrorLogData {
  user_id?: string;
  error_message: string;
  error_stack?: string;
  error_code?: string;
  page_url?: string;
  browser_info?: string;
  user_agent?: string;
}

/**
 * 에러를 Supabase에 저장 (API Route 사용)
 * @param errorData 에러 정보
 * @returns 저장 성공 여부
 */
export async function logErrorToSupabase(
  errorData: ErrorLogData
): Promise<boolean> {
  try {
    const response = await fetch("/api/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Error Logger] API 호출 실패:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Error Logger] 에러 로깅 실패:", error);
    return false;
  }
}

/**
 * 브라우저 정보 수집
 * @returns 브라우저 정보 객체
 */
export function getBrowserInfo(): {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution?: string;
  viewportSize?: string;
} {
  if (typeof window === "undefined") {
    return {
      userAgent: "unknown",
      language: "unknown",
      platform: "unknown",
    };
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
  };
}


/**
 * @file error-handler.ts
 * @description 에러 처리 유틸리티 함수
 *
 * 애플리케이션 전역에서 사용하는 에러 처리 유틸리티 함수들을 제공합니다.
 * API 에러 생성, 에러 메시지 변환, 재시도 가능 여부 판단, 에러 로깅 등을 처리합니다.
 *
 * @dependencies
 * - lib/types/error.ts: ApiError, ErrorCode 타입
 */

import type { ApiError, ErrorCode, ErrorResponse } from "@/lib/types/error";
import { ERROR_CODES } from "@/lib/types/error";

/**
 * API 에러 객체 생성
 * @param code 에러 코드
 * @param message 사용자 친화적인 에러 메시지
 * @param originalError 원본 에러 객체
 * @param statusCode HTTP 상태 코드
 * @param details 추가 에러 정보
 */
export function createApiError(
  code: ErrorCode,
  message: string,
  originalError?: unknown,
  statusCode?: number,
  details?: Record<string, unknown>
): ApiError {
  return {
    code,
    message,
    statusCode,
    originalError: process.env.NODE_ENV === "development" ? originalError : undefined,
    details,
  };
}

/**
 * 에러 타입에 따른 사용자 친화적인 메시지 반환
 * @param error 에러 객체 (Error, ApiError, 또는 unknown)
 */
export function getErrorMessage(error: unknown): string {
  // ApiError 타입인 경우
  if (error && typeof error === "object" && "message" in error) {
    const apiError = error as ApiError;
    if (apiError.message) {
      return apiError.message;
    }
  }

  // Error 인스턴스인 경우
  if (error instanceof Error) {
    return error.message;
  }

  // 문자열인 경우
  if (typeof error === "string") {
    return error;
  }

  // 알 수 없는 에러
  return "알 수 없는 오류가 발생했습니다.";
}

/**
 * 에러 코드 추출
 * @param error 에러 객체
 */
export function getErrorCode(error: unknown): ErrorCode {
  // ApiError 타입인 경우
  if (error && typeof error === "object" && "code" in error) {
    const apiError = error as ApiError;
    if (apiError.code) {
      return apiError.code;
    }
  }

  // Error 인스턴스인 경우 메시지로 판단
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("timeout") || message.includes("시간 초과")) {
      return ERROR_CODES.TIMEOUT_ERROR;
    }
    if (message.includes("network") || message.includes("네트워크")) {
      return ERROR_CODES.NETWORK_ERROR;
    }
    if (message.includes("unauthorized") || message.includes("인증")) {
      return ERROR_CODES.UNAUTHORIZED;
    }
    if (message.includes("not found") || message.includes("찾을 수 없음")) {
      return ERROR_CODES.NOT_FOUND;
    }
    if (message.includes("validation") || message.includes("유효성")) {
      return ERROR_CODES.VALIDATION_ERROR;
    }
    if (message.includes("api") || message.includes("api")) {
      return ERROR_CODES.API_ERROR;
    }
  }

  return ERROR_CODES.UNKNOWN_ERROR;
}

/**
 * 재시도 가능한 에러인지 판단
 * @param error 에러 객체
 */
export function isRetryableError(error: unknown): boolean {
  const code = getErrorCode(error);

  // 재시도 가능한 에러 코드
  const retryableCodes: ErrorCode[] = [
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.TIMEOUT_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
  ];

  return retryableCodes.includes(code);
}

/**
 * HTTP 상태 코드를 에러 코드로 변환
 * @param statusCode HTTP 상태 코드
 */
export function statusCodeToErrorCode(statusCode: number): ErrorCode {
  if (statusCode === 401) {
    return ERROR_CODES.UNAUTHORIZED;
  }
  if (statusCode === 404) {
    return ERROR_CODES.NOT_FOUND;
  }
  if (statusCode >= 400 && statusCode < 500) {
    return ERROR_CODES.VALIDATION_ERROR;
  }
  if (statusCode >= 500) {
    return ERROR_CODES.INTERNAL_ERROR;
  }
  return ERROR_CODES.API_ERROR;
}

/**
 * 에러 로깅
 * @param error 에러 객체
 * @param context 에러 발생 컨텍스트 (파일명, 함수명 등)
 */
export function logError(error: unknown, context?: string): void {
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);
  const logContext = context ? `[${context}]` : "";

  // 개발 환경: 상세 정보 로깅
  if (process.env.NODE_ENV === "development") {
    console.error(`${logContext} 에러 발생:`, {
      code: errorCode,
      message: errorMessage,
      error: error instanceof Error ? error.stack : error,
    });
  } else {
    // 프로덕션 환경: 간단한 로깅
    console.error(`${logContext} ${errorCode}: ${errorMessage}`);
    
    // 프로덕션 환경에서 Supabase로 에러 전송 (비동기, 에러 발생해도 앱 동작에 영향 없음)
    if (typeof window !== "undefined") {
      // 클라이언트 사이드에서만 실행
      import("@/lib/api/error-logger").then(({ logErrorToSupabase, getBrowserInfo }) => {
        const browserInfo = getBrowserInfo();
        logErrorToSupabase({
          error_message: errorMessage,
          error_stack: error instanceof Error ? error.stack : undefined,
          error_code: errorCode,
          page_url: window.location.pathname + window.location.search,
          browser_info: JSON.stringify(browserInfo),
          user_agent: browserInfo.userAgent,
        }).catch((err) => {
          // 에러 로깅 실패는 무시 (무한 루프 방지)
          console.warn("[Error Handler] 에러 로깅 실패:", err);
        });
      }).catch(() => {
        // 모듈 로드 실패는 무시
      });
    }
  }
}

/**
 * ErrorResponse 객체 생성 (API Route에서 사용)
 * @param error 에러 객체
 * @param statusCode HTTP 상태 코드
 */
export function createErrorResponse(
  error: unknown,
  statusCode = 500
): ErrorResponse {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);

  const response: ErrorResponse = {
    error: message,
    code,
    statusCode,
  };

  // 개발 환경에서만 상세 정보 추가
  if (process.env.NODE_ENV === "development" && error) {
    response.details = {
      originalError:
        error instanceof Error ? error.message : String(error),
    };
  }

  return response;
}


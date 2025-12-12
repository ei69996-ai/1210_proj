/**
 * @file error.ts
 * @description 에러 타입 정의
 *
 * 애플리케이션 전역에서 사용하는 에러 타입을 정의합니다.
 * API 에러, 네트워크 에러, 타임아웃 에러 등을 일관되게 처리하기 위한 타입입니다.
 */

/**
 * 에러 코드 상수
 */
export const ERROR_CODES = {
  API_ERROR: "API_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * API 에러 인터페이스
 */
export interface ApiError {
  /**
   * 에러 코드
   */
  code: ErrorCode;
  /**
   * 사용자 친화적인 에러 메시지
   */
  message: string;
  /**
   * HTTP 상태 코드 (있는 경우)
   */
  statusCode?: number;
  /**
   * 원본 에러 객체 (개발 환경에서만 사용)
   */
  originalError?: unknown;
  /**
   * 추가 에러 정보
   */
  details?: Record<string, unknown>;
}

/**
 * 에러 응답 인터페이스 (API Route에서 사용)
 */
export interface ErrorResponse {
  error: string;
  code?: ErrorCode;
  statusCode?: number;
  details?: Record<string, unknown>;
}



/**
 * @file error.tsx
 * @description 라우트 에러 바운더리
 *
 * Next.js 15의 에러 바운더리 패턴을 사용하여 라우트 세그먼트에서 발생하는 에러를 처리합니다.
 * 이 컴포넌트는 자동으로 해당 라우트 세그먼트의 에러를 캐치합니다.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage, getErrorCode, logError } from "@/lib/utils/error-handler";
import { ERROR_CODES } from "@/lib/types/error";

interface ErrorProps {
  /**
   * 발생한 에러 객체
   */
  error: Error & { digest?: string };
  /**
   * 에러 상태를 초기화하는 함수
   */
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);

  // 개발 환경에서만 에러 로깅
  useEffect(() => {
    logError(error, "ErrorBoundary");
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* 에러 아이콘 */}
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>

        {/* 에러 메시지 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">오류가 발생했습니다</h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>

        {/* 개발 환경에서만 상세 정보 표시 */}
        {process.env.NODE_ENV === "development" && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-left">
            <p className="text-xs font-mono text-destructive">
              <strong>에러 코드:</strong> {errorCode}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-destructive mt-2">
                <strong>Digest:</strong> {error.digest}
              </p>
            )}
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer text-destructive">
                  스택 트레이스 보기
                </summary>
                <pre className="mt-2 text-xs overflow-auto max-h-48">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>

        {/* 도움말 */}
        <p className="text-xs text-muted-foreground">
          문제가 계속되면 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
        </p>
      </div>
    </div>
  );
}



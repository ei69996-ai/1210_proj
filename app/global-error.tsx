/**
 * @file global-error.tsx
 * @description 글로벌 에러 바운더리
 *
 * Next.js 15의 글로벌 에러 바운더리 패턴을 사용하여 루트 레이아웃에서 발생하는 에러를 처리합니다.
 * 이 컴포넌트는 루트 레이아웃의 에러만 처리하며, html, head, body 태그를 포함한 완전한 HTML 구조를 제공합니다.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { getErrorMessage, getErrorCode, logError } from "@/lib/utils/error-handler";

interface GlobalErrorProps {
  /**
   * 발생한 에러 객체
   */
  error: Error & { digest?: string };
  /**
   * 에러 상태를 초기화하는 함수
   */
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const router = useRouter();
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);

  // 에러 로깅
  useEffect(() => {
    logError(error, "GlobalErrorBoundary");
  }, [error]);

  // 홈으로 이동
  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>오류가 발생했습니다 - My Trip</title>
      </head>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-background">
          <div className="max-w-md w-full space-y-6 text-center">
            {/* 에러 아이콘 */}
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>

            {/* 에러 메시지 */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">심각한 오류가 발생했습니다</h1>
              <p className="text-sm text-muted-foreground">
                애플리케이션을 초기화하는 중 오류가 발생했습니다.
              </p>
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
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </button>
              <button
                onClick={handleGoHome}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Home className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </button>
            </div>

            {/* 도움말 */}
            <p className="text-xs text-muted-foreground">
              문제가 계속되면 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>

        {/* 기본 스타일 (Tailwind CSS가 로드되지 않은 경우를 대비) */}
        <style jsx global>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              "Helvetica Neue", Arial, sans-serif;
            line-height: 1.5;
            color: #333;
          }
        `}</style>
      </body>
    </html>
  );
}


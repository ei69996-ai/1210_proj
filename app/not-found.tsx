/**
 * @file not-found.tsx
 * @description 404 페이지 (페이지를 찾을 수 없음)
 *
 * Next.js 15의 not-found.tsx 파일을 사용하여 존재하지 않는 페이지에 대한 404 에러를 처리합니다.
 * 이 컴포넌트는 자동으로 404 상태 코드를 반환합니다.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "404 - 페이지를 찾을 수 없습니다 | My Trip",
  description: "요청하신 페이지가 존재하지 않습니다. 홈으로 돌아가서 다시 시도해주세요.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main
      role="main"
      aria-labelledby="not-found-heading"
      className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-16 md:px-6 md:py-20"
    >
      <div className="max-w-md w-full space-y-6 text-center">
        {/* 404 아이콘 */}
        <div className="flex justify-center" aria-hidden="true">
          <FileQuestion
            className="h-16 w-16 md:h-20 md:w-20 text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        {/* 404 메시지 */}
        <div className="space-y-2">
          <h1
            id="not-found-heading"
            className="text-2xl md:text-3xl font-bold"
          >
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        {/* 404 상태 코드 표시 */}
        <div
          className="rounded-lg border border-muted bg-muted/50 p-4"
          role="status"
          aria-label="404 상태 코드"
        >
          <p className="text-xs font-mono text-muted-foreground">
            <strong>상태 코드:</strong> 404
          </p>
        </div>

        {/* 액션 버튼 */}
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          role="group"
          aria-label="페이지 네비게이션"
        >
          <Button
            asChild
            variant="default"
            size="lg"
            className="min-h-[44px] sm:min-h-[40px]"
          >
            <Link
              href="/"
              aria-label="홈으로 돌아가기"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            >
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>

        {/* 도움말 */}
        <p className="text-xs md:text-sm text-muted-foreground">
          URL을 확인하거나 홈으로 돌아가서 원하시는 페이지를 찾아보세요.
        </p>
      </div>
    </main>
  );
}


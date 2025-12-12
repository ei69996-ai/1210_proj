/**
 * @file offline/page.tsx
 * @description 오프라인 페이지
 *
 * 네트워크 연결이 없을 때 표시되는 오프라인 페이지입니다.
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff, Home, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <WifiOff className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold">오프라인 상태</h1>
        <p className="mb-8 text-muted-foreground">
          네트워크 연결이 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => {
              window.location.reload();
            }}
            className="min-h-[44px] sm:min-h-[40px]"
            aria-label="페이지 새로고침"
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            다시 시도
          </Button>
          <Button
            asChild
            variant="outline"
            className="min-h-[44px] sm:min-h-[40px]"
            aria-label="홈으로 이동"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              홈으로
            </Link>
          </Button>
        </div>

        <div className="mt-8 rounded-lg border bg-muted/30 p-4 text-left">
          <h2 className="mb-2 text-sm font-semibold">오프라인에서도 사용 가능한 기능:</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• 캐시된 관광지 목록 보기</li>
            <li>• 캐시된 북마크 보기</li>
            <li>• 이전에 본 페이지 보기</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


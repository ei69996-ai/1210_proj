/**
 * @file offline-indicator.tsx
 * @description 오프라인 상태 표시 배너
 *
 * 오프라인 상태일 때 상단에 표시되는 배너 컴포넌트입니다.
 */

"use client";

import { useEffect, useState } from "react";
import { WifiOff, X } from "lucide-react";
import { watchOfflineStatus } from "@/lib/utils/offline-handler";
import { Button } from "@/components/ui/button";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 초기 상태 확인
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      setIsVisible(!navigator.onLine);
    }

    // 오프라인/온라인 상태 감지
    const cleanup = watchOfflineStatus(
      () => {
        setIsOffline(true);
        setIsVisible(true);
      },
      () => {
        setIsOffline(false);
        // 온라인 상태로 전환되면 3초 후 배너 숨김
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    );

    return cleanup;
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-yellow-500 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 px-4 py-3 shadow-md transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-2">
          <WifiOff className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">
            {isOffline
              ? "오프라인 모드입니다. 일부 기능이 제한될 수 있습니다."
              : "온라인 상태로 복구되었습니다."}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-8 w-8 p-0 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-600 dark:hover:bg-yellow-700"
          aria-label="배너 닫기"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}


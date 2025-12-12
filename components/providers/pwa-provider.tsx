/**
 * @file pwa-provider.tsx
 * @description PWA Provider 컴포넌트
 *
 * Service Worker를 등록하고 업데이트를 감지하는 Provider 컴포넌트입니다.
 *
 * @dependencies
 * - lib/utils/service-worker: Service Worker 등록 유틸리티
 */

"use client";

import { useEffect, useState } from "react";
import { registerServiceWorker, checkForUpdate } from "@/lib/utils/service-worker";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Service Worker 등록
    registerServiceWorker().then((success) => {
      setIsRegistered(success);
    });

    // 주기적으로 업데이트 확인 (1시간마다)
    const updateInterval = setInterval(() => {
      checkForUpdate();
    }, 60 * 60 * 1000); // 1시간

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  // Service Worker 업데이트 감지
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleControllerChange = () => {
      console.log("[PWA Provider] Service Worker가 업데이트되었습니다.");
      // 필요시 페이지 새로고침 또는 사용자에게 알림
      // window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  return <>{children}</>;
}


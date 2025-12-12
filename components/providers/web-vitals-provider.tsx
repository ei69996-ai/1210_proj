/**
 * @file web-vitals-provider.tsx
 * @description Web Vitals Provider 컴포넌트
 *
 * Web Vitals를 측정하고 로깅하는 Provider 컴포넌트입니다.
 *
 * @dependencies
 * - lib/utils/web-vitals: Web Vitals 측정 유틸리티
 */

"use client";

import { useEffect } from "react";
import { reportWebVitals, logWebVitals, sendWebVitalsToAnalytics } from "@/lib/utils/web-vitals";

export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 개발 환경: 콘솔 로깅
    if (process.env.NODE_ENV === "development") {
      reportWebVitals(logWebVitals);
    } else {
      // 프로덕션 환경: Analytics 전송
      reportWebVitals(sendWebVitalsToAnalytics);
    }
  }, []);

  return <>{children}</>;
}


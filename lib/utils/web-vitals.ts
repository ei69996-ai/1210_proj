/**
 * @file web-vitals.ts
 * @description Web Vitals 측정 유틸리티
 *
 * Core Web Vitals 및 추가 성능 메트릭을 측정하고 로깅하는 유틸리티입니다.
 *
 * @dependencies
 * - web-vitals: Web Vitals 측정 라이브러리
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from "web-vitals";

/**
 * Web Vitals 메트릭 타입
 */
export type WebVitalsMetric = Metric;

/**
 * Web Vitals 콜백 함수 타입
 */
export type WebVitalsCallback = (metric: WebVitalsMetric) => void;

/**
 * Web Vitals 측정 시작
 * @param onPerfEntry 성능 메트릭 수신 콜백 함수
 */
export function reportWebVitals(onPerfEntry?: WebVitalsCallback): void {
  if (!onPerfEntry || typeof onPerfEntry !== "function") {
    return;
  }

  // Core Web Vitals
  onCLS(onPerfEntry); // Cumulative Layout Shift
  // onFID는 deprecated되었고 web-vitals 패키지에서 제거됨 (INP 사용 권장)
  onINP(onPerfEntry); // Interaction to Next Paint
  onLCP(onPerfEntry); // Largest Contentful Paint

  // 추가 메트릭
  onFCP(onPerfEntry); // First Contentful Paint
  onTTFB(onPerfEntry); // Time to First Byte
}

/**
 * Web Vitals 메트릭을 콘솔에 로깅 (개발 환경)
 * @param metric Web Vitals 메트릭
 */
export function logWebVitals(metric: WebVitalsMetric): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    });
  }
}

/**
 * Web Vitals 메트릭을 Supabase에 전송 (프로덕션 환경)
 * @param metric Web Vitals 메트릭
 */
export async function sendWebVitalsToAnalytics(metric: WebVitalsMetric): Promise<void> {
  // 프로덕션 환경에서만 실행
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  try {
    // 향후 Supabase analytics 테이블에 저장할 수 있음
    // 현재는 콘솔에만 로깅
    console.log(`[Web Vitals Analytics] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    });

    // TODO: Supabase analytics API 호출
    // await fetch('/api/analytics/web-vitals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     name: metric.name,
    //     value: metric.value,
    //     rating: metric.rating,
    //     delta: metric.delta,
    //     id: metric.id,
    //     navigationType: metric.navigationType,
    //     page: window.location.pathname,
    //     timestamp: new Date().toISOString(),
    //   }),
    // });
  } catch (error) {
    console.error("[Web Vitals] Analytics 전송 실패:", error);
  }
}


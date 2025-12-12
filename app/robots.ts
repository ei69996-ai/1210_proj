/**
 * @file robots.ts
 * @description 검색 엔진 크롤링 규칙 설정
 *
 * Next.js 15의 robots.ts 파일을 사용하여 robots.txt를 동적으로 생성합니다.
 * 검색 엔진이 사이트를 크롤링할 때 따라야 할 규칙을 정의합니다.
 */

import { MetadataRoute } from "next";

/**
 * 기본 URL 생성 (환경변수 기반)
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Robots.txt 생성
 * Next.js 15의 MetadataRoute.Robots 타입을 사용합니다.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/", // 홈페이지
          "/places/*", // 관광지 상세페이지
          "/stats", // 통계 대시보드
        ],
        disallow: [
          "/api/*", // API 라우트 (크롤링 불필요)
          "/bookmarks", // 인증 필요 페이지 (선택 사항: 크롤링 허용하려면 제거)
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    // API 부하를 고려하여 크롤링 딜레이 설정 (선택 사항)
    // crawlDelay: 1,
  };
}


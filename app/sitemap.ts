/**
 * @file sitemap.ts
 * @description 동적 Sitemap 생성
 *
 * Next.js 15의 sitemap.ts 파일을 사용하여 동적 sitemap을 생성합니다.
 * 정적 페이지와 동적 페이지(관광지 상세페이지)를 포함합니다.
 *
 * 전략:
 * - 정적 페이지: 홈페이지, 통계 대시보드, 북마크 페이지
 * - 동적 페이지: 관광지 상세페이지 (각 타입별 최신 관광지 100개씩 샘플링)
 * - 성능 최적화: 병렬 API 호출, 캐싱 (revalidate: 86400 = 1일)
 */

import { MetadataRoute } from "next";
import { getAreaBasedList } from "@/lib/api/tour-api";
import { TOUR_TYPE_MAP } from "@/lib/types/stats";
import type { TourItem } from "@/lib/types/tour";

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
 * 날짜 문자열을 Date 객체로 변환
 * API 응답 형식: YYYYMMDDHHmmss (예: "20240101120000")
 */
function parseModifiedTime(modifiedtime: string): Date {
  if (!modifiedtime || modifiedtime.length !== 14) {
    return new Date();
  }

  const year = parseInt(modifiedtime.substring(0, 4), 10);
  const month = parseInt(modifiedtime.substring(4, 6), 10) - 1; // 월은 0부터 시작
  const day = parseInt(modifiedtime.substring(6, 8), 10);
  const hour = parseInt(modifiedtime.substring(8, 10), 10);
  const minute = parseInt(modifiedtime.substring(10, 12), 10);
  const second = parseInt(modifiedtime.substring(12, 14), 10);

  return new Date(year, month, day, hour, minute, second);
}

/**
 * 관광지 상세페이지 URL 목록 생성
 * 각 타입별로 최신 관광지 100개씩 샘플링
 */
async function generatePlaceUrls(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const placeUrls: MetadataRoute.Sitemap = [];

  // 각 관광 타입별로 최신 관광지 조회 (병렬 처리)
  const typeIds = Object.keys(TOUR_TYPE_MAP);
  const promises = typeIds.map(async (typeId) => {
    try {
      // 각 타입별로 최신 관광지 100개 조회
      const result = await getAreaBasedList(undefined, typeId, 100, 1);
      const items = result.items || [];

      return items.map((item: TourItem) => ({
        url: `${baseUrl}/places/${item.contentid}`,
        lastModified: parseModifiedTime(item.modifiedtime || ""),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    } catch (error) {
      // 일부 타입 조회 실패해도 나머지 타입은 계속 처리
      console.warn(`관광 타입 ${typeId} 조회 실패:`, error);
      return [];
    }
  });

  // 모든 타입의 결과를 병렬로 처리
  const results = await Promise.all(promises);

  // 결과를 평탄화하여 placeUrls에 추가
  results.forEach((urls) => {
    placeUrls.push(...urls);
  });

  return placeUrls;
}

/**
 * Sitemap 생성
 * Next.js 15의 MetadataRoute.Sitemap 타입을 사용합니다.
 * revalidate 옵션으로 1일마다 재생성됩니다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/stats`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bookmarks`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 동적 페이지 (관광지 상세페이지)
  let placeUrls: MetadataRoute.Sitemap = [];
  try {
    placeUrls = await generatePlaceUrls();
  } catch (error) {
    // 관광지 목록 조회 실패 시 정적 페이지만 반환
    console.error("관광지 목록 조회 실패:", error);
  }

  // 정적 페이지와 동적 페이지 결합
  return [...staticPages, ...placeUrls];
}

// Next.js의 revalidate 옵션 설정 (1일마다 재생성)
export const revalidate = 86400; // 24시간 (초 단위)


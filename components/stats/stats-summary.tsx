/**
 * @file stats-summary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 통계 대시보드 페이지에서 전체 관광지 수, Top 3 지역, Top 3 타입,
 * 마지막 업데이트 시간을 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 전체 관광지 수 표시
 * 2. Top 3 지역 표시 (카드 형태)
 * 3. Top 3 타입 표시 (카드 형태)
 * 4. 마지막 업데이트 시간 표시
 * 5. 로딩 상태 (Skeleton UI)
 *
 * @dependencies
 * - lib/types/stats: StatsSummary, RegionStats, TypeStats 타입
 * - components/ui/skeleton: Skeleton 컴포넌트
 * - lucide-react: 아이콘
 */

import { Globe, MapPin, Award, Tag, Clock } from "lucide-react";
import type { StatsSummary, RegionStats, TypeStats } from "@/lib/types/stats";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsSummaryProps {
  summary: StatsSummary | null;
  isLoading?: boolean;
}

/**
 * 상대 시간 포맷팅 함수
 * @param date 날짜 객체
 * @returns 상대 시간 문자열 (예: "방금 전", "5분 전", "1시간 전")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "방금 전";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    // 7일 이상이면 절대 시간 표시
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

/**
 * 숫자 포맷팅 함수 (천 단위 구분)
 * @param num 숫자
 * @returns 포맷팅된 문자열 (예: "1,234,567")
 */
function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

/**
 * 통계 요약 카드 컴포넌트
 */
export function StatsSummary({ summary, isLoading = false }: StatsSummaryProps) {
  // 로딩 상태
  if (isLoading || !summary) {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        role="region"
        aria-label="통계 요약 카드 로딩 중"
        aria-busy="true"
      >
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 md:p-6 bg-card"
            role="status"
            aria-label="로딩 중"
          >
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-12 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  const { totalCount, topRegions, topTypes, lastUpdated } = summary;

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      role="region"
      aria-label="통계 요약"
    >
      {/* 전체 관광지 수 카드 */}
      <div
        className="border rounded-lg p-4 md:p-6 bg-card hover:shadow-md transition-shadow"
        role="article"
        aria-labelledby="total-count-label"
      >
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3
            id="total-count-label"
            className="text-sm font-medium text-muted-foreground"
          >
            전체 관광지
          </h3>
        </div>
        <p
          className="text-3xl md:text-4xl font-bold text-primary"
          aria-label={`전체 관광지 수: ${formatNumber(totalCount)}개`}
        >
          {formatNumber(totalCount)}
          <span className="text-lg md:text-xl text-muted-foreground ml-1">
            개
          </span>
        </p>
      </div>

      {/* Top 3 지역 카드 */}
      {topRegions.map((region: RegionStats, index: number) => (
        <div
          key={`region-${region.regionCode}`}
          className="border rounded-lg p-4 md:p-6 bg-card hover:shadow-md transition-shadow"
          role="article"
          aria-labelledby={`region-${index}-label`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <h3
              id={`region-${index}-label`}
              className="text-sm font-medium text-muted-foreground"
            >
              {index + 1}위 지역
            </h3>
          </div>
          <p
            className="text-xl md:text-2xl font-bold mb-1"
            aria-label={`${region.regionName}: ${formatNumber(region.count)}개`}
          >
            {region.regionName}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(region.count)}개
          </p>
        </div>
      ))}

      {/* Top 3 타입 카드 */}
      {topTypes.map((type: TypeStats, index: number) => (
        <div
          key={`type-${type.typeId}`}
          className="border rounded-lg p-4 md:p-6 bg-card hover:shadow-md transition-shadow"
          role="article"
          aria-labelledby={`type-${index}-label`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-5 w-5 text-blue-500" aria-hidden="true" />
            <h3
              id={`type-${index}-label`}
              className="text-sm font-medium text-muted-foreground"
            >
              {index + 1}위 타입
            </h3>
          </div>
          <p
            className="text-xl md:text-2xl font-bold mb-1"
            aria-label={`${type.typeName}: ${formatNumber(type.count)}개`}
          >
            {type.typeName}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(type.count)}개
          </p>
        </div>
      ))}

      {/* 마지막 업데이트 시간 카드 */}
      <div
        className="border rounded-lg p-4 md:p-6 bg-card hover:shadow-md transition-shadow"
        role="article"
        aria-labelledby="last-updated-label"
      >
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h3
            id="last-updated-label"
            className="text-sm font-medium text-muted-foreground"
          >
            마지막 업데이트
          </h3>
        </div>
        <p
          className="text-lg md:text-xl font-semibold"
          aria-label={`마지막 업데이트: ${formatRelativeTime(lastUpdated)}`}
        >
          {formatRelativeTime(lastUpdated)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {lastUpdated.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}


/**
 * @file page.tsx
 * @description 통계 대시보드 페이지
 *
 * My Trip 프로젝트의 통계 대시보드 페이지입니다.
 * 전국 관광지 현황을 차트와 통계로 시각화하여 표시합니다.
 *
 * 주요 기능:
 * 1. 통계 요약 카드 표시 (전체 관광지 수, Top 3 지역, Top 3 타입)
 * 2. 지역별 관광지 분포 차트 (Bar Chart)
 * 3. 관광 타입별 분포 차트 (Donut Chart)
 * 4. 반응형 레이아웃 (모바일 우선)
 * 5. 접근성 개선 (ARIA 라벨, 키보드 네비게이션)
 *
 * @dependencies
 * - next/metadata: Metadata API
 * - components/ui/error: Error 컴포넌트
 * - lib/types/stats: 통계 타입 정의
 */

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Error } from "@/components/ui/error";
import {
  getStatsSummary,
  getRegionStats,
  getTypeStats,
} from "@/lib/api/stats-api";
import { StatsSummary } from "@/components/stats/stats-summary";
import { Skeleton } from "@/components/ui/skeleton";

// 차트 컴포넌트 동적 로딩 (recharts 라이브러리 번들 크기 최적화)
const RegionChart = dynamic(() => import("@/components/stats/region-chart").then((mod) => ({ default: mod.RegionChart })), {
  loading: () => (
    <div className="w-full">
      <Skeleton className="h-[400px] w-full" />
    </div>
  ),
});

const TypeChart = dynamic(() => import("@/components/stats/type-chart").then((mod) => ({ default: mod.TypeChart })), {
  loading: () => (
    <div className="w-full">
      <Skeleton className="h-[400px] w-full" />
    </div>
  ),
});

export const metadata: Metadata = {
  title: "통계 대시보드 - My Trip",
  description: "전국 관광지 현황을 한눈에 확인하세요",
  openGraph: {
    title: "통계 대시보드 - My Trip",
    description: "전국 관광지 현황을 한눈에 확인하세요",
    type: "website",
  },
};

// 페이지 레벨 캐싱 설정
// 통계 데이터: 1시간 (변동이 적으므로)
export const revalidate = 3600; // 1시간

export default async function StatsPage() {
  let summary = null;
  let regionStats = null;
  let typeStats = null;
  let hasError = false;
  let errorMessage = "";
  let regionError = false;
  let regionErrorMessage = "";
  let typeError = false;
  let typeErrorMessage = "";

  try {
    // 통계 요약 데이터 조회
    summary = await getStatsSummary();
  } catch (error: unknown) {
    console.error("통계 요약 데이터 조회 실패:", error);
    hasError = true;
    errorMessage =
      error instanceof Error ? (error as Error).message : "알 수 없는 오류가 발생했습니다";
  }

  try {
    // 지역별 통계 데이터 조회
    regionStats = await getRegionStats();
  } catch (error: unknown) {
    console.error("지역별 통계 데이터 조회 실패:", error);
    regionError = true;
    regionErrorMessage =
      error instanceof Error ? (error as Error).message : "알 수 없는 오류가 발생했습니다";
  }

  try {
    // 타입별 통계 데이터 조회
    typeStats = await getTypeStats();
  } catch (error: unknown) {
    console.error("타입별 통계 데이터 조회 실패:", error);
    typeError = true;
    typeErrorMessage =
      error instanceof Error ? (error as Error).message : "알 수 없는 오류가 발생했습니다";
  }

  return (
    <main
      role="main"
      aria-label="통계 대시보드"
      className="flex-1"
    >
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        {/* 페이지 제목 섹션 */}
        <div className="mb-8 md:mb-10">
          <h1
            id="stats-heading"
            className="text-3xl md:text-4xl font-bold mb-2"
          >
            통계 대시보드
          </h1>
          <p className="text-muted-foreground">
            전국 관광지 현황을 한눈에 확인하세요
          </p>
        </div>

        {/* 섹션 컨테이너 */}
        <div className="space-y-8 md:space-y-10">
          {/* 통계 요약 카드 영역 */}
          <section
            id="stats-summary-section"
            role="region"
            aria-labelledby="summary-heading"
          >
            <h2
              id="summary-heading"
              className="text-2xl font-semibold mb-4"
            >
              요약 통계
            </h2>
            {hasError && !summary ? (
              <Error
                message={`통계 요약 데이터를 불러오는 중 오류가 발생했습니다: ${errorMessage}`}
                showRetry={false}
              />
            ) : (
              <StatsSummary summary={summary} isLoading={false} />
            )}
          </section>

            {/* 지역별 분포 차트 영역 */}
            <section
              id="region-chart-section"
              role="region"
              aria-labelledby="region-chart-heading"
            >
              <h2
                id="region-chart-heading"
                className="text-2xl font-semibold mb-4"
              >
                지역별 관광지 분포
              </h2>
              {regionError ? (
                <Error
                  message={`지역별 통계 데이터를 불러오는 중 오류가 발생했습니다: ${regionErrorMessage}`}
                  showRetry={false}
                />
              ) : (
                <RegionChart data={regionStats} isLoading={false} />
              )}
            </section>

            {/* 타입별 분포 차트 영역 */}
            <section
              id="type-chart-section"
              role="region"
              aria-labelledby="type-chart-heading"
            >
              <h2
                id="type-chart-heading"
                className="text-2xl font-semibold mb-4"
              >
                관광 타입별 분포
              </h2>
              {typeError ? (
                <Error
                  message={`타입별 통계 데이터를 불러오는 중 오류가 발생했습니다: ${typeErrorMessage}`}
                  showRetry={false}
                />
              ) : (
                <TypeChart data={typeStats} isLoading={false} />
              )}
            </section>
          </div>
        </div>
      </main>
    );
}


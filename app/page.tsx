/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * My Trip 프로젝트의 메인 페이지입니다.
 * 관광지 목록을 표시하고 필터링 및 검색 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 필터 파라미터 처리 (URL 쿼리 파라미터)
 * 2. 검색 키워드 처리 (URL 쿼리 파라미터)
 * 3. 지역 목록 조회 (getAreaCode API)
 * 4. 조건부 API 호출:
 *    - 검색 모드: searchKeyword() 호출
 *    - 일반 모드: getAreaBasedList() 호출
 * 5. 관광지 목록 표시 (TourList 컴포넌트)
 *
 * 향후 구현 예정:
 * - 네이버 지도 영역 (데스크톱)
 *
 * @dependencies
 * - lib/api/tour-api.ts: getAreaCode, getAreaBasedList, searchKeyword 함수
 * - components/tour-list.tsx: TourList 컴포넌트
 * - components/tour-filters.tsx: TourFilters 컴포넌트
 */

import { getAreaCode, getAreaBasedList, searchKeyword } from "@/lib/api/tour-api";
import { TourList } from "@/components/tour-list";
import { TourFilters } from "@/components/tour-filters";
import { Error } from "@/components/ui/error";

interface HomePageProps {
  searchParams: Promise<{
    keyword?: string;
    areaCode?: string;
    contentTypeId?: string;
    sort?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // URL 쿼리 파라미터 읽기 (Next.js 15는 Promise)
  const params = await searchParams;
  const keyword = params.keyword;
  const areaCode = params.areaCode;
  const contentTypeId = params.contentTypeId;
  const sort = params.sort || "latest";

  // 지역 목록 조회 (필터 컴포넌트에 전달)
  let areas = [];
  let tours = [];
  let totalCount = 0;
  let error: string | null = null;

  try {
    // 지역 목록 조회 (모든 지역 가져오기)
    const areaResult = await getAreaCode(100, 1);
    areas = areaResult;

    // 조건부 API 호출: 검색 모드 vs 일반 모드
    if (keyword && keyword.trim() !== "") {
      // 검색 모드: searchKeyword() 호출 (필터와 조합)
      const result = await searchKeyword(
        keyword.trim(),
        areaCode,
        contentTypeId,
        12,
        1
      );
      tours = result.items;
      totalCount = result.totalCount;
    } else {
      // 일반 모드: getAreaBasedList() 호출
      const result = await getAreaBasedList(
        areaCode,
        contentTypeId,
        12,
        1
      );
      tours = result.items;
      totalCount = result.totalCount;
    }
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "관광지 목록을 불러오는 중 오류가 발생했습니다.";
    console.error("관광지 목록 조회 실패:", err);
  }

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        {/* 필터 영역 */}
        <section className="mb-8" aria-label="필터 영역">
          <TourFilters areas={areas} />
        </section>

        {/* 관광지 목록 영역 */}
        <section aria-label="관광지 목록">
          {error ? (
            <Error message={error} />
          ) : (
            <TourList
              tours={tours}
              sort={sort}
              totalCount={totalCount}
              isSearchMode={!!keyword}
              searchKeyword={keyword}
            />
          )}
        </section>
      </div>
    </main>
  );
}

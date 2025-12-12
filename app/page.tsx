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
 * 5. 관광지 목록 및 지도 표시 (TourMapView 컴포넌트)
 *
 * @dependencies
 * - lib/api/tour-api.ts: getAreaCode, getAreaBasedList, searchKeyword 함수
 * - components/tour-map-view.tsx: TourMapView 컴포넌트 (리스트 + 지도)
 * - components/tour-filters.tsx: TourFilters 컴포넌트
 */

import { getAreaCode, getAreaBasedList, searchKeyword } from "@/lib/api/tour-api";
import { TourMapView } from "@/components/tour-map-view";
import { TourFilters } from "@/components/tour-filters";
import { Error } from "@/components/ui/error";
import { batchGetPetTourInfo, filterPetFriendlyTours } from "@/lib/utils/pet-filter";
import type { PetSizeOption, SortOption } from "@/lib/types/filter";

interface HomePageProps {
  searchParams: Promise<{
    keyword?: string;
    areaCode?: string;
    contentTypeId?: string;
    petFriendly?: string;
    petSize?: string;
    sort?: string;
  }>;
}

// 페이지 레벨 캐싱 설정
// 지역 목록: 1시간, 관광지 목록: 30분, 검색 결과: 10분
export const revalidate = 600; // 10분 (검색 결과 기준, 가장 짧은 캐시 시간)

export default async function HomePage({ searchParams }: HomePageProps) {
  // URL 쿼리 파라미터 읽기 (Next.js 15는 Promise)
  const params = await searchParams;
  const keyword = params.keyword;
  const areaCode = params.areaCode;
  const contentTypeId = params.contentTypeId;
  const petFriendly = params.petFriendly === "true";
  const petSize = (params.petSize as PetSizeOption) || undefined;
  const sort = (params.sort as SortOption) || "latest";

  // 지역 목록 조회 (필터 컴포넌트에 전달)
  let areas = [];
  let tours = [];
  let totalCount = 0;
  let petInfoMap = new Map<string, import("@/lib/types/tour").PetTourInfo | null>();
  let error: string | null = null;

  try {
    // 지역 목록 조회 (모든 지역 가져오기)
    const areaResult = await getAreaCode(100, 1);
    areas = areaResult;

    // 조건부 API 호출: 검색 모드 vs 일반 모드
    // 초기 페이지 크기: 20개 (무한 스크롤을 위한 충분한 데이터)
    if (keyword && keyword.trim() !== "") {
      // 검색 모드: searchKeyword() 호출 (필터와 조합)
      const result = await searchKeyword(
        keyword.trim(),
        areaCode,
        contentTypeId,
        20,
        1
      );
      tours = result.items;
      totalCount = result.totalCount;
    } else {
      // 일반 모드: getAreaBasedList() 호출
      const result = await getAreaBasedList(
        areaCode,
        contentTypeId,
        20,
        1
      );
      tours = result.items;
      totalCount = result.totalCount;
    }

    // 반려동물 필터 적용
    if (petFriendly && tours.length > 0) {
      // 배치로 반려동물 정보 조회
      const tourIds = tours.map((tour) => tour.contentid);
      petInfoMap = await batchGetPetTourInfo(tourIds, 10);

      // 반려동물 동반 가능 관광지만 필터링
      const filteredTours = filterPetFriendlyTours(tours, petInfoMap, petSize);
      
      // 필터링된 결과로 업데이트
      tours = filteredTours;
      // totalCount는 필터링 후 실제 개수로 업데이트 (정확하지 않을 수 있음)
      totalCount = filteredTours.length;
    }
  } catch (err: unknown) {
    let errorMessage = "관광지 목록을 불러오는 중 오류가 발생했습니다.";
    if (err instanceof Error) {
      errorMessage = (err as Error).message;
    } else if (typeof err === "string") {
      errorMessage = err;
    }
    error = errorMessage;
    console.error("관광지 목록 조회 실패:", err);
  }

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        {/* 필터 영역 */}
        <section className="mb-8" aria-label="필터 영역">
          <TourFilters areas={areas} />
        </section>

        {/* 관광지 목록 및 지도 영역 */}
        <section aria-label="관광지 목록 및 지도">
          {error ? (
            <Error message={error} />
          ) : (
            <TourMapView
              initialTours={tours}
              totalCount={totalCount}
              sort={sort}
              isSearchMode={!!keyword}
              searchKeyword={keyword}
              areaCode={areaCode}
              contentTypeId={contentTypeId}
              petInfoMap={petFriendly ? petInfoMap : undefined}
            />
          )}
        </section>
      </div>
    </main>
  );
}

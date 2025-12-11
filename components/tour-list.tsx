/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * 로딩 상태, 빈 상태, 에러 상태를 처리합니다.
 * 무한 스크롤 기능을 포함합니다.
 *
 * 주요 기능:
 * 1. 반응형 그리드 레이아웃 (모바일 1열, 태블릿 2열, 데스크톱 3열)
 * 2. TourCard 컴포넌트를 반복 렌더링
 * 3. 로딩 상태 처리 (Skeleton UI)
 * 4. 빈 상태 처리 (관광지 없을 때 안내 메시지)
 * 5. 정렬 기능 (최신순, 이름순)
 * 6. 검색 결과 개수 표시
 * 7. 무한 스크롤 (Intersection Observer 사용)
 *
 * @dependencies
 * - components/tour-card.tsx: TourCard 컴포넌트
 * - components/ui/skeleton.tsx: Skeleton UI
 * - components/ui/loading.tsx: Loading 컴포넌트
 * - hooks/use-infinite-tours.ts: 무한 스크롤 훅
 * - lib/types/tour.ts: TourItem 타입
 * - lib/types/filter.ts: SortOption 타입
 */

"use client";

import { useMemo, useEffect, useRef } from "react";
import type { TourItem, PetTourInfo } from "@/lib/types/tour";
import type { SortOption } from "@/lib/types/filter";
import { TourCard } from "./tour-card";
import { Skeleton } from "./ui/skeleton";
import { Loading } from "./ui/loading";
import { useInfiniteTours } from "@/hooks/use-infinite-tours";

interface TourListProps {
  /** 초기 관광지 목록 (Server Component에서 가져온 첫 페이지) */
  initialTours: TourItem[];
  /** 전체 개수 */
  totalCount: number;
  /** 정렬 옵션 */
  sort?: SortOption;
  /** 검색 모드 여부 */
  isSearchMode?: boolean;
  /** 검색 키워드 */
  searchKeyword?: string;
  /** 지역 코드 */
  areaCode?: string;
  /** 관광 타입 ID */
  contentTypeId?: string;
  /** 선택된 관광지 ID */
  selectedTourId?: string;
  /** 관광지 선택 핸들러 */
  onTourSelect?: (tourId: string) => void;
  /** 호버된 관광지 ID */
  hoveredTourId?: string | null;
  /** 관광지 호버 핸들러 */
  onTourHover?: (tourId: string | null) => void;
  /** 초기 로딩 상태 (Server Component 로딩 중) */
  isLoading?: boolean;
  /** 반려동물 정보 Map (선택 사항) */
  petInfoMap?: Map<string, PetTourInfo | null>;
}

export function TourList({
  initialTours,
  totalCount,
  sort = "latest",
  isSearchMode = false,
  searchKeyword,
  areaCode,
  contentTypeId,
  selectedTourId,
  onTourSelect,
  hoveredTourId,
  onTourHover,
  isLoading: initialLoading = false,
  petInfoMap,
}: TourListProps) {
  const selectedCardRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤 훅
  const {
    tours,
    isLoading: isLoadingMore,
    error: loadMoreError,
    hasMore,
    observerTargetRef,
  } = useInfiniteTours({
    initialTours,
    totalCount,
    keyword: searchKeyword,
    areaCode,
    contentTypeId,
    numOfRows: 20,
  });

  // 선택된 관광지로 스크롤
  useEffect(() => {
    if (selectedTourId && selectedCardRef.current) {
      selectedCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedTourId]);

  // 정렬된 관광지 목록
  const sortedTours = useMemo(() => {
    if (!tours.length) return tours;

    const sorted = [...tours];

    switch (sort) {
      case "name":
        // 이름순 (가나다순)
        sorted.sort((a, b) => {
          return a.title.localeCompare(b.title, "ko");
        });
        break;
      case "latest":
      default:
        // 최신순 (modifiedtime 기준 내림차순)
        sorted.sort((a, b) => {
          const timeA = parseInt(a.modifiedtime || "0", 10);
          const timeB = parseInt(b.modifiedtime || "0", 10);
          return timeB - timeA;
        });
        break;
    }

    return sorted;
  }, [tours, sort]);
  // 초기 로딩 상태
  if (initialLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="h-full rounded-lg border bg-card shadow-sm"
          >
            {/* 이미지 스켈레톤 */}
            <Skeleton className="h-48 w-full rounded-t-lg" />
            {/* 내용 스켈레톤 */}
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 빈 상태
  if (tours.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="mb-4 text-4xl" aria-hidden="true">
          {isSearchMode ? "🔍" : "📍"}
        </div>
        <h3 className="mb-2 text-lg font-semibold">
          {isSearchMode
            ? `"${searchKeyword}"에 대한 검색 결과가 없습니다`
            : "관광지를 찾을 수 없습니다"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isSearchMode
            ? "다른 키워드로 검색하거나 필터를 조정해보세요."
            : "다른 조건으로 검색해보세요."}
        </p>
      </div>
    );
  }

  // 목록 표시
  return (
    <div className="space-y-4">
      {/* 검색 결과 개수 표시 */}
      {(isSearchMode || totalCount !== undefined) && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isSearchMode ? (
              <>
                <span className="font-medium text-foreground">
                  &quot;{searchKeyword}&quot;
                </span>
                {" 검색 결과: "}
                <span className="font-medium text-foreground">
                  {totalCount?.toLocaleString() || tours.length}
                </span>
                개
              </>
            ) : (
              <>
                전체{" "}
                <span className="font-medium text-foreground">
                  {totalCount?.toLocaleString() || tours.length}
                </span>
                개
              </>
            )}
          </p>
        </div>
      )}

      {/* 관광지 목록 그리드 */}
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="관광지 목록"
      >
        {sortedTours.map((tour, index) => (
          <div
            key={tour.contentid}
            ref={selectedTourId === tour.contentid ? selectedCardRef : null}
            role="listitem"
            className={`transition-all duration-200 ${
              selectedTourId === tour.contentid ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""
            }`}
          >
            <TourCard
              tour={tour}
              isSelected={selectedTourId === tour.contentid}
              onSelect={onTourSelect}
              onHover={onTourHover}
              petInfo={petInfoMap?.get(tour.contentid)}
              index={index}
            />
          </div>
        ))}
      </div>

      {/* 무한 스크롤 타겟 및 로딩 인디케이터 */}
      {hasMore && (
        <div
          ref={observerTargetRef}
          className="flex flex-col items-center justify-center py-8"
          role="status"
          aria-live="polite"
          aria-label="더 많은 관광지 로딩 중"
        >
          {isLoadingMore && (
            <div aria-busy="true">
              <Loading size="md" text="더 많은 관광지를 불러오는 중..." />
            </div>
          )}
          {loadMoreError && (
            <div className="text-sm text-destructive mt-2" role="alert">
              {loadMoreError}
            </div>
          )}
        </div>
      )}

      {/* 모든 데이터 로드 완료 */}
      {!hasMore && tours.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          모든 관광지를 불러왔습니다.
        </div>
      )}
    </div>
  );
}


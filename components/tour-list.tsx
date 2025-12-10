/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * 로딩 상태, 빈 상태, 에러 상태를 처리합니다.
 *
 * 주요 기능:
 * 1. 반응형 그리드 레이아웃 (모바일 1열, 태블릿 2열, 데스크톱 3열)
 * 2. TourCard 컴포넌트를 반복 렌더링
 * 3. 로딩 상태 처리 (Skeleton UI)
 * 4. 빈 상태 처리 (관광지 없을 때 안내 메시지)
 * 5. 정렬 기능 (최신순, 이름순)
 *
 * @dependencies
 * - components/tour-card.tsx: TourCard 컴포넌트
 * - components/ui/skeleton.tsx: Skeleton UI
 * - lib/types/tour.ts: TourItem 타입
 * - lib/types/filter.ts: SortOption 타입
 */

"use client";

import { useMemo } from "react";
import type { TourItem } from "@/lib/types/tour";
import type { SortOption } from "@/lib/types/filter";
import { TourCard } from "./tour-card";
import { Skeleton } from "./ui/skeleton";

interface TourListProps {
  tours: TourItem[];
  isLoading?: boolean;
  sort?: SortOption;
}

export function TourList({ tours, isLoading, sort = "latest" }: TourListProps) {
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
  // 로딩 상태
  if (isLoading) {
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
          🔍
        </div>
        <h3 className="mb-2 text-lg font-semibold">관광지를 찾을 수 없습니다</h3>
        <p className="text-sm text-muted-foreground">
          다른 조건으로 검색해보세요.
        </p>
      </div>
    );
  }

  // 목록 표시
  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="관광지 목록"
    >
      {sortedTours.map((tour) => (
        <div key={tour.contentid} role="listitem">
          <TourCard tour={tour} />
        </div>
      ))}
    </div>
  );
}


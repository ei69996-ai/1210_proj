/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 정렬 옵션을 선택할 수 있는 필터 UI를 제공합니다.
 * 필터 상태는 URL 쿼리 파라미터로 관리되어 공유 가능한 링크를 제공합니다.
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 선택)
 * 2. 관광 타입 필터 (다중 선택 가능)
 * 3. 정렬 옵션 (최신순, 이름순)
 * 4. URL 쿼리 파라미터와 동기화
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - components/ui/select: Select 컴포넌트
 * - components/ui/button: Button 컴포넌트
 * - lib/types/filter.ts: FilterState, SortOption
 * - lib/types/stats.ts: TOUR_TYPE_MAP
 * - lib/types/tour.ts: AreaCode
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { AreaCode } from "@/lib/types/tour";
import { TOUR_TYPE_MAP } from "@/lib/types/stats";
import type { SortOption } from "@/lib/types/filter";
import { SORT_OPTIONS } from "@/lib/types/filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TourFiltersProps {
  /** 지역 목록 (서버에서 조회한 데이터) */
  areas: AreaCode[];
}

export function TourFilters({ areas }: TourFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 현재 필터 상태 읽기
  const currentAreaCode = searchParams.get("areaCode") || undefined;
  const currentContentTypeId = searchParams.get("contentTypeId") || undefined;
  const currentSort = (searchParams.get("sort") as SortOption) || "latest";

  // URL 쿼리 파라미터 업데이트 함수
  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // 정렬 옵션은 항상 유지 (기본값: latest)
      if (!params.has("sort")) {
        params.set("sort", "latest");
      }

      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  // 지역 필터 변경
  const handleAreaChange = (value: string) => {
    updateFilter("areaCode", value === "all" ? undefined : value);
  };

  // 관광 타입 필터 변경 (토글)
  const handleTypeToggle = (typeId: string) => {
    if (currentContentTypeId === typeId) {
      // 이미 선택된 타입이면 해제
      updateFilter("contentTypeId", undefined);
    } else {
      // 새로운 타입 선택
      updateFilter("contentTypeId", typeId);
    }
  };

  // 정렬 옵션 변경
  const handleSortChange = (value: string) => {
    updateFilter("sort", value);
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      {/* 필터 제목 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" id="filter-heading">
          필터
        </h2>
        {/* 필터 초기화 버튼 */}
        {(currentAreaCode || currentContentTypeId || currentSort !== "latest") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push("/");
            }}
            className="text-xs"
            aria-label="필터 초기화"
          >
            초기화
          </Button>
        )}
      </div>

      {/* 필터 그룹 */}
      <div
        className="flex flex-col gap-4 md:flex-row md:items-end"
        role="group"
        aria-labelledby="filter-heading"
      >
        {/* 지역 필터 */}
        <div className="flex-1">
          <label htmlFor="area-filter" className="mb-2 block text-sm font-medium">
            지역
          </label>
          <Select
            value={currentAreaCode || "all"}
            onValueChange={handleAreaChange}
          >
            <SelectTrigger id="area-filter" className="w-full">
              <SelectValue placeholder="전체 지역" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {areas.map((area) => (
                <SelectItem key={area.code} value={area.code}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 관광 타입 필터 */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium" id="type-filter-label">
            관광 타입
          </label>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-labelledby="type-filter-label"
          >
            <Button
              variant={!currentContentTypeId ? "default" : "outline"}
              size="sm"
              onClick={() => handleTypeToggle("")}
              className="text-xs"
              aria-pressed={!currentContentTypeId}
            >
              전체
            </Button>
            {Object.entries(TOUR_TYPE_MAP).map(([typeId, typeName]) => (
              <Button
                key={typeId}
                variant={
                  currentContentTypeId === typeId ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleTypeToggle(typeId)}
                className="text-xs transition-all"
                aria-pressed={currentContentTypeId === typeId}
              >
                {typeName}
              </Button>
            ))}
          </div>
        </div>

        {/* 정렬 옵션 */}
        <div className="flex-1">
          <label htmlFor="sort-filter" className="mb-2 block text-sm font-medium">
            정렬
          </label>
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger id="sort-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 선택된 필터 표시 (선택 사항) */}
      {(currentAreaCode || currentContentTypeId) && (
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {currentAreaCode && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs">
              지역: {areas.find((a) => a.code === currentAreaCode)?.name}
            </span>
          )}
          {currentContentTypeId && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs">
              타입: {TOUR_TYPE_MAP[currentContentTypeId]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


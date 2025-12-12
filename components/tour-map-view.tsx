/**
 * @file tour-map-view.tsx
 * @description 관광지 목록과 지도를 통합하는 래퍼 컴포넌트
 *
 * 리스트와 지도를 양방향으로 연동하는 컴포넌트입니다.
 * - 데스크톱: 리스트(좌측) + 지도(우측) 분할 레이아웃
 * - 모바일: 탭 형태로 리스트/지도 전환
 *
 * 주요 기능:
 * 1. 선택된 관광지 상태 관리
 * 2. 리스트 항목 클릭 시 지도 이동
 * 3. 마커 클릭 시 리스트 강조
 * 4. 반응형 레이아웃 (데스크톱 분할, 모바일 탭)
 *
 * @dependencies
 * - components/tour-list.tsx: TourList 컴포넌트
 * - components/naver-map.tsx: NaverMap 컴포넌트
 * - components/ui/tabs.tsx: Tabs 컴포넌트
 * - lib/types/tour.ts: TourItem 타입
 */

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { TourItem, PetTourInfo } from "@/lib/types/tour";
import { TourList } from "@/components/tour-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SortOption } from "@/lib/types/filter";
import { useInfiniteTours } from "@/hooks/use-infinite-tours";
import { Loading } from "@/components/ui/loading";

// 네이버 지도 컴포넌트 동적 로딩 (번들 크기 최적화)
const NaverMap = dynamic(() => import("@/components/naver-map").then((mod) => ({ default: mod.NaverMap })), {
  ssr: false, // 클라이언트 사이드만 렌더링
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/50">
      <Loading size="lg" />
    </div>
  ),
});

interface TourMapViewProps {
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
  /** 초기 중심 좌표 (선택 사항) */
  initialCenter?: { lat: number; lng: number };
  /** 초기 줌 레벨 (선택 사항) */
  initialZoom?: number;
  /** 초기 로딩 상태 */
  isLoading?: boolean;
  /** 반려동물 정보 Map (선택 사항) */
  petInfoMap?: Map<string, PetTourInfo | null>;
}

export function TourMapView({
  initialTours,
  totalCount,
  sort = "latest",
  isSearchMode = false,
  searchKeyword,
  areaCode,
  contentTypeId,
  initialCenter,
  initialZoom,
  isLoading: initialLoading = false,
  petInfoMap,
}: TourMapViewProps) {
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  const [hoveredTourId, setHoveredTourId] = useState<string | null>(null);

  // 무한 스크롤 훅 (지도 업데이트용)
  const { tours: allTours } = useInfiniteTours({
    initialTours,
    totalCount,
    keyword: searchKeyword,
    areaCode,
    contentTypeId,
    numOfRows: 20,
  });

  // 필터 키 생성 (필터 변경 감지용)
  const filterKey = `${areaCode || "all"}-${contentTypeId || "all"}-${searchKeyword || ""}`;

  // 관광지 선택 핸들러
  const handleTourSelect = (tourId: string) => {
    setSelectedTourId(tourId);
  };

  // 관광지 호버 핸들러
  const handleTourHover = (tourId: string | null) => {
    setHoveredTourId(tourId);
  };

  return (
    <div className="w-full">
      {/* 모바일: 탭 형태 */}
      <div className="block md:hidden">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="list">목록</TabsTrigger>
            <TabsTrigger value="map">지도</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-0">
            <TourList
              initialTours={initialTours}
              totalCount={totalCount}
              sort={sort}
              isSearchMode={isSearchMode}
              searchKeyword={searchKeyword}
              areaCode={areaCode}
              contentTypeId={contentTypeId}
              selectedTourId={selectedTourId}
              onTourSelect={handleTourSelect}
              hoveredTourId={hoveredTourId}
              onTourHover={handleTourHover}
              isLoading={initialLoading}
              petInfoMap={petInfoMap}
            />
          </TabsContent>
          <TabsContent value="map" className="mt-0">
            <div className="h-[400px] min-h-[400px] rounded-lg overflow-hidden border">
              <NaverMap
                tours={allTours}
                selectedTourId={selectedTourId}
                onTourSelect={handleTourSelect}
                hoveredTourId={hoveredTourId}
                initialCenter={initialCenter}
                initialZoom={initialZoom}
                height="400px"
                filterKey={filterKey}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 태블릿/데스크톱: 분할 레이아웃 */}
      <div className="hidden md:flex md:gap-6 md:h-[600px] md:min-h-[600px]">
        {/* 리스트 영역 (좌측 50%) */}
        <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <TourList
            initialTours={initialTours}
            totalCount={totalCount}
            sort={sort}
            isSearchMode={isSearchMode}
            searchKeyword={searchKeyword}
            areaCode={areaCode}
            contentTypeId={contentTypeId}
            selectedTourId={selectedTourId}
            onTourSelect={handleTourSelect}
            hoveredTourId={hoveredTourId}
            onTourHover={handleTourHover}
            isLoading={initialLoading}
            petInfoMap={petInfoMap}
          />
        </div>

        {/* 지도 영역 (우측 50%) */}
        <div className="flex-1 rounded-lg overflow-hidden border">
          <NaverMap
            tours={allTours}
            selectedTourId={selectedTourId}
            onTourSelect={handleTourSelect}
            hoveredTourId={hoveredTourId}
            initialCenter={initialCenter}
            initialZoom={initialZoom}
            height="600px"
            filterKey={filterKey}
          />
        </div>
      </div>
    </div>
  );
}


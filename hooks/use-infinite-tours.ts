/**
 * @file use-infinite-tours.ts
 * @description 무한 스크롤 훅
 *
 * Intersection Observer를 사용하여 스크롤을 감지하고,
 * 다음 페이지의 관광지 목록을 자동으로 로드하는 훅입니다.
 *
 * 주요 기능:
 * 1. Intersection Observer를 사용한 스크롤 감지
 * 2. 페이지 상태 관리 (현재 페이지, 로딩 상태, 에러 상태)
 * 3. 누적된 관광지 목록 관리
 * 4. 다음 페이지 로드 함수
 *
 * @dependencies
 * - app/api/tours/route.ts: API Route
 * - lib/types/tour.ts: TourItem 타입
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TourItem } from "@/lib/types/tour";

interface UseInfiniteToursOptions {
  /** 초기 관광지 목록 */
  initialTours: TourItem[];
  /** 전체 개수 */
  totalCount: number;
  /** 검색 키워드 (선택) */
  keyword?: string;
  /** 지역 코드 (선택) */
  areaCode?: string;
  /** 관광 타입 ID (선택) */
  contentTypeId?: string;
  /** 페이지당 항목 수 (기본값: 20) */
  numOfRows?: number;
  /** Intersection Observer rootMargin (기본값: "100px") */
  rootMargin?: string;
}

interface UseInfiniteToursReturn {
  /** 누적된 관광지 목록 */
  tours: TourItem[];
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 더 불러올 데이터가 있는지 여부 */
  hasMore: boolean;
  /** 다음 페이지 로드 함수 */
  loadMore: () => Promise<void>;
  /** Intersection Observer 타겟 ref */
  observerTargetRef: React.RefObject<HTMLDivElement>;
  /** 초기화 함수 (필터/검색 변경 시 사용) */
  reset: () => void;
}

export function useInfiniteTours({
  initialTours,
  totalCount,
  keyword,
  areaCode,
  contentTypeId,
  numOfRows = 20,
  rootMargin = "100px",
}: UseInfiniteToursOptions): UseInfiniteToursReturn {
  const [tours, setTours] = useState<TourItem[]>(initialTours);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(
    initialTours.length < totalCount
  );

  const observerTargetRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef(false);

  // 필터/검색 변경 시 초기화
  const reset = useCallback(() => {
    setTours(initialTours);
    setCurrentPage(1);
    setError(null);
    setIsLoading(false);
    setHasMore(initialTours.length < totalCount);
    isLoadingRef.current = false;
  }, [initialTours, totalCount]);

  // 초기 데이터가 변경되면 리셋
  useEffect(() => {
    reset();
  }, [keyword, areaCode, contentTypeId, reset]);

  // 다음 페이지 로드 함수
  const loadMore = useCallback(async () => {
    // 이미 로딩 중이거나 더 이상 데이터가 없으면 중단
    if (isLoadingRef.current || !hasMore) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const params = new URLSearchParams({
        numOfRows: numOfRows.toString(),
        pageNo: nextPage.toString(),
      });

      if (keyword) {
        params.append("keyword", keyword);
      }
      if (areaCode) {
        params.append("areaCode", areaCode);
      }
      if (contentTypeId) {
        params.append("contentTypeId", contentTypeId);
      }

      const response = await fetch(`/api/tours?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error("잘못된 응답 형식입니다.");
      }

      // 새 데이터 추가
      setTours((prev) => {
        const newTours = [...prev, ...data.items];
        // 더 불러올 데이터가 있는지 확인
        const newHasMore = newTours.length < data.totalCount;
        setHasMore(newHasMore);
        return newTours;
      });
      setCurrentPage(nextPage);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "다음 페이지를 불러오는 중 오류가 발생했습니다.";
      setError(errorMessage);
      console.error("무한 스크롤 에러:", err);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentPage, hasMore, keyword, areaCode, contentTypeId, numOfRows]);

  // Intersection Observer 설정
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target || !hasMore) {
      return;
    }

    // 기존 Observer 정리
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 새 Observer 생성
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoadingRef.current && hasMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.1,
      }
    );

    observerRef.current.observe(target);

    // cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadMore, rootMargin]);

  return {
    tours,
    isLoading,
    error,
    hasMore,
    loadMore,
    observerTargetRef,
    reset,
  };
}


/**
 * @file stats-api.ts
 * @description 통계 데이터 수집 API
 *
 * 통계 대시보드 페이지에서 사용할 통계 데이터를 수집하는 함수들을 제공합니다.
 * 지역별/타입별 관광지 개수를 집계하고, 전체 통계 요약을 생성합니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 집계 (getRegionStats)
 * 2. 타입별 관광지 개수 집계 (getTypeStats)
 * 3. 전체 통계 요약 생성 (getStatsSummary)
 *
 * @dependencies
 * - lib/api/tour-api: getAreaBasedList, getAreaCode 함수
 * - lib/types/stats: RegionStats, TypeStats, StatsSummary, REGION_MAP, TOUR_TYPE_MAP
 * - lib/types/tour: AreaCode 타입
 */

import { getAreaBasedList, getAreaCode } from "@/lib/api/tour-api";
import type {
  RegionStats,
  TypeStats,
  StatsSummary,
} from "@/lib/types/stats";
import { REGION_MAP, TOUR_TYPE_MAP } from "@/lib/types/stats";
import type { AreaCode } from "@/lib/types/tour";

/**
 * 지역별 관광지 개수 집계
 * @returns 지역별 통계 배열
 */
export async function getRegionStats(): Promise<RegionStats[]> {
  try {
    // 모든 지역 목록 조회
    const areas = await getAreaCode(100, 1);

    // 각 지역별로 병렬 API 호출
    const regionPromises = areas.map(async (area: AreaCode) => {
      try {
        const result = await getAreaBasedList(area.code, undefined, 1, 1);
        const regionName = REGION_MAP[area.code] || area.name;

        return {
          regionCode: area.code,
          regionName,
          count: result.totalCount,
        } as RegionStats;
      } catch (error) {
        // 개별 지역 조회 실패 시 에러 로깅하고 null 반환
        console.error(
          `지역 통계 조회 실패 (지역코드: ${area.code}):`,
          error instanceof Error ? error.message : String(error)
        );
        return null;
      }
    });

    // 모든 Promise 완료 대기
    const results = await Promise.all(regionPromises);

    // null 값 제거 및 필터링
    const stats = results.filter(
      (stat): stat is RegionStats => stat !== null
    );

    // count 기준 내림차순 정렬
    return stats.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("지역별 통계 수집 실패:", error);
    throw new Error(
      `지역별 통계 수집 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 타입별 관광지 개수 집계
 * @returns 타입별 통계 배열
 */
export async function getTypeStats(): Promise<TypeStats[]> {
  try {
    // 모든 타입 ID 목록
    const typeIds = Object.keys(TOUR_TYPE_MAP);

    // 각 타입별로 병렬 API 호출
    const typePromises = typeIds.map(async (typeId: string) => {
      try {
        const result = await getAreaBasedList(undefined, typeId, 1, 1);
        const typeName = TOUR_TYPE_MAP[typeId];

        return {
          typeId,
          typeName,
          count: result.totalCount,
        } as TypeStats;
      } catch (error) {
        // 개별 타입 조회 실패 시 에러 로깅하고 null 반환
        console.error(
          `타입 통계 조회 실패 (타입ID: ${typeId}):`,
          error instanceof Error ? error.message : String(error)
        );
        return null;
      }
    });

    // 모든 Promise 완료 대기
    const results = await Promise.all(typePromises);

    // null 값 제거 및 필터링
    const stats = results.filter(
      (stat): stat is TypeStats => stat !== null
    );

    // count 기준 내림차순 정렬
    return stats.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("타입별 통계 수집 실패:", error);
    throw new Error(
      `타입별 통계 수집 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 전체 통계 요약 정보 생성
 * @returns 통계 요약 정보
 */
export async function getStatsSummary(): Promise<StatsSummary> {
  try {
    // 지역별 통계와 타입별 통계를 병렬로 수집
    const [regionStats, typeStats, totalCountResult] = await Promise.all([
      getRegionStats().catch((error) => {
        console.error("지역별 통계 수집 실패:", error);
        return [] as RegionStats[];
      }),
      getTypeStats().catch((error) => {
        console.error("타입별 통계 수집 실패:", error);
        return [] as TypeStats[];
      }),
      // 전체 관광지 수 조회 (areaCode, contentTypeId 모두 undefined)
      getAreaBasedList(undefined, undefined, 1, 1).catch((error) => {
        console.error("전체 관광지 수 조회 실패:", error);
        return { items: [], totalCount: 0 };
      }),
    ]);

    // 전체 관광지 수 계산
    let totalCount = totalCountResult.totalCount;

    // 전체 관광지 수 조회 실패 시 대체 방법 사용
    if (totalCount === 0) {
      // 방법 1: 모든 타입의 count 합계 시도
      const typeSum = typeStats.reduce((sum, stat) => sum + stat.count, 0);
      if (typeSum > 0) {
        totalCount = typeSum;
      } else {
        // 방법 2: 모든 지역의 count 합계 시도
        const regionSum = regionStats.reduce(
          (sum, stat) => sum + stat.count,
          0
        );
        totalCount = regionSum;
      }
    }

    // Top 3 지역 추출 (이미 정렬되어 있음)
    const topRegions = regionStats.slice(0, 3);

    // Top 3 타입 추출 (이미 정렬되어 있음)
    const topTypes = typeStats.slice(0, 3);

    // 마지막 업데이트 시간
    const lastUpdated = new Date();

    return {
      totalCount,
      topRegions,
      topTypes,
      lastUpdated,
    };
  } catch (error) {
    console.error("통계 요약 생성 실패:", error);
    throw new Error(
      `통계 요약 생성 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}


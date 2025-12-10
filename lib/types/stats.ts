/**
 * @file stats.ts
 * @description 통계 관련 타입 정의
 *
 * 통계 대시보드 페이지에서 사용하는 데이터 구조를 정의합니다.
 */

/**
 * 지역별 관광지 통계
 */
export interface RegionStats {
  regionCode: string; // 지역코드 (예: "1" = 서울)
  regionName: string; // 지역명 (예: "서울")
  count: number; // 관광지 개수
}

/**
 * 관광 타입별 통계
 */
export interface TypeStats {
  typeId: string; // 타입ID (예: "12" = 관광지)
  typeName: string; // 타입명 (예: "관광지")
  count: number; // 관광지 개수
}

/**
 * 통계 요약 정보
 */
export interface StatsSummary {
  totalCount: number; // 전체 관광지 수
  topRegions: RegionStats[]; // 상위 지역 (최대 3개)
  topTypes: TypeStats[]; // 상위 타입 (최대 3개)
  lastUpdated: Date; // 마지막 업데이트 시간
}

/**
 * 관광 타입 ID와 이름 매핑
 */
export const TOUR_TYPE_MAP: Record<string, string> = {
  "12": "관광지",
  "14": "문화시설",
  "15": "축제/행사",
  "25": "여행코스",
  "28": "레포츠",
  "32": "숙박",
  "38": "쇼핑",
  "39": "음식점",
} as const;

/**
 * 지역 코드와 이름 매핑 (주요 지역)
 */
export const REGION_MAP: Record<string, string> = {
  "1": "서울",
  "2": "인천",
  "3": "대전",
  "4": "대구",
  "5": "광주",
  "6": "부산",
  "7": "울산",
  "8": "세종",
  "31": "경기",
  "32": "강원",
  "33": "충북",
  "34": "충남",
  "35": "경북",
  "36": "경남",
  "37": "전북",
  "38": "전남",
  "39": "제주",
} as const;


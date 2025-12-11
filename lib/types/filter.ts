/**
 * @file filter.ts
 * @description 필터 관련 타입 정의
 *
 * 관광지 목록 필터링에 사용되는 타입과 상수를 정의합니다.
 */

/**
 * 정렬 옵션 타입
 */
export type SortOption = "latest" | "name";

/**
 * 반려동물 크기 필터 옵션
 */
export type PetSizeOption = "small" | "medium" | "large" | "all";

/**
 * 필터 상태 인터페이스
 */
export interface FilterState {
  /** 지역코드 (시/도 단위) */
  areaCode?: string;
  /** 관광 타입 ID (단일 선택) */
  contentTypeId?: string;
  /** 반려동물 동반 가능 필터 활성화 여부 */
  petFriendly?: boolean;
  /** 반려동물 크기 필터 (소형, 중형, 대형, 전체) */
  petSize?: PetSizeOption;
  /** 정렬 옵션 */
  sort: SortOption;
}

/**
 * 필터 초기값
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  areaCode: undefined,
  contentTypeId: undefined,
  petFriendly: undefined,
  petSize: undefined,
  sort: "latest",
} as const;

/**
 * 반려동물 크기 필터 옵션 라벨 매핑
 */
export const PET_SIZE_OPTIONS: Record<PetSizeOption, string> = {
  small: "소형",
  medium: "중형",
  large: "대형",
  all: "전체",
} as const;

/**
 * 정렬 옵션 라벨 매핑
 */
export const SORT_OPTIONS: Record<SortOption, string> = {
  latest: "최신순",
  name: "이름순",
} as const;


/**
 * @file pet-filter.ts
 * @description 반려동물 필터링 유틸리티 함수
 *
 * 반려동물 동반 가능 필터링을 위한 유틸리티 함수들을 제공합니다.
 */

import type { TourItem, PetTourInfo } from "@/lib/types/tour";
import type { PetSizeOption } from "@/lib/types/filter";
import { getDetailPetTour } from "@/lib/api/tour-api";

/**
 * 배치로 반려동물 정보 조회 (병렬 처리, 최대 동시 요청 수 제한)
 * @param tourIds 관광지 ID 목록
 * @param batchSize 배치 크기 (기본값: 10)
 * @returns 관광지 ID와 반려동물 정보 매핑
 */
export async function batchGetPetTourInfo(
  tourIds: string[],
  batchSize = 10
): Promise<Map<string, PetTourInfo | null>> {
  const result = new Map<string, PetTourInfo | null>();

  // 배치 단위로 나누어 처리
  for (let i = 0; i < tourIds.length; i += batchSize) {
    const batch = tourIds.slice(i, i + batchSize);
    
    // 배치 내에서 병렬 처리
    const batchResults = await Promise.allSettled(
      batch.map(async (contentId) => {
        try {
          const petInfo = await getDetailPetTour(contentId);
          return { contentId, petInfo };
        } catch (error) {
          console.error(`반려동물 정보 조회 실패 (contentId: ${contentId}):`, error);
          return { contentId, petInfo: null };
        }
      })
    );

    // 결과를 Map에 저장
    batchResults.forEach((resultItem) => {
      if (resultItem.status === "fulfilled") {
        result.set(resultItem.value.contentId, resultItem.value.petInfo);
      } else {
        // Promise.allSettled는 reject되지 않지만, 안전을 위해 처리
        const contentId = batch.find((id) => !result.has(id)) || "";
        result.set(contentId, null);
      }
    });
  }

  return result;
}

/**
 * 반려동물 동반 가능 여부 확인
 * @param petInfo 반려동물 정보
 * @returns 반려동물 동반 가능 여부
 */
export function isPetFriendly(petInfo: PetTourInfo | null): boolean {
  if (!petInfo) return false;
  return petInfo.chkpetleash === "Y";
}

/**
 * 반려동물 크기 필터 확인
 * @param petInfo 반려동물 정보
 * @param petSize 필터링할 크기
 * @returns 크기 필터 조건 만족 여부
 */
export function matchesPetSize(
  petInfo: PetTourInfo | null,
  petSize: PetSizeOption
): boolean {
  if (!petInfo || petSize === "all") return true;

  const petSizeMap: Record<PetSizeOption, string[]> = {
    small: ["소형", "소"],
    medium: ["중형", "중"],
    large: ["대형", "대"],
    all: [],
  };

  const allowedSizes = petSizeMap[petSize];
  if (!allowedSizes.length) return true;

  const petSizeValue = petInfo.chkpetsize || "";
  return allowedSizes.some((size) => petSizeValue.includes(size));
}

/**
 * 관광지 목록을 반려동물 필터로 필터링
 * @param tours 관광지 목록
 * @param petInfoMap 반려동물 정보 Map (contentId -> PetTourInfo)
 * @param petSize 반려동물 크기 필터 (선택 사항)
 * @returns 필터링된 관광지 목록
 */
export function filterPetFriendlyTours(
  tours: TourItem[],
  petInfoMap: Map<string, PetTourInfo | null>,
  petSize?: PetSizeOption
): TourItem[] {
  return tours.filter((tour) => {
    const petInfo = petInfoMap.get(tour.contentid);
    
    // 반려동물 동반 가능 여부 확인
    if (!isPetFriendly(petInfo)) {
      return false;
    }

    // 크기 필터 적용 (선택 사항)
    if (petSize && petSize !== "all") {
      return matchesPetSize(petInfo, petSize);
    }

    return true;
  });
}


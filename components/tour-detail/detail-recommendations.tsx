/**
 * @file detail-recommendations.tsx
 * @description 추천 관광지 섹션 컴포넌트
 *
 * 현재 관광지와 같은 지역 또는 타입의 다른 관광지를 추천하는 섹션입니다.
 * 같은 지역 + 같은 타입의 관광지를 조회하여 표시합니다.
 *
 * 주요 기능:
 * 1. 같은 지역(areacode) + 같은 타입(contenttypeid)의 관광지 조회
 * 2. 현재 관광지(contentId) 제외
 * 3. 최대 6개 관광지 표시
 * 4. TourCard 컴포넌트 재사용
 * 5. 반응형 그리드 레이아웃 (모바일 1열, 태블릿 2열, 데스크톱 3열)
 *
 * @dependencies
 * - lib/api/tour-api: getAreaBasedList() 함수
 * - lib/types/tour.ts: TourItem 타입
 * - components/tour-card: TourCard 컴포넌트
 */

import { getAreaBasedList } from "@/lib/api/tour-api";
import { TourCard } from "@/components/tour-card";

interface DetailRecommendationsProps {
  /** 현재 관광지 ID */
  currentContentId: string;
  /** 현재 관광지 지역 코드 */
  areaCode: string;
  /** 현재 관광지 타입 ID */
  contentTypeId: string;
}

/**
 * 추천 관광지 섹션 컴포넌트
 * 같은 지역 + 같은 타입의 관광지를 추천합니다.
 */
export async function DetailRecommendations({
  currentContentId,
  areaCode,
  contentTypeId,
}: DetailRecommendationsProps) {
  try {
    // 같은 지역 + 같은 타입의 관광지 조회 (10개 조회 후 필터링)
    const { items } = await getAreaBasedList(
      areaCode,
      contentTypeId,
      10, // numOfRows
      1 // pageNo
    );

    // 현재 관광지 제외 및 최대 6개로 제한
    const recommendedTours = items
      .filter((tour) => tour.contentid !== currentContentId)
      .slice(0, 6);

    // 추천 관광지가 없으면 섹션 숨김
    if (recommendedTours.length === 0) {
      return null;
    }

    return (
      <section
        className="space-y-6"
        role="region"
        aria-labelledby="recommendations-heading"
      >
        {/* 섹션 제목 */}
        <h2
          id="recommendations-heading"
          className="text-2xl font-bold tracking-tight"
        >
          이런 관광지는 어떠세요?
        </h2>

        {/* 추천 관광지 그리드 */}
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="추천 관광지 목록"
        >
          {recommendedTours.map((tour) => (
            <div key={tour.contentid} role="listitem">
              <TourCard tour={tour} />
            </div>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    // 추천 관광지 조회 실패 시 섹션 숨김 (페이지는 정상 표시)
    console.warn("추천 관광지 조회 실패:", error);
    return null;
  }
}


/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * My Trip 프로젝트의 관광지 상세 정보를 표시하는 페이지입니다.
 * 동적 라우팅을 통해 contentId를 받아 해당 관광지의 상세 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 동적 라우팅 파라미터 처리 (contentId)
 * 2. 뒤로가기 버튼 (홈으로 이동)
 * 3. getDetailCommon() API 호출
 * 4. getDetailIntro() API 호출
 * 5. getDetailImage() API 호출
 * 6. getDetailPetTour() API 호출
 * 7. 기본 정보 섹션 표시 (DetailInfo 컴포넌트)
 * 8. 이미지 갤러리 섹션 표시 (DetailGallery 컴포넌트)
 * 9. 반려동물 정보 섹션 표시 (DetailPetTour 컴포넌트)
 * 10. 운영 정보 섹션 표시 (DetailIntro 컴포넌트)
 * 11. 추천 관광지 섹션 표시 (DetailRecommendations 컴포넌트)
 * 12. 로딩 및 에러 상태 처리
 * 13. Open Graph 메타태그 동적 생성 (공유 기능)
 *
 * @dependencies
 * - next/link: 클라이언트 사이드 네비게이션
 * - next/metadata: Metadata API
 * - lucide-react: 아이콘
 * - lib/api/tour-api: getDetailCommon(), getDetailIntro(), getDetailImage(), getDetailPetTour() 함수
 * - components/tour-detail/detail-info: DetailInfo 컴포넌트
 * - components/tour-detail/detail-gallery: DetailGallery 컴포넌트
 * - components/tour-detail/detail-pet-tour: DetailPetTour 컴포넌트
 * - components/tour-detail/detail-intro: DetailIntro 컴포넌트
 * - components/tour-detail/detail-recommendations: DetailRecommendations 컴포넌트
 * - components/ui/error: Error 컴포넌트
 */

import Link from "next/link";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { getDetailCommon, getDetailIntro, getDetailImage, getDetailPetTour } from "@/lib/api/tour-api";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailMap } from "@/components/tour-detail/detail-map";
import { DetailPetTour } from "@/components/tour-detail/detail-pet-tour";
import { DetailRecommendations } from "@/components/tour-detail/detail-recommendations";
import { ShareButton } from "@/components/tour-detail/share-button";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { Error } from "@/components/ui/error";
import { Skeleton } from "@/components/ui/skeleton";

// 이미지 갤러리 컴포넌트 동적 로딩 (Swiper 라이브러리 번들 크기 최적화)
const DetailGallery = dynamic(() => import("@/components/tour-detail/detail-gallery").then((mod) => ({ default: mod.DetailGallery })), {
  loading: () => (
    <div className="w-full space-y-4">
      <Skeleton className="h-[400px] w-full" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  ),
});

interface PageProps {
  params: Promise<{ contentId: string }>;
}

/**
 * Open Graph 메타태그 동적 생성
 * 관광지 상세 정보를 기반으로 소셜 미디어 공유용 메타태그를 생성합니다.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { contentId } = await params;

  // contentId 유효성 검증
  const isValidContentId = /^\d+$/.test(contentId);
  if (!isValidContentId) {
    return {
      title: "관광지 정보 | My Trip",
      description: "관광지 정보를 찾을 수 없습니다.",
    };
  }

  try {
    // 관광지 정보 조회
    const detail = await getDetailCommon(contentId);

    // 기본 URL 생성 (환경변수 또는 기본값 사용)
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    const pageUrl = `${baseUrl}/places/${contentId}`;

    // description 생성 (overview의 처음 100자, 없으면 기본 메시지)
    let description = "한국관광공사 관광지 정보를 확인하세요.";
    if (detail.overview) {
      // HTML 태그 제거 및 공백 정리
      const cleanOverview = detail.overview
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      description =
        cleanOverview.length > 100
          ? `${cleanOverview.substring(0, 100)}...`
          : cleanOverview;
    }

    // 이미지 URL (firstimage 우선, 없으면 firstimage2, 없으면 기본 이미지)
    const imageUrl =
      detail.firstimage ||
      detail.firstimage2 ||
      `${baseUrl}/og-image.png`;

    // 절대 URL로 변환 (상대 경로인 경우)
    const absoluteImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `${baseUrl}${imageUrl}`;

    return {
      title: `${detail.title} | My Trip`,
      description,
      openGraph: {
        title: detail.title,
        description,
        url: pageUrl,
        siteName: "My Trip",
        images: [
          {
            url: absoluteImageUrl,
            width: 1200,
            height: 630,
            alt: detail.title,
          },
        ],
        locale: "ko_KR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: detail.title,
        description,
        images: [absoluteImageUrl],
      },
    };
  } catch (error) {
    // 메타태그 생성 실패 시 기본값 반환
    console.warn("메타태그 생성 실패:", error);
    return {
      title: "관광지 정보 | My Trip",
      description: "관광지 정보를 불러오는 중 오류가 발생했습니다.",
    };
  }
}

// 페이지 레벨 캐싱 설정
// 상세 정보: 1시간 (이미지는 2시간이지만, 전체 페이지는 1시간)
export const revalidate = 3600; // 1시간

export default async function PlaceDetailPage({ params }: PageProps) {
  // Next.js 15: params는 Promise이므로 await 처리 필요
  const { contentId } = await params;

  // contentId 유효성 검증 (숫자만 허용)
  const isValidContentId = /^\d+$/.test(contentId);

  // 유효하지 않은 contentId 처리
  if (!isValidContentId) {
    return (
      <div className="min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
          {/* 헤더 영역 */}
          <header className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
              aria-label="홈으로 돌아가기"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              <span>뒤로가기</span>
            </Link>
          </header>

          {/* 에러 메시지 */}
          <main>
            <Error
              message="잘못된 관광지 ID입니다. contentId는 숫자만 허용됩니다."
              className="rounded-lg border"
            />
          </main>
        </div>
      </div>
    );
  }

  // API 호출 및 에러 처리
  let detail;
  try {
    detail = await getDetailCommon(contentId);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? (error as Error).message
        : "관광지 정보를 불러오는 중 오류가 발생했습니다.";

    return (
      <div className="min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
          {/* 헤더 영역 */}
          <header className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
              aria-label="홈으로 돌아가기"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              <span>뒤로가기</span>
            </Link>
          </header>

          {/* 에러 메시지 */}
          <main>
            <Error message={errorMessage} className="rounded-lg border" />
          </main>
        </div>
      </div>
    );
  }

  // 운영 정보 API 호출 (에러가 나도 페이지는 정상 표시)
  let intro = null;
  try {
    intro = await getDetailIntro(contentId, detail.contenttypeid);
  } catch (error) {
    // 운영 정보가 없는 경우에도 페이지는 정상 표시 (섹션만 숨김)
    console.warn("운영 정보 조회 실패:", error);
  }

  // 이미지 목록 API 호출 (에러가 나도 페이지는 정상 표시)
  let images = null;
  try {
    images = await getDetailImage(contentId);
  } catch (error) {
    // 이미지가 없는 경우에도 페이지는 정상 표시 (섹션만 숨김)
    console.warn("이미지 목록 조회 실패:", error);
  }

  // 반려동물 정보 API 호출 (에러가 나도 페이지는 정상 표시)
  let petInfo = null;
  try {
    petInfo = await getDetailPetTour(contentId);
  } catch (error) {
    // 반려동물 정보가 없는 경우에도 페이지는 정상 표시 (섹션만 숨김)
    console.warn("반려동물 정보 조회 실패:", error);
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        {/* 헤더 영역 */}
        <header className="mb-8 flex items-center justify-between gap-3 sm:gap-4">
          {/* 뒤로가기 버튼 */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 min-h-[44px] sm:min-h-[36px]"
            aria-label="홈으로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="text-base sm:text-sm">뒤로가기</span>
          </Link>
          {/* 액션 버튼 그룹 (북마크, 공유) */}
          <div className="flex items-center gap-2">
            <BookmarkButton contentId={contentId} size="sm" variant="outline" />
            <ShareButton size="sm" variant="outline" />
          </div>
        </header>

        {/* 메인 컨텐츠 영역 */}
        <main className="space-y-8 md:space-y-10" role="main" aria-label="관광지 상세 정보">
          <section role="region" aria-labelledby="detail-info-heading">
            <DetailInfo detail={detail} />
          </section>
          {images && images.length > 0 && (
            <section role="region" aria-labelledby="detail-gallery-heading">
              <DetailGallery images={images} title={detail.title} />
            </section>
          )}
          {/* 지도 섹션: 좌표가 있는 경우에만 표시 */}
          {detail.mapx && detail.mapy && (
            <section role="region" aria-labelledby="detail-map-heading">
              <DetailMap detail={detail} />
            </section>
          )}
          {/* 반려동물 정보 섹션: 반려동물 정보가 있고 동반 가능한 경우에만 표시 */}
          {petInfo && (
            <section role="region" aria-labelledby="detail-pet-tour-heading">
              <DetailPetTour petInfo={petInfo} />
            </section>
          )}
          {intro && (
            <section role="region" aria-labelledby="detail-intro-heading">
              <DetailIntro intro={intro} />
            </section>
          )}
          {/* 추천 관광지 섹션: 지역 코드가 있는 경우에만 표시 */}
          {detail.areacode && (
            <DetailRecommendations
              currentContentId={contentId}
              areaCode={detail.areacode}
              contentTypeId={detail.contenttypeid}
            />
          )}
        </main>
      </div>
    </div>
  );
}


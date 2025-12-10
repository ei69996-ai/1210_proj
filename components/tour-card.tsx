/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * 썸네일 이미지, 관광지명, 주소, 타입 뱃지를 표시하고,
 * 클릭 시 상세페이지로 이동합니다.
 *
 * 주요 기능:
 * 1. 관광지 썸네일 이미지 표시 (기본 이미지 fallback)
 * 2. 관광지명 및 주소 표시
 * 3. 관광 타입 뱃지 표시
 * 4. 호버 효과 (scale, shadow)
 * 5. 클릭 시 상세페이지 이동
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - next/link: 클라이언트 사이드 네비게이션
 * - lib/types/tour.ts: TourItem 타입
 * - lib/types/stats.ts: TOUR_TYPE_MAP 상수
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TourItem } from "@/lib/types/tour";
import { TOUR_TYPE_MAP } from "@/lib/types/stats";

interface TourCardProps {
  tour: TourItem;
}

export function TourCard({ tour }: TourCardProps) {
  // 이미지 URL 결정 (firstimage 우선, 없으면 firstimage2)
  const imageUrl = tour.firstimage || tour.firstimage2;
  
  // 이미지 로딩 에러 상태 (클라이언트 사이드에서만 관리)
  const [imageError, setImageError] = useState(false);

  // 관광 타입 이름 가져오기
  const typeName = TOUR_TYPE_MAP[tour.contenttypeid] || "기타";

  // 주소 표시 (addr1 필수, addr2 있으면 함께 표시)
  const address = tour.addr2
    ? `${tour.addr1} ${tour.addr2}`
    : tour.addr1;

  // 플레이스홀더 SVG 컴포넌트 (항상 동일한 구조)
  const PlaceholderIcon = () => (
    <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
      <svg
        className="h-12 w-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );

  return (
    <Link
      href={`/places/${tour.contentid}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
      aria-label={`${tour.title} 상세보기 - ${address}`}
    >
      <div className="h-full rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus-within:ring-2 focus-within:ring-ring">
        {/* 썸네일 이미지 */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={tour.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => {
                // 이미지 로드 실패 시 플레이스홀더 표시
                setImageError(true);
              }}
            />
          ) : (
            <PlaceholderIcon />
          )}
        </div>

        {/* 카드 내용 */}
        <div className="p-4">
          {/* 관광 타입 뱃지 */}
          <div className="mb-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {typeName}
            </span>
          </div>

          {/* 관광지명 */}
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary">
            {tour.title}
          </h3>

          {/* 주소 */}
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {address}
          </p>
        </div>
      </div>
    </Link>
  );
}


/**
 * @file detail-info.tsx
 * @description 관광지 상세 정보 컴포넌트
 *
 * 관광지의 기본 정보를 표시하는 컴포넌트입니다.
 * 관광지명, 대표 이미지, 주소, 전화번호, 홈페이지, 개요, 관광 타입 뱃지를 표시합니다.
 *
 * 주요 기능:
 * 1. 관광지명 (대제목)
 * 2. 대표 이미지 표시 (Next.js Image 컴포넌트)
 * 3. 주소 표시 및 복사 기능 (클립보드 API)
 * 4. 전화번호 (클릭 시 전화 연결)
 * 5. 홈페이지 (외부 링크, 새 창 열기)
 * 6. 개요 (긴 설명문)
 * 7. 관광 타입 및 카테고리 뱃지
 * 8. 정보 없는 항목 숨김 처리
 *
 * @dependencies
 * - lib/types/tour.ts: TourDetail 타입
 * - lib/types/stats.ts: TOUR_TYPE_MAP 상수
 * - sonner: toast 함수 (주소 복사 알림)
 * - lucide-react: 아이콘
 * - next/image: 이미지 최적화
 * - components/ui/button: Button 컴포넌트
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Phone, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import type { TourDetail } from "@/lib/types/tour";
import { TOUR_TYPE_MAP } from "@/lib/types/stats";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DetailInfoProps {
  /** 관광지 상세 정보 */
  detail: TourDetail;
}

export function DetailInfo({ detail }: DetailInfoProps) {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 주소 조합 (addr1 필수, addr2 있으면 함께 표시)
  const address = detail.addr2
    ? `${detail.addr1} ${detail.addr2}`
    : detail.addr1;

  // 관광 타입 이름 가져오기
  const typeName = TOUR_TYPE_MAP[detail.contenttypeid] || "기타";

  // 대표 이미지 URL (firstimage 우선, 없으면 firstimage2)
  const imageUrl = detail.firstimage || detail.firstimage2;
  const showPlaceholder = !imageUrl || imageError;

  // 주소 복사 기능
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("주소가 복사되었습니다.");
      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("주소 복사에 실패했습니다.");
      console.error("주소 복사 실패:", error);
    }
  };

  // 플레이스홀더 SVG 컴포넌트
  const PlaceholderIcon = () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      <svg
        className="h-24 w-24"
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
    <div className="space-y-6">
      {/* 관광지명 */}
      <div>
        <h1 id="detail-info-heading" className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
          {detail.title}
        </h1>
      </div>

      {/* 대표 이미지 */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
        {showPlaceholder ? (
          <PlaceholderIcon />
        ) : (
          <Image
            src={imageUrl}
            alt={detail.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* 관광 타입 뱃지 */}
      <div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {typeName}
        </span>
      </div>

      {/* 정보 섹션 */}
      <div className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
        {/* 주소 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">주소</p>
            <p className="text-base leading-relaxed">{address}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="shrink-0 min-h-[44px] sm:min-h-[36px]"
            aria-label="주소 복사"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                복사
              </>
            )}
          </Button>
        </div>

        {/* 전화번호 */}
        {detail.tel && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="text-sm font-medium text-muted-foreground">전화번호</p>
            <a
              href={`tel:${detail.tel}`}
              className="flex items-center gap-2 text-base text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1.5 min-h-[44px] sm:min-h-[auto]"
              aria-label={`${detail.tel}로 전화하기`}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>{detail.tel}</span>
            </a>
          </div>
        )}

        {/* 홈페이지 */}
        {detail.homepage && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="text-sm font-medium text-muted-foreground">홈페이지</p>
            <a
              href={detail.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-base text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1.5 min-h-[44px] sm:min-h-[auto]"
              aria-label="홈페이지 열기 (새 창)"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="truncate max-w-xs">{detail.homepage}</span>
            </a>
          </div>
        )}

        {/* 개요 */}
        {detail.overview && (
          <div className="pt-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">개요</p>
            <p className="text-base leading-relaxed whitespace-pre-line text-foreground">
              {detail.overview}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


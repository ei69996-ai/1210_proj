/**
 * @file detail-gallery.tsx
 * @description 관광지 이미지 갤러리 컴포넌트
 *
 * 관광지의 이미지 목록을 갤러리 형태로 표시하는 컴포넌트입니다.
 * Swiper를 사용한 이미지 슬라이드 기능과 전체화면 모달을 제공합니다.
 *
 * 주요 기능:
 * 1. 이미지 목록 표시 (Swiper 슬라이드)
 * 2. 이미지 클릭 시 전체화면 모달
 * 3. 모달 내에서 이미지 슬라이드 및 네비게이션
 * 4. 이미지 없을 때 기본 이미지 표시
 * 5. Next.js Image 컴포넌트 사용 (최적화)
 * 6. 키보드 네비게이션 지원 (ESC, 화살표)
 *
 * @dependencies
 * - lib/types/tour.ts: TourImage 타입
 * - swiper: 이미지 슬라이드 라이브러리
 * - components/ui/dialog: Dialog 컴포넌트 (전체화면 모달)
 * - next/image: 이미지 최적화
 * - lucide-react: 아이콘
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import { cn } from "@/lib/utils";
import type { Swiper as SwiperType } from "swiper";
import type { TourImage } from "@/lib/types/tour";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Swiper CSS import
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface DetailGalleryProps {
  /** 관광지 이미지 목록 */
  images: TourImage[];
  /** 관광지명 (접근성용) */
  title?: string;
}

export function DetailGallery({ images, title = "관광지" }: DetailGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSwiper, setModalSwiper] = useState<SwiperType | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // 이미지 클릭 핸들러
  const handleImageClick = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  }, []);

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIndex(null);
    setModalSwiper(null);
  }, []);

  // 모달 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // 키보드 네비게이션 (ESC로 닫기, 화살표로 이동)
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();
      } else if (e.key === "ArrowLeft" && modalSwiper) {
        modalSwiper.slidePrev();
      } else if (e.key === "ArrowRight" && modalSwiper) {
        modalSwiper.slideNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, modalSwiper, handleCloseModal]);

  // 이미지 에러 처리
  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
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

  // 이미지가 없으면 컴포넌트를 렌더링하지 않음 (Hooks 호출 후에 체크)
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 섹션 제목 */}
      <div>
        <h2 id="detail-gallery-heading" className="text-2xl font-bold">이미지 갤러리</h2>
        <p className="text-sm text-muted-foreground mt-1">
          총 {images.length}개의 이미지
        </p>
      </div>

      {/* 메인 갤러리 (Swiper) */}
      <div className="relative rounded-lg border bg-card overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          keyboard={{
            enabled: true,
          }}
          loop={images.length > 1}
          spaceBetween={10}
          slidesPerView={1}
          className="w-full"
          aria-label={`${title} 이미지 갤러리`}
        >
          {images.map((image, index) => {
            const hasError = imageErrors.has(index);
            const imageUrl = image.originimgurl || image.smallimageurl;

            return (
              <SwiperSlide key={image.serialnum || index}>
                <div
                  className="relative aspect-video w-full cursor-pointer overflow-hidden bg-muted"
                  onClick={() => handleImageClick(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${title} 이미지 ${index + 1} - 클릭하여 전체화면으로 보기`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleImageClick(index);
                    }
                  }}
                >
                  {imageUrl && !hasError ? (
                    <Image
                      src={imageUrl}
                      alt={image.imgname || `${title} 이미지 ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                      quality={index === 0 ? 90 : 85}
                      onError={() => handleImageError(index)}
                    />
                  ) : (
                    <PlaceholderIcon />
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* 커스텀 네비게이션 버튼 */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="swiper-button-prev-custom absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2.5 sm:p-2 text-white transition-opacity hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="swiper-button-next-custom absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2.5 sm:p-2 text-white transition-opacity hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
              aria-label="다음 이미지"
            >
              <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
            </button>
          </>
        )}

        {/* 썸네일 그리드 (서브 이미지들) */}
        {images.length > 1 && (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {images.slice(0, 8).map((image, index) => {
                const hasError = imageErrors.has(index);
                const imageUrl = image.smallimageurl || image.originimgurl;
                const isSelected = selectedIndex === index;

                return (
                  <div
                    key={image.serialnum || index}
                    className={cn(
                      "relative aspect-square w-full cursor-pointer overflow-hidden rounded-md border-2 bg-muted transition-all hover:scale-105",
                      isSelected
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-transparent"
                    )}
                    onClick={() => handleImageClick(index)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${title} 썸네일 ${index + 1}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleImageClick(index);
                      }
                    }}
                  >
                      {imageUrl && !hasError ? (
                        <Image
                          src={imageUrl}
                          alt={image.imgname || `${title} 썸네일 ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, (max-width: 1200px) 12.5vw, 10vw"
                          loading="lazy"
                          quality={75}
                          onError={() => handleImageError(index)}
                        />
                      ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        <svg
                          className="h-8 w-8"
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
                    )}
                  </div>
                );
              })}
            </div>
            {images.length > 8 && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                +{images.length - 8}개의 이미지 더 보기
              </p>
            )}
          </div>
        )}
      </div>

      {/* 전체화면 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-7xl w-[calc(100%-2rem)] h-[calc(100vh-2rem)] p-0 gap-0"
          aria-label={`${title} 이미지 전체화면 보기`}
        >
          <div className="relative h-full w-full">
            {/* 닫기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 rounded-full bg-black/50 text-white hover:bg-black/70 min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px]"
              onClick={handleCloseModal}
              aria-label="모달 닫기"
            >
              <X className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
            </Button>

            {/* 모달 내 Swiper */}
            <Swiper
              modules={[Navigation, Pagination, Keyboard]}
              navigation={{
                prevEl: ".modal-swiper-button-prev",
                nextEl: ".modal-swiper-button-next",
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              keyboard={{
                enabled: true,
              }}
              loop={images.length > 1}
              spaceBetween={0}
              slidesPerView={1}
              initialSlide={selectedIndex ?? 0}
              onSwiper={setModalSwiper}
              onSlideChange={(swiper) => {
                // 모달 내 슬라이드 변경 시 selectedIndex 업데이트
                setSelectedIndex(swiper.realIndex);
              }}
              className="h-full w-full"
            >
              {images.map((image, index) => {
                const hasError = imageErrors.has(index);
                const imageUrl = image.originimgurl || image.smallimageurl;

                return (
                  <SwiperSlide key={image.serialnum || index}>
                    <div className="relative h-full w-full bg-black">
                      {imageUrl && !hasError ? (
                        <Image
                          src={imageUrl}
                          alt={image.imgname || `${title} 이미지 ${index + 1}`}
                          fill
                          className="object-contain"
                          sizes="100vw"
                          priority={index === selectedIndex}
                          quality={95}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-black text-white">
                          <PlaceholderIcon />
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* 모달 네비게이션 버튼 */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="modal-swiper-button-prev absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-3.5 sm:p-3 text-white transition-opacity hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
                  aria-label="이전 이미지"
                >
                  <ChevronLeft className="h-6 w-6 sm:h-5 sm:w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="modal-swiper-button-next absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-3.5 sm:p-3 text-white transition-opacity hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
                  aria-label="다음 이미지"
                >
                  <ChevronRight className="h-6 w-6 sm:h-5 sm:w-5" aria-hidden="true" />
                </button>
              </>
            )}

            {/* 이미지 인덱스 표시 */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
                {modalSwiper
                  ? modalSwiper.realIndex + 1
                  : selectedIndex !== null
                    ? selectedIndex + 1
                    : 1}{" "}
                / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


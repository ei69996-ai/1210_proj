/**
 * @file detail-map.tsx
 * @description 관광지 상세페이지 지도 컴포넌트
 *
 * 단일 관광지의 위치를 네이버 지도에 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 단일 관광지 위치를 네이버 지도에 표시
 * 2. 마커 1개 표시 (해당 관광지)
 * 3. 인포윈도우 표시 (관광지명, 주소)
 * 4. "길찾기" 버튼 (네이버 지도 앱/웹 연동)
 * 5. 좌표 정보 표시 (토글로 표시/숨김)
 *
 * @dependencies
 * - 네이버 지도 API v3 (NCP): app/layout.tsx에서 스크립트 로드
 * - lib/utils/coordinate.ts: 좌표 변환 유틸리티
 * - lib/types/tour.ts: TourDetail 타입
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { TourDetail } from "@/lib/types/tour";
import { katecToWgs84 } from "@/lib/utils/coordinate";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Navigation, Eye, EyeOff } from "lucide-react";

// 네이버 지도 API 타입은 components/naver-map.tsx에서 선언됨

interface DetailMapProps {
  /** 관광지 상세 정보 */
  detail: TourDetail;
}

export function DetailMap({ detail }: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 좌표 변환 및 유효성 검증
  useEffect(() => {
    if (!detail.mapx || !detail.mapy) {
      setError("좌표 정보가 없습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const coords = katecToWgs84(detail.mapx, detail.mapy);
      setCoordinates(coords);
    } catch (error) {
      console.error("좌표 변환 실패:", error);
      setError("좌표를 변환할 수 없습니다.");
      setIsLoading(false);
    }
  }, [detail.mapx, detail.mapy]);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !coordinates) return;

    // 네이버 지도 API 로드 확인
    const checkNaverMaps = () => {
      if (typeof window !== "undefined" && window.naver?.maps) {
        return true;
      }
      return false;
    };

    // 네이버 지도 API가 로드될 때까지 대기 (최대 10초)
    let retryCount = 0;
    const maxRetries = 100; // 10초 (100 * 100ms)

    const initMap = () => {
      if (!checkNaverMaps()) {
        retryCount++;
        if (retryCount >= maxRetries) {
          setError("지도를 불러올 수 없습니다. 네이버 지도 API를 확인해주세요.");
          setIsLoading(false);
          return;
        }
        initTimeoutRef.current = setTimeout(initMap, 100);
        return;
      }

      try {
        const { maps } = window.naver;

        // 지도 생성
        const map = new maps.Map(mapRef.current, {
          center: new maps.LatLng(coordinates.lat, coordinates.lng),
          zoom: 15, // 상세 위치 표시에 적합한 줌 레벨
        });

        mapInstanceRef.current = map;

        // 마커 생성
        const markerIcon = `
          <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 11.045 16 24 16 24s16-12.955 16-24C32 7.163 24.837 0 16 0z" fill="#EF4444" stroke="#ffffff" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#ffffff"/>
          </svg>
        `;

        const marker = new maps.Marker({
          position: new maps.LatLng(coordinates.lat, coordinates.lng),
          map: map,
          title: detail.title,
          icon: {
            content: markerIcon,
            size: new maps.Size(32, 40),
            anchor: new maps.Point(16, 40),
          },
        });

        markerRef.current = marker;

        // 인포윈도우 생성
        const address = detail.addr2 ? `${detail.addr1} ${detail.addr2}` : detail.addr1;
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const infoContent = `
          <div style="padding: ${isMobile ? "10px" : "12px"}; min-width: ${isMobile ? "180px" : "200px"}; max-width: ${isMobile ? "250px" : "300px"};">
            <h3 style="margin: 0 0 ${isMobile ? "6px" : "8px"} 0; font-size: ${isMobile ? "14px" : "16px"}; font-weight: 600; line-height: 1.4; word-break: keep-all;">
              ${detail.title}
            </h3>
            <p style="margin: 0; font-size: ${isMobile ? "12px" : "14px"}; color: #666; line-height: 1.4; word-break: keep-all;">
              ${address}
            </p>
          </div>
        `;

        const infoWindow = new maps.InfoWindow({
          content: infoContent,
          maxWidth: isMobile ? 250 : 300,
        });

        infoWindowRef.current = infoWindow;

        // 마커 클릭 시 인포윈도우 표시
        if (maps.event && typeof maps.event.addListener === "function") {
          maps.event.addListener(marker, "click", () => {
            if (infoWindowRef.current) {
              infoWindowRef.current.open(map, marker);
            }
          });

          // 초기 인포윈도우 표시
          infoWindow.open(map, marker);
        }

        setIsLoading(false);
        setError(null);
      } catch (error) {
        console.error("네이버 지도 초기화 실패:", error);
        setError("지도를 불러오는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    initMap();

    // cleanup
    return () => {
      // 타임아웃 정리
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      // 마커 및 인포윈도우 정리
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [coordinates, detail.title, detail.addr1, detail.addr2]);

  // 길찾기 버튼 클릭 핸들러
  const handleDirections = () => {
    if (!coordinates) return;

    const directionsUrl = `https://map.naver.com/v5/directions/${coordinates.lat},${coordinates.lng}`;
    window.open(directionsUrl, "_blank", "noopener,noreferrer");
  };

  // 좌표가 없으면 컴포넌트를 렌더링하지 않음
  if (!detail.mapx || !detail.mapy) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 섹션 제목 */}
      <div>
        <h2 id="detail-map-heading" className="text-2xl font-bold">위치</h2>
      </div>

      {/* 지도 컨테이너 */}
      <div className="relative w-full rounded-lg border overflow-hidden bg-muted h-[300px] sm:h-[400px] md:h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <Loading text="지도를 불러오는 중..." />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center p-4">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  window.location.reload();
                }}
              >
                새로고침
              </Button>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px]" />
      </div>

      {/* 버튼 영역 */}
      {!error && coordinates && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* 길찾기 버튼 */}
          <Button
            onClick={handleDirections}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px]"
            aria-label="네이버 지도에서 길찾기"
          >
            <Navigation className="mr-2 h-4 w-4" aria-hidden="true" />
            길찾기
          </Button>

          {/* 좌표 정보 토글 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCoordinates(!showCoordinates)}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px]"
              aria-label={showCoordinates ? "좌표 정보 숨기기" : "좌표 정보 보기"}
            >
              {showCoordinates ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" aria-hidden="true" />
                  좌표 숨기기
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                  좌표 보기
                </>
              )}
            </Button>
            {showCoordinates && coordinates && (
              <p className="text-sm text-muted-foreground">
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


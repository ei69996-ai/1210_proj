/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * 네이버 지도 API v3를 사용하여 관광지 목록을 지도에 마커로 표시합니다.
 *
 * 주요 기능:
 * 1. 네이버 지도 초기화 및 표시
 * 2. 관광지 목록을 마커로 표시
 * 3. 마커 클릭 시 인포윈도우 표시
 * 4. 선택된 관광지로 지도 이동 및 마커 강조
 * 5. 지도 컨트롤 (줌 인/아웃, 지도 유형 선택)
 *
 * @dependencies
 * - 네이버 지도 API v3 (NCP): app/layout.tsx에서 스크립트 로드
 * - lib/utils/coordinate.ts: 좌표 변환 유틸리티
 * - lib/types/tour.ts: TourItem 타입
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { TourItem } from "@/lib/types/tour";
import { katecToWgs84 } from "@/lib/utils/coordinate";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Map as MapIcon, Satellite, Navigation } from "lucide-react";

/**
 * 관광 타입별 마커 색상 매핑
 */
const MARKER_COLOR_MAP: Record<string, string> = {
  "12": "#3B82F6", // 관광지: 파란색
  "14": "#8B5CF6", // 문화시설: 보라색
  "15": "#EF4444", // 축제/행사: 빨간색
  "25": "#10B981", // 여행코스: 초록색
  "28": "#F59E0B", // 레포츠: 주황색
  "32": "#14B8A6", // 숙박: 청록색
  "38": "#EC4899", // 쇼핑: 분홍색
  "39": "#FBBF24", // 음식점: 노란색
} as const;

const DEFAULT_MARKER_COLOR = "#6B7280"; // 기타: 회색

// 네이버 지도 API 타입 정의
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: {
          center: any;
          zoom: number;
        }) => {
          setCenter: (center: any) => void;
          setZoom: (zoom: number) => void;
          getCenter: () => { lat: () => number; lng: () => number };
          getZoom: () => number;
          setMapTypeId: (type: string) => void;
        };
        Marker: new (options: {
          position: any;
          map: any;
          title?: string;
          icon?: {
            content: string;
            size?: { width: number; height: number };
            anchor?: { x: number; y: number };
          };
        }) => {
          setMap: (map: any) => void;
          setPosition: (position: any) => void;
          setIcon: (icon: any) => void;
          setTitle: (title: string) => void;
          getTitle: () => string;
        };
        InfoWindow: new (options: {
          content: string;
          maxWidth?: number;
          backgroundColor?: string;
          borderColor?: string;
          anchorColor?: string;
        }) => {
          open: (map: any, marker: any) => void;
          close: () => void;
          setContent: (content: string) => void;
        };
        LatLng: new (lat: number, lng: number) => {
          lat: () => number;
          lng: () => number;
        };
        Size: new (width: number, height: number) => {
          width: number;
          height: number;
        };
        Point: new (x: number, y: number) => {
          x: number;
          y: number;
        };
        MapTypeId: {
          NORMAL: string;
          SATELLITE: string;
          HYBRID: string;
        };
        event: {
          addListener: (target: any, event: string, handler: () => void) => void;
          removeListener: (target: any, event: string, handler: () => void) => void;
        };
      };
    };
  }
}

interface NaverMapProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 선택된 관광지 ID */
  selectedTourId?: string;
  /** 관광지 선택 핸들러 */
  onTourSelect?: (tourId: string) => void;
  /** 호버된 관광지 ID */
  hoveredTourId?: string | null;
  /** 초기 중심 좌표 (선택 사항) */
  initialCenter?: { lat: number; lng: number };
  /** 초기 줌 레벨 (선택 사항, 기본값: 10) */
  initialZoom?: number;
  /** 지도 높이 (기본값: 600px) */
  height?: string;
  /** 필터 키 (필터 변경 시 마커 초기화용) */
  filterKey?: string;
}

export function NaverMap({
  tours,
  selectedTourId,
  onTourSelect,
  hoveredTourId,
  initialCenter,
  initialZoom = 10,
  height = "600px",
  filterKey,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const markerMapRef = useRef<Map<string, any>>(new Map()); // contentid -> marker 매핑
  const infoWindowRef = useRef<any>(null);
  const hoverInfoWindowRef = useRef<any>(null); // 호버 인포윈도우
  const prevFilterKeyRef = useRef<string | undefined>(filterKey);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"NORMAL" | "SATELLITE">("NORMAL");
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current) return;

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

        // 초기 중심 좌표 결정
        let center: { lat: number; lng: number };
        if (initialCenter) {
          center = initialCenter;
        } else if (tours.length > 0) {
          // 첫 번째 관광지의 좌표를 중심으로 설정
          try {
            const firstTour = tours[0];
            const coords = katecToWgs84(firstTour.mapx, firstTour.mapy);
            center = coords;
          } catch (coordError) {
            console.warn("좌표 변환 실패, 기본 좌표 사용:", coordError);
            // 기본값: 서울 시청
            center = { lat: 37.5665, lng: 126.9780 };
          }
        } else {
          // 기본값: 서울 시청
          center = { lat: 37.5665, lng: 126.9780 };
        }

        // 지도 생성
        const map = new maps.Map(mapRef.current, {
          center: new maps.LatLng(center.lat, center.lng),
          zoom: initialZoom,
        });

        mapInstanceRef.current = map;
        setIsLoading(false);
        setError(null);

        // 관광지가 있으면 마커 표시
        if (tours.length > 0) {
          updateMarkers(map, tours);
        }
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
      markersRef.current.forEach((marker) => {
        if (marker) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
      markerMapRef.current.clear();
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      if (hoverInfoWindowRef.current) {
        hoverInfoWindowRef.current.close();
        hoverInfoWindowRef.current = null;
      }
    };
  }, []); // 초기화는 한 번만

  // 필터 변경 감지 및 마커 초기화
  useEffect(() => {
    if (filterKey !== prevFilterKeyRef.current) {
      // 필터가 변경되었으면 모든 마커 초기화
      if (mapInstanceRef.current) {
        markersRef.current.forEach((marker) => {
          if (marker) {
            marker.setMap(null);
          }
        });
        markersRef.current = [];
        markerMapRef.current.clear();
      }
      prevFilterKeyRef.current = filterKey;
    }
  }, [filterKey]);

  // 관광지 목록 변경 시 마커 업데이트 (기존 마커 유지하면서 새 마커 추가)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 기존에 표시된 관광지 ID 목록
    const existingTourIds = new Set(markerMapRef.current.keys());
    
    // 새로 추가할 관광지만 필터링
    const newTours = tours.filter(
      (tour) => !existingTourIds.has(tour.contentid)
    );

    // 새 관광지가 있으면 마커 추가
    if (newTours.length > 0) {
      addMarkers(mapInstanceRef.current, newTours);
    }
  }, [tours]);

  // 선택된 관광지 변경 시 지도 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedTourId) return;

    const selectedTour = tours.find((tour) => tour.contentid === selectedTourId);
    if (!selectedTour) return;

    try {
      const coords = katecToWgs84(selectedTour.mapx, selectedTour.mapy);
      const { maps } = window.naver;

      // 지도 중심 이동
      mapInstanceRef.current.setCenter(new maps.LatLng(coords.lat, coords.lng));
      mapInstanceRef.current.setZoom(15); // 선택 시 줌 인

      // 해당 마커 강조 (인포윈도우 열기)
      const marker = markerMapRef.current.get(selectedTourId);
      if (marker) {
        const infoContent = createInfoWindowContent(selectedTour);
        
        // 기존 인포윈도우 닫기
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        
        // 새 인포윈도우 생성 및 열기
        const { maps } = window.naver;
        const infoWindow = new maps.InfoWindow({
          content: infoContent,
          maxWidth: typeof window !== "undefined" && window.innerWidth < 768 ? 250 : 300,
        });
        
        infoWindowRef.current = infoWindow;
        infoWindow.open(mapInstanceRef.current, marker);
      }
    } catch (error) {
      console.error("선택된 관광지로 이동 실패:", error);
    }
  }, [selectedTourId, tours]);

  // 호버된 관광지 변경 시 마커 강조
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 기존 호버 인포윈도우 닫기
    if (hoverInfoWindowRef.current) {
      hoverInfoWindowRef.current.close();
      hoverInfoWindowRef.current = null;
    }

    if (hoveredTourId) {
      const hoveredTour = tours.find((tour) => tour.contentid === hoveredTourId);
      if (!hoveredTour) return;

      const marker = markerMapRef.current.get(hoveredTourId);
      if (marker) {
        try {
          // 호버된 마커에 간단한 인포윈도우 표시
          const hoverContent = `
            <div style="padding: 8px; min-width: 150px; max-width: 200px;">
              <h4 style="margin: 0; font-size: 14px; font-weight: 600; line-height: 1.3;">
                ${hoveredTour.title}
              </h4>
            </div>
          `;
          
          const { maps } = window.naver;
          const hoverInfoWindow = new maps.InfoWindow({
            content: hoverContent,
            maxWidth: 200,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#3B82F6",
            anchorColor: "#3B82F6",
          });
          
          hoverInfoWindowRef.current = hoverInfoWindow;
          hoverInfoWindow.open(mapInstanceRef.current, marker);
        } catch (error) {
          console.error("호버 인포윈도우 표시 실패:", error);
        }
      }
    }
  }, [hoveredTourId, tours]);

  // 마커 추가 함수 (기존 마커 유지하면서 새 마커만 추가)
  const addMarkers = (map: any, tourList: TourItem[]) => {
    const { maps } = window.naver;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // 새 마커 생성
    tourList.forEach((tour) => {
      // 이미 존재하는 마커는 건너뛰기
      if (markerMapRef.current.has(tour.contentid)) {
        return;
      }

      try {
        const coords = katecToWgs84(tour.mapx, tour.mapy);
        const markerIcon = createMarkerIcon(tour.contenttypeid);

        const marker = new maps.Marker({
          position: new maps.LatLng(coords.lat, coords.lng),
          map: map,
          title: tour.contentid,
          icon: {
            content: markerIcon,
            size: new maps.Size(32, 40),
            anchor: new maps.Point(16, 40),
          },
        });

        // 마커 클릭 이벤트
        maps.event.addListener(marker, "click", () => {
          if (onTourSelect) {
            onTourSelect(tour.contentid);
          }

          // 인포윈도우 표시
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }

          const infoContent = createInfoWindowContent(tour);
          const infoWindow = new maps.InfoWindow({
            content: infoContent,
            maxWidth: isMobile ? 250 : 300,
          });

          infoWindowRef.current = infoWindow;
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
        markerMapRef.current.set(tour.contentid, marker);
      } catch (error) {
        console.error(`마커 생성 실패 (contentId: ${tour.contentid}):`, error);
        // 일부 마커 생성 실패해도 나머지 마커는 계속 생성
      }
    });
  };

  // 모든 마커 업데이트 함수 (초기화 또는 전체 교체 시 사용)
  const updateMarkers = (map: any, tourList: TourItem[]) => {
    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      if (marker) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
    markerMapRef.current.clear();

    // 새 마커 생성
    addMarkers(map, tourList);
  };

  // 마커 아이콘 생성 (타입별 색상)
  const createMarkerIcon = (contentTypeId: string): string => {
    const color = MARKER_COLOR_MAP[contentTypeId] || DEFAULT_MARKER_COLOR;
    
    // SVG 기반 마커 아이콘 (원형 핀 모양)
    return `
      <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11.045 16 24 16 24s16-12.955 16-24C32 7.163 24.837 0 16 0z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="#ffffff"/>
      </svg>
    `;
  };

  // 인포윈도우 콘텐츠 생성
  const createInfoWindowContent = (tour: TourItem): string => {
    const address = tour.addr2 ? `${tour.addr1} ${tour.addr2}` : tour.addr1;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    return `
      <div style="padding: ${isMobile ? "10px" : "12px"}; min-width: ${isMobile ? "180px" : "200px"}; max-width: ${isMobile ? "250px" : "300px"};">
        <h3 style="margin: 0 0 ${isMobile ? "6px" : "8px"} 0; font-size: ${isMobile ? "14px" : "16px"}; font-weight: 600; line-height: 1.4; word-break: keep-all;">
          ${tour.title}
        </h3>
        <p style="margin: 0 0 ${isMobile ? "10px" : "12px"} 0; font-size: ${isMobile ? "12px" : "14px"}; color: #666; line-height: 1.4; word-break: keep-all;">
          ${address}
        </p>
        <a 
          href="/places/${tour.contentid}" 
          style="display: inline-block; padding: ${isMobile ? "5px 10px" : "6px 12px"}; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: ${isMobile ? "12px" : "14px"}; transition: background-color 0.2s;"
          onmouseover="this.style.backgroundColor='#0056b3'"
          onmouseout="this.style.backgroundColor='#007bff'"
          onclick="event.stopPropagation();"
        >
          상세보기
        </a>
      </div>
    `;
  };

  // 줌 인
  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(currentZoom + 1);
  };

  // 줌 아웃
  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(currentZoom - 1);
  };

  // 지도 유형 변경
  const handleMapTypeChange = () => {
    if (!mapInstanceRef.current) return;
    const { maps } = window.naver;
    const newType = mapType === "NORMAL" ? "SATELLITE" : "NORMAL";
    setMapType(newType);
    mapInstanceRef.current.setMapTypeId(
      newType === "NORMAL" ? maps.MapTypeId.NORMAL : maps.MapTypeId.SATELLITE
    );
  };

  // 현재 위치로 이동
  const handleCurrentLocation = () => {
    if (!mapInstanceRef.current) return;

    if (!navigator.geolocation) {
      setError("이 브라우저는 위치 서비스를 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { maps } = window.naver;
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // 지도 중심 이동
        mapInstanceRef.current.setCenter(new maps.LatLng(lat, lng));
        mapInstanceRef.current.setZoom(15);
        setError(null);
      },
      (error) => {
        let errorMessage = "현재 위치를 가져올 수 없습니다.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "위치 권한이 거부되었습니다.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "위치 정보를 사용할 수 없습니다.";
            break;
          case error.TIMEOUT:
            errorMessage = "위치 요청 시간이 초과되었습니다.";
            break;
        }
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="relative w-full" style={{ height, minHeight: height }}>
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
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: height }} />
      
      {/* 지도 컨트롤 */}
      {!error && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          {/* 줌 컨트롤 */}
          <div className="flex flex-col gap-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="rounded-b-none hover:bg-muted/50 h-11 w-11"
              aria-label="줌 인"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="rounded-t-none hover:bg-muted/50 h-11 w-11"
              aria-label="줌 아웃"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
          </div>

          {/* 지도 유형 선택 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMapTypeChange}
            className="bg-white/95 backdrop-blur-sm shadow-lg border border-border/50 hover:bg-muted/50 h-11 w-11"
            aria-label={mapType === "NORMAL" ? "스카이뷰로 전환" : "일반 지도로 전환"}
          >
            {mapType === "NORMAL" ? (
              <Satellite className="h-5 w-5" />
            ) : (
              <MapIcon className="h-5 w-5" />
            )}
          </Button>

          {/* 현재 위치 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCurrentLocation}
            className="bg-white/95 backdrop-blur-sm shadow-lg border border-border/50 hover:bg-muted/50 h-11 w-11"
            aria-label="현재 위치로 이동"
          >
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}


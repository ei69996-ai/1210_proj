/**
 * @file detail-pet-tour.tsx
 * @description 반려동물 동반 여행 정보 컴포넌트
 *
 * 관광지의 반려동물 동반 여행 정보를 표시하는 컴포넌트입니다.
 * 반려동물 동반 가능 여부, 크기 제한, 입장 가능 장소, 추가 요금, 기타 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 반려동물 동반 가능 여부 표시 (chkpetleash)
 * 2. 반려동물 크기 제한 정보 (chkpetsize)
 * 3. 입장 가능 장소 (chkpetplace: 실내/실외/모두)
 * 4. 추가 요금 정보 (chkpetfee)
 * 5. 기타 반려동물 정보 (petinfo) - 주의사항으로 강조
 * 6. 아이콘 및 뱃지 디자인
 * 7. 정보 없는 항목 숨김 처리
 *
 * @dependencies
 * - lib/types/tour.ts: PetTourInfo 타입
 * - lucide-react: 아이콘
 * - components/ui: shadcn/ui 컴포넌트
 */

"use client";

import {
  Dog,
  PawPrint,
  Info,
  DollarSign,
  MapPin,
  Home,
  TreePine,
  AlertTriangle,
} from "lucide-react";
import type { PetTourInfo } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface DetailPetTourProps {
  /** 반려동물 동반 여행 정보 */
  petInfo: PetTourInfo;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

function InfoItem({ icon, label, value, className }: InfoItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-start",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-[120px]">
        <div className="text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="text-base leading-relaxed text-foreground flex-1">
        {value}
      </div>
    </div>
  );
}

/**
 * 반려동물 크기 뱃지 생성
 */
function PetSizeBadge({ size }: { size: string }) {
  const sizeMap: Record<string, { label: string; color: string }> = {
    소형: { label: "소형견", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    중형: { label: "중형견", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    대형: { label: "대형견", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  };

  const sizeInfo = sizeMap[size] || { label: size, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
        sizeInfo.color
      )}
    >
      <PawPrint className="h-3 w-3" aria-hidden="true" />
      {sizeInfo.label}
    </span>
  );
}

/**
 * 입장 가능 장소 아이콘 및 텍스트
 */
function PetPlaceIcon({ place }: { place: string }) {
  const placeMap: Record<string, { icons: React.ReactNode[]; label: string }> = {
    실내: {
      icons: [<Home key="home" className="h-4 w-4" />],
      label: "실내 입장 가능",
    },
    실외: {
      icons: [<TreePine key="tree" className="h-4 w-4" />],
      label: "실외 입장 가능",
    },
    모두: {
      icons: [
        <Home key="home" className="h-4 w-4" />,
        <TreePine key="tree" className="h-4 w-4" />,
      ],
      label: "실내/실외 모두 입장 가능",
    },
  };

  const placeInfo = placeMap[place] || {
    icons: [<MapPin key="map" className="h-4 w-4" />],
    label: place,
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-muted-foreground" aria-hidden="true">
        {placeInfo.icons}
      </div>
      <span>{placeInfo.label}</span>
    </div>
  );
}

export function DetailPetTour({ petInfo }: DetailPetTourProps) {
  // 반려동물 동반 가능 여부 확인 (chkpetleash === "Y"일 때만 섹션 표시)
  const isPetFriendly = petInfo.chkpetleash === "Y";

  // 표시할 필드 정의
  const fields: Array<{
    key: keyof PetTourInfo;
    label: string;
    icon: React.ReactNode;
    render?: (value: string) => React.ReactNode;
  }> = [
    {
      key: "chkpetsize",
      label: "반려동물 크기",
      icon: <Dog className="h-4 w-4" />,
      render: (value) => {
        // 크기 정보가 여러 개일 수 있음 (예: "소형, 중형")
        const sizes = value.split(/[,，]/).map((s) => s.trim());
        return (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size, index) => (
              <PetSizeBadge key={index} size={size} />
            ))}
          </div>
        );
      },
    },
    {
      key: "chkpetplace",
      label: "입장 가능 장소",
      icon: <MapPin className="h-4 w-4" />,
      render: (value) => <PetPlaceIcon place={value} />,
    },
    {
      key: "chkpetfee",
      label: "추가 요금",
      icon: <DollarSign className="h-4 w-4" />,
    },
  ];

  // 값이 있는 필드만 필터링
  const fieldsWithValues = fields
    .filter((field) => {
      const value = petInfo[field.key];
      return value && value.trim() !== "";
    })
    .map((field) => {
      const value = petInfo[field.key] as string;
      return {
        ...field,
        value: field.render ? field.render(value) : value,
      };
    });

  // 반려동물 동반 불가능하거나 정보가 전혀 없는 경우 섹션 숨김
  if (!isPetFriendly || fieldsWithValues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 섹션 제목 */}
      <div className="flex items-center gap-2">
        <h2 id="detail-pet-tour-heading" className="text-2xl font-bold leading-tight">
          반려동물 정보
        </h2>
        <span
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
          aria-label="반려동물 동반 가능"
        >
          <PawPrint className="h-4 w-4" aria-hidden="true" />
          <span>🐾 동반 가능</span>
        </span>
      </div>

      {/* 반려동물 정보 카드 */}
      <div className="rounded-lg border bg-card p-4 sm:p-6">
        {/* 그리드 레이아웃: 모바일 1열, 데스크톱 2열 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fieldsWithValues.map((field) => (
            <InfoItem
              key={field.key}
              icon={field.icon}
              label={field.label}
              value={field.value}
            />
          ))}
        </div>
      </div>

      {/* 주의사항 (petinfo) */}
      {petInfo.petinfo && petInfo.petinfo.trim() !== "" && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-4"
          role="alert"
          aria-labelledby="pet-warning-title"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1 space-y-1">
              <h3
                id="pet-warning-title"
                className="text-sm font-semibold text-amber-900 dark:text-amber-100"
              >
                주의사항
              </h3>
              <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-200 whitespace-pre-line">
                {petInfo.petinfo}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


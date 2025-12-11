/**
 * @file detail-intro.tsx
 * @description 관광지 운영 정보 컴포넌트
 *
 * 관광지의 운영 정보를 표시하는 컴포넌트입니다.
 * 관광지 타입별로 다른 운영 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 운영시간/개장시간
 * 2. 휴무일
 * 3. 이용요금
 * 4. 주차 가능 여부
 * 5. 문의처
 * 6. 체험 프로그램 (관광지)
 * 7. 반려동물 동반 가능 여부
 * 8. 타입별 추가 정보 (문화시설, 축제, 레포츠, 숙박, 음식점)
 * 9. 정보 없는 항목 숨김 처리
 *
 * @dependencies
 * - lib/types/tour.ts: TourIntro 타입
 * - lucide-react: 아이콘
 * - components/ui: shadcn/ui 컴포넌트
 */

"use client";

import {
  Clock,
  Calendar,
  DollarSign,
  Car,
  Phone,
  Users,
  Baby,
  Dog,
  Info,
  ExternalLink,
  CalendarDays,
  UtensilsCrossed,
  Bed,
  Dumbbell,
  Music,
  Building2,
} from "lucide-react";
import type { TourIntro } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface DetailIntroProps {
  /** 관광지 운영 정보 */
  intro: TourIntro;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
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
      <p className="text-base leading-relaxed text-foreground flex-1">
        {value}
      </p>
    </div>
  );
}

export function DetailIntro({ intro }: DetailIntroProps) {
  const { contenttypeid } = intro;

  // 공통 필드
  const commonFields: Array<{
    key: keyof TourIntro;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "usetime",
      label: "운영시간",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      key: "restdate",
      label: "휴무일",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      key: "infocenter",
      label: "문의처",
      icon: <Phone className="h-4 w-4" />,
    },
    {
      key: "parking",
      label: "주차",
      icon: <Car className="h-4 w-4" />,
    },
    {
      key: "chkpet",
      label: "반려동물 동반",
      icon: <Dog className="h-4 w-4" />,
    },
  ];

  // 타입별 필드
  const typeSpecificFields: Array<{
    key: keyof TourIntro;
    label: string;
    icon: React.ReactNode;
  }> = [];

  if (contenttypeid === "12") {
    // 관광지
    typeSpecificFields.push(
      {
        key: "expguide",
        label: "체험안내",
        icon: <Info className="h-4 w-4" />,
      },
      {
        key: "expagerange",
        label: "체험가능연령",
        icon: <Users className="h-4 w-4" />,
      }
    );
  } else if (contenttypeid === "14") {
    // 문화시설
    typeSpecificFields.push(
      {
        key: "usefee",
        label: "이용요금",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        key: "usetimeculture",
        label: "관람시간",
        icon: <Clock className="h-4 w-4" />,
      },
      {
        key: "restdateculture",
        label: "휴관일",
        icon: <Calendar className="h-4 w-4" />,
      }
    );
  } else if (contenttypeid === "15") {
    // 축제/행사
    typeSpecificFields.push(
      {
        key: "playtime",
        label: "공연시간",
        icon: <Music className="h-4 w-4" />,
      },
      {
        key: "eventstartdate",
        label: "행사기간",
        icon: <CalendarDays className="h-4 w-4" />,
      },
      {
        key: "eventplace",
        label: "행사장소",
        icon: <Building2 className="h-4 w-4" />,
      },
      {
        key: "eventhomepage",
        label: "행사홈페이지",
        icon: <ExternalLink className="h-4 w-4" />,
      }
    );
  } else if (contenttypeid === "28") {
    // 레포츠
    typeSpecificFields.push(
      {
        key: "usefeeleports",
        label: "이용요금",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        key: "usetimeleports",
        label: "이용시간",
        icon: <Clock className="h-4 w-4" />,
      }
    );
  } else if (contenttypeid === "32") {
    // 숙박
    typeSpecificFields.push(
      {
        key: "checkintime",
        label: "체크인",
        icon: <Bed className="h-4 w-4" />,
      },
      {
        key: "checkouttime",
        label: "체크아웃",
        icon: <Bed className="h-4 w-4" />,
      }
    );
  } else if (contenttypeid === "39") {
    // 음식점
    typeSpecificFields.push(
      {
        key: "firstmenu",
        label: "대표메뉴",
        icon: <UtensilsCrossed className="h-4 w-4" />,
      },
      {
        key: "treatmenu",
        label: "취급메뉴",
        icon: <UtensilsCrossed className="h-4 w-4" />,
      },
      {
        key: "opentimefood",
        label: "영업시간",
        icon: <Clock className="h-4 w-4" />,
      },
      {
        key: "restdatefood",
        label: "휴무일",
        icon: <Calendar className="h-4 w-4" />,
      }
    );
  }

  // 모든 필드 합치기
  const allFields = [...commonFields, ...typeSpecificFields];

  // 값이 있는 필드만 필터링 및 특수 처리
  const fieldsWithValues = allFields
    .filter((field) => {
      // 행사기간은 eventstartdate와 eventenddate를 함께 확인
      if (field.key === "eventstartdate") {
        return !!(intro.eventstartdate || intro.eventenddate);
      }
      const value = intro[field.key];
      return value && value.trim() !== "";
    })
    .map((field) => {
      // 행사기간을 시작일~종료일로 포맷팅
      if (field.key === "eventstartdate" && contenttypeid === "15") {
        const startDate = intro.eventstartdate || "";
        const endDate = intro.eventenddate || "";
        if (startDate && endDate) {
          return {
            ...field,
            value: `${startDate} ~ ${endDate}`,
          };
        } else if (startDate) {
          return {
            ...field,
            value: startDate,
          };
        } else if (endDate) {
          return {
            ...field,
            value: endDate,
          };
        }
      }
      return {
        ...field,
        value: intro[field.key] as string,
      };
    });

  // 운영 정보가 전혀 없는 경우 섹션 숨김
  if (fieldsWithValues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 섹션 제목 */}
      <div>
        <h2 id="detail-intro-heading" className="text-2xl font-bold leading-tight">
          운영 정보
        </h2>
      </div>

      {/* 운영 정보 카드 */}
      <div className="rounded-lg border bg-card p-4 sm:p-6">
        {/* 그리드 레이아웃: 모바일 1열, 데스크톱 2열 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fieldsWithValues.map((field) => {
            const value = field.value || "";

            // 행사홈페이지는 링크로 표시
            if (field.key === "eventhomepage" && value) {
              return (
                <div
                  key={field.key}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="text-muted-foreground" aria-hidden="true">
                      {field.icon}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {field.label}
                    </p>
                  </div>
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-base text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1.5 min-h-[44px] sm:min-h-[auto]"
                    aria-label={`${field.label} 열기 (새 창)`}
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    <span className="truncate max-w-xs">{value}</span>
                  </a>
                </div>
              );
            }

            return (
              <InfoItem
                key={field.key}
                icon={field.icon}
                label={field.label}
                value={value}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}


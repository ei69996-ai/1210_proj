/**
 * @file region-chart.tsx
 * @description 지역별 관광지 분포 차트 컴포넌트
 *
 * 통계 대시보드 페이지에서 지역별 관광지 분포를 Bar Chart로 시각화하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수를 Bar Chart로 표시
 * 2. 바 클릭 시 해당 지역의 관광지 목록 페이지로 이동
 * 3. 호버 시 정확한 개수 표시 (Tooltip)
 * 4. 반응형 디자인 (모바일/태블릿/데스크톱)
 * 5. 다크/라이트 모드 지원
 * 6. 로딩 상태 (Skeleton UI)
 * 7. 접근성 개선 (ARIA 라벨, 키보드 네비게이션)
 *
 * @dependencies
 * - recharts: BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
 * - components/ui/chart: ChartContainer, ChartTooltip, ChartTooltipContent
 * - components/ui/skeleton: Skeleton 컴포넌트
 * - lib/types/stats: RegionStats 타입
 * - next/navigation: useRouter 훅
 */

"use client";

import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { RegionStats } from "@/lib/types/stats";

interface RegionChartProps {
  data: RegionStats[] | null;
  isLoading?: boolean;
}

/**
 * 숫자 포맷팅 함수 (천 단위 구분)
 * @param num 숫자
 * @returns 포맷팅된 문자열 (예: "1,234,567")
 */
function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

/**
 * 지역별 관광지 분포 차트 컴포넌트
 */
export function RegionChart({ data, isLoading = false }: RegionChartProps) {
  const router = useRouter();

  // 로딩 상태
  if (isLoading || !data) {
    return (
      <div
        className="w-full border rounded-lg p-6 bg-card min-h-[400px] flex items-center justify-center"
        role="status"
        aria-label="지역별 분포 차트 로딩 중"
        aria-busy="true"
      >
        <div className="w-full space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  // 데이터가 빈 배열인 경우
  if (data.length === 0) {
    return (
      <div
        className="w-full border rounded-lg p-6 bg-card min-h-[400px] flex items-center justify-center"
        role="status"
        aria-label="지역별 분포 데이터 없음"
      >
        <p className="text-sm text-muted-foreground">
          지역별 통계 데이터가 없습니다.
        </p>
      </div>
    );
  }

  // 상위 10개 지역만 표시 (또는 전체)
  const displayData = data.slice(0, 10);

  // recharts 형식으로 데이터 변환
  const chartData = displayData.map((item) => ({
    regionName: item.regionName,
    count: item.count,
    regionCode: item.regionCode,
  }));

  // 차트 설정
  const chartConfig = {
    count: {
      label: "관광지 개수",
      color: "hsl(var(--chart-1))",
    },
  };

  // 바 클릭 핸들러
  const handleBarClick = (data: unknown, index: number) => {
    if (!data || typeof data !== "object") return;
    const payload = data as { regionCode?: string };
    if (!payload.regionCode) return;
    // 해당 지역의 관광지 목록 페이지로 이동
    router.push(`/?areaCode=${payload.regionCode}`);
  };

  return (
    <div
      className="w-full border rounded-lg p-4 md:p-6 bg-card"
      role="region"
      aria-label="지역별 관광지 분포 차트"
      aria-labelledby="region-chart-heading"
    >
      <ChartContainer config={chartConfig} className="min-h-[300px] md:min-h-[400px]">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60, // X축 레이블 회전을 위한 여백
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="regionName"
            angle={-45}
            textAnchor="end"
            height={80}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => formatNumber(value)}
            className="text-xs"
          />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload[0]) return null;

              const data = payload[0].payload as {
                regionName: string;
                count: number;
              };

              return (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={data.regionName}
                  formatter={(value) => [
                    `${formatNumber(Number(value))}개`,
                    "관광지 개수",
                  ]}
                />
              );
            }}
          />
          <Bar
            dataKey="count"
            fill="hsl(var(--chart-1))"
            radius={[4, 4, 0, 0]}
            className="cursor-pointer transition-opacity hover:opacity-80"
            aria-label="지역별 관광지 개수"
            onClick={handleBarClick}
          />
        </BarChart>
      </ChartContainer>

      {/* 접근성을 위한 데이터 테이블 (스크린 리더용) */}
      <div className="sr-only" role="table" aria-label="지역별 관광지 개수 데이터">
        <div role="row">
          <div role="columnheader">지역명</div>
          <div role="columnheader">관광지 개수</div>
        </div>
        {chartData.map((item) => (
          <div key={item.regionCode} role="row">
            <div role="cell">{item.regionName}</div>
            <div role="cell">{formatNumber(item.count)}개</div>
          </div>
        ))}
      </div>
    </div>
  );
}


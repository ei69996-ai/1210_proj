/**
 * @file type-chart.tsx
 * @description 타입별 관광지 분포 차트 컴포넌트
 *
 * 통계 대시보드 페이지에서 타입별 관광지 분포를 Donut Chart로 시각화하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 타입별 관광지 개수를 Donut Chart로 표시
 * 2. 섹션 클릭 시 해당 타입의 관광지 목록 페이지로 이동
 * 3. 호버 시 타입명, 개수, 비율 표시 (Tooltip)
 * 4. 반응형 디자인 (모바일/태블릿/데스크톱)
 * 5. 다크/라이트 모드 지원
 * 6. 로딩 상태 (Skeleton UI)
 * 7. 접근성 개선 (ARIA 라벨, 스크린 리더용 데이터 테이블)
 *
 * @dependencies
 * - recharts: PieChart, Pie, Cell, ResponsiveContainer
 * - components/ui/chart: ChartContainer, ChartTooltip, ChartTooltipContent
 * - components/ui/skeleton: Skeleton 컴포넌트
 * - lib/types/stats: TypeStats 타입
 * - next/navigation: useRouter 훅
 */

"use client";

import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { TypeStats } from "@/lib/types/stats";

interface TypeChartProps {
  data: TypeStats[] | null;
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
 * 백분율 계산 함수
 * @param value 현재 값
 * @param total 전체 값
 * @returns 백분율 (소수점 첫째 자리까지)
 */
function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10;
}

/**
 * 차트 색상 배열 (chart-1 ~ chart-8)
 */
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
] as const;

/**
 * 타입별 관광지 분포 차트 컴포넌트
 */
export function TypeChart({ data, isLoading = false }: TypeChartProps) {
  const router = useRouter();

  // 로딩 상태
  if (isLoading || !data) {
    return (
      <div
        className="w-full border rounded-lg p-6 bg-card min-h-[400px] flex items-center justify-center"
        role="status"
        aria-label="타입별 분포 차트 로딩 중"
        aria-busy="true"
      >
        <div className="w-full space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-[300px] w-full rounded-full" />
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
        aria-label="타입별 분포 데이터 없음"
      >
        <p className="text-sm text-muted-foreground">
          타입별 통계 데이터가 없습니다.
        </p>
      </div>
    );
  }

  // 전체 관광지 수 계산 (비율 계산용)
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  // recharts 형식으로 데이터 변환 (비율 포함)
  const chartData = data.map((item, index) => ({
    typeId: item.typeId,
    typeName: item.typeName,
    count: item.count,
    percentage: calculatePercentage(item.count, totalCount),
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  // 차트 설정
  const chartConfig = chartData.reduce(
    (acc, item, index) => {
      acc[item.typeId] = {
        label: item.typeName,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>
  );

  // 섹션 클릭 핸들러
  const handlePieClick = (data: unknown) => {
    if (!data || typeof data !== "object") return;
    const payload = data as { typeId?: string };
    if (!payload.typeId) return;
    // 해당 타입의 관광지 목록 페이지로 이동
    router.push(`/?contentTypeId=${payload.typeId}`);
  };

  return (
    <div
      className="w-full border rounded-lg p-4 md:p-6 bg-card"
      role="region"
      aria-label="타입별 관광지 분포 차트"
      aria-labelledby="type-chart-heading"
    >
      <ChartContainer config={chartConfig} className="min-h-[300px] md:min-h-[400px]">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="typeName"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            paddingAngle={2}
            className="cursor-pointer transition-opacity hover:opacity-80"
            onClick={handlePieClick}
            label={({ typeName, percentage }) =>
              `${typeName} (${percentage}%)`
            }
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload[0]) return null;

              const data = payload[0].payload as {
                typeName: string;
                count: number;
                percentage: number;
              };

              return (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={data.typeName}
                  formatter={(value) => [
                    `${formatNumber(Number(value))}개 (${data.percentage}%)`,
                    "관광지 개수",
                  ]}
                />
              );
            }}
          />
        </PieChart>
      </ChartContainer>

      {/* 접근성을 위한 데이터 테이블 (스크린 리더용) */}
      <div
        className="sr-only"
        role="table"
        aria-label="타입별 관광지 개수 데이터"
      >
        <div role="row">
          <div role="columnheader">타입명</div>
          <div role="columnheader">관광지 개수</div>
          <div role="columnheader">비율</div>
        </div>
        {chartData.map((item) => (
          <div key={item.typeId} role="row">
            <div role="cell">{item.typeName}</div>
            <div role="cell">{formatNumber(item.count)}개</div>
            <div role="cell">{item.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}


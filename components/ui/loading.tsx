/**
 * @file loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 데이터 로딩 중 표시할 스피너 컴포넌트입니다.
 * lucide-react의 Loader2 아이콘을 사용합니다.
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  /**
   * 크기 옵션
   * - sm: 작은 크기 (16px)
   * - md: 중간 크기 (24px, 기본값)
   * - lg: 큰 크기 (32px)
   */
  size?: "sm" | "md" | "lg";
  /**
   * 추가 텍스트 표시
   */
  text?: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Loading({ size = "md", text, className }: LoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}


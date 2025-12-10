/**
 * @file error.tsx
 * @description 에러 메시지 컴포넌트
 *
 * 에러 발생 시 표시할 컴포넌트입니다.
 * 에러 아이콘, 메시지, 재시도 버튼을 제공합니다.
 */

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorProps {
  /**
   * 에러 메시지
   */
  message?: string;
  /**
   * 재시도 버튼 표시 여부
   */
  showRetry?: boolean;
  /**
   * 재시도 버튼 클릭 핸들러
   */
  onRetry?: () => void;
  /**
   * 추가 클래스명
   */
  className?: string;
}

export function Error({
  message = "오류가 발생했습니다.",
  showRetry = false,
  onRetry,
  className,
}: ErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8",
        className
      )}
    >
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-center text-sm text-muted-foreground">{message}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          다시 시도
        </Button>
      )}
    </div>
  );
}


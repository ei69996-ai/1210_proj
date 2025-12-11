/**
 * @file share-button.tsx
 * @description 관광지 상세페이지 공유 버튼 컴포넌트
 *
 * 관광지 상세페이지의 URL을 클립보드에 복사하는 기능을 제공합니다.
 * 사용자가 관광지 정보를 쉽게 공유할 수 있도록 합니다.
 *
 * 주요 기능:
 * 1. 현재 페이지 URL 복사 (클립보드 API)
 * 2. 복사 완료 토스트 알림
 * 3. 복사 상태 표시 (아이콘 변경)
 * 4. HTTPS 환경 확인
 *
 * @dependencies
 * - next/navigation: usePathname 훅 (현재 경로 가져오기)
 * - sonner: toast 함수 (알림)
 * - lucide-react: Share 아이콘
 * - components/ui/button: Button 컴포넌트
 */

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  /** 버튼 크기 (기본값: "default") */
  size?: "default" | "sm" | "lg" | "icon";
  /** 버튼 스타일 (기본값: "outline") */
  variant?: "default" | "outline" | "ghost" | "secondary";
  /** 추가 클래스명 */
  className?: string;
}

export function ShareButton({
  size = "default",
  variant = "outline",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  // 현재 페이지의 전체 URL 생성
  const getCurrentUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    // 서버 사이드에서는 pathname만 반환 (클라이언트에서 완전한 URL 생성)
    return pathname;
  };

  // URL 복사 기능
  const handleShare = async () => {
    try {
      const url = getCurrentUrl();

      // 클립보드 API 사용 가능 여부 확인
      if (!navigator.clipboard) {
        // 클립보드 API를 사용할 수 없는 경우 (HTTP 환경 등)
        // 대체 방법: 텍스트 영역을 생성하여 복사
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          toast.success("URL이 복사되었습니다.");
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          toast.error("URL 복사에 실패했습니다.");
          console.error("URL 복사 실패:", err);
        } finally {
          document.body.removeChild(textArea);
        }
        return;
      }

      // 클립보드 API 사용
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("URL이 복사되었습니다.");
      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("URL 복사에 실패했습니다.");
      console.error("URL 복사 실패:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={`min-h-[44px] sm:min-h-[36px] ${className || ""}`}
      aria-label={copied ? "URL 복사됨" : "URL 복사하기"}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          <span>복사됨</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span>공유</span>
        </>
      )}
    </Button>
  );
}


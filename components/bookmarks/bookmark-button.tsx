/**
 * @file bookmark-button.tsx
 * @description 관광지 상세페이지 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크(즐겨찾기)에 추가하거나 제거하는 기능을 제공합니다.
 * 인증된 사용자만 북마크를 사용할 수 있으며, Supabase bookmarks 테이블에 저장됩니다.
 *
 * 주요 기능:
 * 1. 북마크 상태 확인 (초기 로딩 시 Supabase 조회)
 * 2. 북마크 추가/제거 기능
 * 3. 인증된 사용자 확인 (Clerk)
 * 4. 로그인하지 않은 경우: 로그인 유도
 * 5. 로딩 상태 표시
 * 6. 에러 처리 및 토스트 알림
 *
 * @dependencies
 * - @clerk/nextjs: useAuth 훅 (인증 확인)
 * - @supabase/supabase-js: Supabase 클라이언트
 * - lib/supabase/clerk-client: useClerkSupabaseClient 훅
 * - lib/api/supabase-api: 북마크 관련 함수들
 * - sonner: toast 함수 (알림)
 * - lucide-react: Star 아이콘
 * - components/ui/button: Button 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import {
  getBookmark,
  addBookmark,
  removeBookmark,
} from "@/lib/api/supabase-api";

interface BookmarkButtonProps {
  /** 관광지 ID (한국관광공사 API contentid) */
  contentId: string;
  /** 버튼 크기 (기본값: "default") */
  size?: "default" | "sm" | "lg" | "icon";
  /** 버튼 스타일 (기본값: "outline") */
  variant?: "default" | "outline" | "ghost" | "secondary";
  /** 추가 클래스명 */
  className?: string;
}

export function BookmarkButton({
  contentId,
  size = "default",
  variant = "outline",
  className,
}: BookmarkButtonProps) {
  const { isLoaded, userId } = useAuth();
  const supabase = useClerkSupabaseClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // 초기 북마크 상태 확인
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      // 인증 상태가 로드되지 않았거나, 로그인하지 않은 경우
      if (!isLoaded || !userId) {
        setIsChecking(false);
        return;
      }

      try {
        setIsChecking(true);
        const bookmark = await getBookmark(supabase, userId, contentId);
        setIsBookmarked(!!bookmark);
      } catch (error) {
        console.error("북마크 상태 확인 실패:", error);
        // 에러가 발생해도 북마크 상태는 false로 설정
        setIsBookmarked(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBookmarkStatus();
  }, [isLoaded, userId, contentId, supabase]);

  // 북마크 토글 처리
  const handleToggleBookmark = async () => {
    // 인증 상태 확인
    if (!isLoaded) {
      toast.error("인증 상태를 확인하는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!userId) {
      toast.error("북마크 기능을 사용하려면 로그인이 필요합니다.", {
        action: {
          label: "로그인",
          onClick: () => {
            // Clerk 로그인 페이지로 이동 (또는 SignIn 컴포넌트 표시)
            window.location.href = "/sign-in";
          },
        },
      });
      return;
    }

    // 로딩 중이면 무시
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      if (isBookmarked) {
        // 북마크 제거
        await removeBookmark(supabase, userId, contentId);
        setIsBookmarked(false);
        toast.success("북마크에서 제거되었습니다.");
      } else {
        // 북마크 추가
        await addBookmark(supabase, userId, contentId);
        setIsBookmarked(true);
        toast.success("북마크에 추가되었습니다.");
      }
    } catch (error) {
      console.error("북마크 처리 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "북마크 처리 중 오류가 발생했습니다.";

      // 사용자 동기화 관련 에러인 경우
      if (errorMessage.includes("User not found")) {
        toast.error("사용자 정보를 동기화하는 중입니다. 잠시 후 다시 시도해주세요.", {
          duration: 5000,
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중이거나 북마크 상태 확인 중인 경우
  if (isChecking) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={`min-h-[44px] sm:min-h-[36px] ${className || ""}`}
        aria-label="북마크 상태 확인 중"
        aria-busy="true"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="sr-only">북마크 상태 확인 중</span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={`min-h-[44px] sm:min-h-[36px] ${className || ""}`}
      aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
      aria-pressed={isBookmarked}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">처리 중</span>
        </>
      ) : (
        <>
          <Star
            className={`h-4 w-4 ${isBookmarked ? "fill-yellow-400 text-yellow-400" : ""}`}
            aria-hidden="true"
          />
          <span>{isBookmarked ? "북마크됨" : "북마크"}</span>
        </>
      )}
    </Button>
  );
}


/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 검색 키워드를 입력하고 검색을 실행하는 컴포넌트입니다.
 * 검색 상태는 URL 쿼리 파라미터로 관리되어 공유 가능한 링크를 제공합니다.
 *
 * 주요 기능:
 * 1. 검색 키워드 입력
 * 2. 엔터 키 또는 검색 버튼 클릭으로 검색 실행
 * 3. URL 쿼리 파라미터와 동기화
 * 4. 검색어 초기화 버튼
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - components/ui/input: Input 컴포넌트
 * - components/ui/button: Button 컴포넌트
 * - lucide-react: Search, X 아이콘
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TourSearchProps {
  /** 검색창 너비 클래스 (기본값: "w-full") */
  className?: string;
  /** 검색 아이콘 표시 여부 (기본값: true) */
  showIcon?: boolean;
  /** 검색 버튼 표시 여부 (기본값: false) */
  showButton?: boolean;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
}

export function TourSearch({
  className = "w-full",
  showIcon = true,
  showButton = false,
  placeholder = "관광지 검색...",
}: TourSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState("");

  // URL에서 검색어 읽기
  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";
    setKeyword(urlKeyword);
  }, [searchParams]);

  // 검색 실행 함수
  const handleSearch = useCallback(
    (searchKeyword: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchKeyword && searchKeyword.trim() !== "") {
        params.set("keyword", searchKeyword.trim());
      } else {
        params.delete("keyword");
      }

      // 정렬 옵션은 항상 유지 (기본값: latest)
      if (!params.has("sort")) {
        params.set("sort", "latest");
      }

      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  // 검색 실행 (엔터 키 또는 버튼 클릭)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(keyword);
  };

  // 검색어 초기화
  const handleClear = () => {
    setKeyword("");
    handleSearch("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      role="search"
      aria-label="관광지 검색"
    >
      <div className="relative flex items-center gap-2">
        {/* 검색 아이콘 */}
        {showIcon && (
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10"
            aria-hidden="true"
          />
        )}

        {/* 검색 입력창 */}
        <Input
          type="search"
          placeholder={placeholder}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className={showIcon ? "pl-10 pr-10" : "pr-10"}
          aria-label="관광지 검색어 입력"
          aria-describedby={keyword ? "search-clear-hint" : undefined}
        />

        {/* 검색어 초기화 버튼 (X) */}
        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            aria-label="검색어 초기화"
            id="search-clear-hint"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* 검색 버튼 (선택 사항) */}
        {showButton && (
          <Button type="submit" size="sm" aria-label="검색 실행">
            검색
          </Button>
        )}
      </div>
    </form>
  );
}


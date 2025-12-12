/**
 * @file Navbar.tsx
 * @description 네비게이션 바 컴포넌트
 *
 * 앱의 상단 네비게이션을 담당하는 컴포넌트입니다.
 * 로고, 검색창, 메뉴 링크, 로그인/로그아웃 버튼을 포함합니다.
 *
 * 주요 기능:
 * 1. 로고 클릭 시 홈으로 이동
 * 2. 데스크톱/모바일 반응형 레이아웃
 * 3. 검색창 연동 (TourSearch 컴포넌트)
 * 4. Clerk 인증 연동 (로그인/로그아웃/프로필)
 * 5. 네비게이션 링크 (홈, 통계, 북마크)
 *
 * @dependencies
 * - @clerk/nextjs: 인증 컴포넌트 (SignedIn, SignedOut, SignInButton, UserButton)
 * - components/tour-search: 검색창 컴포넌트
 */

"use client";

import { Suspense, lazy } from "react";
import { SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TourSearch } from "@/components/tour-search";

// ThemeToggle을 동적 import로 로드 (클라이언트 사이드에서만)
const ThemeToggle = lazy(() => import("@/components/theme-toggle").then((mod) => ({ default: mod.ThemeToggle })));

const Navbar = () => {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 max-w-7xl mx-auto px-4">
        {/* 로고 */}
        <Link href="/" className="text-2xl font-bold">
          My Trip
        </Link>

        {/* 검색창 (중앙) - 데스크톱에서만 표시 */}
        <div className="flex-1 max-w-md mx-4 hidden md:flex">
          <Suspense fallback={<div className="w-full h-10 bg-muted rounded-md animate-pulse" />}>
            <TourSearch placeholder="관광지 검색..." />
          </Suspense>
        </div>

        {/* 네비게이션 링크 및 로그인 */}
        <div className="flex gap-4 items-center">
          <nav className="hidden md:flex gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              홈
            </Link>
            <Link
              href="/stats"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              통계
            </Link>
            <Link
              href="/bookmarks"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              북마크
            </Link>
          </nav>
          <Suspense fallback={<div className="h-9 w-9" />}>
            <ThemeToggle />
          </Suspense>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">로그인</Button>
            </SignInButton>
          </SignedOut>
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default Navbar;

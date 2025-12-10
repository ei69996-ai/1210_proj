"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TourSearch } from "@/components/tour-search";

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
          <TourSearch placeholder="관광지 검색..." />
        </div>

        {/* 모바일 검색 버튼 (선택 사항 - 향후 구현) */}
        {/* <div className="md:hidden">
          <Button variant="ghost" size="icon" aria-label="검색">
            <Search className="h-5 w-5" />
          </Button>
        </div> */}

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
            <SignedIn>
              <Link
                href="/bookmarks"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                북마크
              </Link>
            </SignedIn>
          </nav>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">로그인</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

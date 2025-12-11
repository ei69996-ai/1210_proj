/**
 * @file page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 페이지입니다.
 * 인증된 사용자만 접근 가능하며, 로그인하지 않은 경우 로그인 유도 UI를 표시합니다.
 *
 * 주요 기능:
 * 1. Clerk 인증 확인 (Server Component)
 * 2. 로그인하지 않은 경우 로그인 유도
 * 3. 북마크 목록 컴포넌트 렌더링
 *
 * @dependencies
 * - @clerk/nextjs/server: auth() 함수
 * - components/bookmarks/bookmark-list: 북마크 목록 컴포넌트
 */

import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "북마크 | My Trip",
  description: "내가 북마크한 관광지 목록을 확인하세요.",
  openGraph: {
    title: "북마크 | My Trip",
    description: "내가 북마크한 관광지 목록을 확인하세요.",
    type: "website",
  },
};

export default async function BookmarksPage() {
  // Clerk 인증 확인
  const { userId } = await auth();

  // 로그인하지 않은 경우 로그인 유도 UI 표시
  if (!userId) {
    return (
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                북마크 기능을 사용하려면
                <br />
                로그인이 필요합니다
              </h1>
              <p className="text-lg text-muted-foreground">
                관광지를 북마크하고 나중에 쉽게 찾아보세요.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <SignInButton mode="modal">
                <Button size="lg" className="w-full sm:w-auto">
                  로그인하기
                </Button>
              </SignInButton>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link href="/">홈으로 돌아가기</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 인증된 경우 북마크 목록 컴포넌트 렌더링
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="space-y-8 md:space-y-10">
        {/* 페이지 제목 */}
        <div className="space-y-2">
          <h1
            id="bookmarks-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            내 북마크
          </h1>
          <p className="text-lg text-muted-foreground">
            북마크한 관광지 목록을 확인하고 관리하세요.
          </p>
        </div>

        {/* 북마크 목록 컴포넌트 */}
        <BookmarkList />
      </div>
    </main>
  );
}


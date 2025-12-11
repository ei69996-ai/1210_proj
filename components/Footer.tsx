/**
 * @file Footer.tsx
 * @description 푸터 컴포넌트
 *
 * 홈페이지 하단에 표시되는 푸터 컴포넌트입니다.
 * 프로젝트 정보, 링크 섹션, 저작권 정보를 포함합니다.
 */

"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 프로젝트 정보 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">My Trip</h3>
            <p className="text-sm text-muted-foreground">
              전국 관광지 정보를 한눈에 검색하고 확인하세요
            </p>
          </div>

          {/* 링크 섹션 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold">메뉴</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                홈
              </Link>
              <Link
                href="/stats"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                통계
              </Link>
              <Link
                href="/bookmarks"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                북마크
              </Link>
            </nav>
          </div>

          {/* 데이터 출처 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold">데이터 출처</h4>
            <p className="text-sm text-muted-foreground">
              한국관광공사
              <br />
              공공데이터포털
            </p>
          </div>

          {/* 저작권 정보 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold">정보</h4>
            <p className="text-sm text-muted-foreground">
              © 2025 My Trip.
              <br />
              All rights reserved.
            </p>
          </div>
        </div>

        {/* 하단 구분선 및 추가 정보 */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-xs text-center text-muted-foreground">
            본 서비스는 한국관광공사에서 제공하는 공공데이터를 활용하여
            제작되었습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}


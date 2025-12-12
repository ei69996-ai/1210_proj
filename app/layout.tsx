import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PWAProvider } from "@/components/providers/pwa-provider";
import { WebVitalsProvider } from "@/components/providers/web-vitals-provider";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { FeedbackButton } from "@/components/feedback/feedback-button";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * 기본 URL 생성 (환경변수 기반)
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "My Trip - 한국 관광지 정보",
    template: "%s | My Trip",
  },
  description: "전국 관광지 정보를 한눈에 검색하고 확인하세요. 지역별, 타입별 필터링과 지도 연동으로 편리하게 관광지를 찾아보세요.",
  keywords: ["관광지", "여행", "한국", "관광정보", "여행지", "명소", "한국관광공사"],
  authors: [{ name: "My Trip" }],
  creator: "My Trip",
  publisher: "My Trip",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: baseUrl,
    siteName: "My Trip",
    title: "My Trip - 한국 관광지 정보",
    description: "전국 관광지 정보를 한눈에 검색하고 확인하세요. 지역별, 타입별 필터링과 지도 연동으로 편리하게 관광지를 찾아보세요.",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "My Trip - 한국 관광지 정보",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Trip - 한국 관광지 정보",
    description: "전국 관광지 정보를 한눈에 검색하고 확인하세요. 지역별, 타입별 필터링과 지도 연동으로 편리하게 관광지를 찾아보세요.",
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        // Tailwind CSS 4 호환성을 위한 필수 설정
        cssLayerName: "clerk",
      }}
    >
      <html lang="ko" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider>
            <PWAProvider>
              <WebVitalsProvider>
                <SyncUserProvider>
                  <OfflineIndicator />
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                  <FeedbackButton />
                  <Toaster />
                </SyncUserProvider>
              </WebVitalsProvider>
            </PWAProvider>
          </ThemeProvider>
          {/* 네이버 지도 API 스크립트 로드 */}
          {process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID && (
            <Script
              src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
              strategy="afterInteractive"
            />
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}

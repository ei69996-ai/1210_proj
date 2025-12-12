/**
 * @file manifest.ts
 * @description PWA Manifest 파일
 *
 * 웹 앱을 모바일 홈 화면에 추가할 수 있도록 설정하는 Manifest 파일입니다.
 * Next.js 15의 MetadataRoute.Manifest 타입을 사용합니다.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */

import type { MetadataRoute } from "next";

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

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Trip - 한국 관광지 정보",
    short_name: "My Trip",
    description: "전국 관광지 정보를 한눈에 검색하고 확인하세요. 지역별, 타입별 필터링과 지도 연동으로 편리하게 관광지를 찾아보세요.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["travel", "tourism", "lifestyle"],
    lang: "ko",
    dir: "ltr",
    scope: "/",
  };
}


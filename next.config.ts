import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [25, 50, 75, 85], // 필요한 값들만 넣기
    remotePatterns: [
      { 
        protocol: "https",
        hostname: "img.clerk.com" 
      },
      // 한국관광공사 이미지 도메인 (http와 https 모두 허용)
      { 
        protocol: "http",
        hostname: "tong.visitkorea.or.kr" 
      },
      { 
        protocol: "https",
        hostname: "tong.visitkorea.or.kr" 
      },
      // 네이버 지도 이미지 도메인
      { 
        protocol: "https",
        hostname: "map.pstatic.net" 
      },
      { 
        protocol: "https",
        hostname: "ssl.pstatic.net" 
      },
    ],
  },
};

// 번들 분석 도구 설정 (개발 환경에서만 사용)
// @next/bundle-analyzer는 선택적 의존성으로 설치 필요
let config = nextConfig;

if (process.env.ANALYZE === "true") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: true,
    });
    config = withBundleAnalyzer(nextConfig);
  } catch (error) {
    console.warn("@next/bundle-analyzer가 설치되지 않았습니다. 'pnpm add -D @next/bundle-analyzer'를 실행하세요.");
  }
}

export default config;

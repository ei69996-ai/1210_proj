import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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

export default nextConfig;

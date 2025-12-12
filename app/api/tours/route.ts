/**
 * @file route.ts
 * @description 관광지 목록 API Route
 *
 * 클라이언트 사이드에서 무한 스크롤을 위해 사용하는 API Route입니다.
 * getAreaBasedList와 searchKeyword 함수를 래핑하여 JSON 응답을 반환합니다.
 *
 * @dependencies
 * - lib/api/tour-api.ts: getAreaBasedList, searchKeyword 함수
 */

import { NextRequest, NextResponse } from "next/server";
import { getAreaBasedList, searchKeyword } from "@/lib/api/tour-api";
import { createErrorResponse, logError } from "@/lib/utils/error-handler";

// API Route 캐싱 설정
// 관광지 목록: 30분, 검색 결과: 10분
export const revalidate = 600; // 10분 (검색 결과 기준)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword");
    const areaCode = searchParams.get("areaCode") || undefined;
    const contentTypeId = searchParams.get("contentTypeId") || undefined;
    const numOfRows = parseInt(searchParams.get("numOfRows") || "20", 10);
    const pageNo = parseInt(searchParams.get("pageNo") || "1", 10);

    // 검증
    if (numOfRows < 1 || numOfRows > 100) {
      const errorResponse = createErrorResponse(
        new Error("numOfRows는 1 이상 100 이하여야 합니다."),
        400
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (pageNo < 1) {
      const errorResponse = createErrorResponse(
        new Error("pageNo는 1 이상이어야 합니다."),
        400
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }

    let result;

    // 검색 모드 vs 일반 모드
    if (keyword && keyword.trim() !== "") {
      // 검색 모드
      result = await searchKeyword(
        keyword.trim(),
        areaCode,
        contentTypeId,
        numOfRows,
        pageNo
      );
    } else {
      // 일반 모드
      result = await getAreaBasedList(
        areaCode,
        contentTypeId,
        numOfRows,
        pageNo
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    logError(error, "app/api/tours/route.ts");
    const errorResponse = createErrorResponse(
      error instanceof Error
        ? error
        : new Error("관광지 목록을 불러오는 중 오류가 발생했습니다."),
      500
    );
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

